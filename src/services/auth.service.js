// services/auth.service.js
const Usuario = require('../models/Usuario');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const axios   = require('axios');

// ── Helpers ───────────────────────────────────────────────────────────────
const generarCodigo = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generarToken = (payload, expira = '7d') =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expira });

// ── Enviar email con Brevo usando SOLO axios ─────────────────────────────
const enviarEmail = async (destinatario, asunto, html) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          email: process.env.BREVO_SENDER_EMAIL || 'migaco@migaco.mx',
          name: process.env.BREVO_SENDER_NAME || 'Miga-Co 🎂'
        },
        to: [{ email: destinatario }],
        subject: asunto,
        htmlContent: html
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('✅ Email enviado:', response.data.messageId);
    return response.data;
  } catch (error) {
    console.error('❌ Error enviando email:', error.response?.data || error.message);
    // No lanzamos error para no interrumpir el flujo
  }
};

// ── Templates de email ────────────────────────────────────────────────────
const templateCodigo = (codigo, tipo) => `
  <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;background:#E8F4DC;padding:2rem;border-radius:16px;">
    <h1 style="font-family:Georgia,serif;color:#728156;font-size:2rem;margin-bottom:0.5rem;">
      Miga<em style="color:#88976C;">-Co</em>
    </h1>
    <p style="color:#88976C;font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:2rem;">
      Pastelería artesanal
    </p>
    <h2 style="color:#728156;font-size:1.3rem;margin-bottom:1rem;">
      ${tipo === '2fa' ? 'Código de verificación' : 'Recuperar contraseña'}
    </h2>
    <p style="color:#88976C;font-size:1rem;line-height:1.6;margin-bottom:1.5rem;">
      ${tipo === '2fa'
        ? 'Usa este código para completar tu inicio de sesión:'
        : 'Ingresa este código para restablecer tu contraseña:'}
    </p>
    <div style="background:#728156;color:#E8F4DC;font-size:2.5rem;font-weight:700;letter-spacing:0.5rem;text-align:center;padding:1.2rem;border-radius:12px;margin-bottom:1.5rem;">
      ${codigo}
    </div>
    <p style="color:#B6C99C;font-size:0.82rem;line-height:1.6;">
      Este código expira en <strong>10 minutos</strong>. Si no solicitaste esto, ignora este correo.
    </p>
    <hr style="border:none;border-top:1px solid #CFE1BB;margin:1.5rem 0;">
    <p style="color:#B6C99C;font-size:0.72rem;text-align:center;">
      © Miga-Co · Pastelería artesanal
    </p>
  </div>
`;

// ── Auth Service ──────────────────────────────────────────────────────────
class AuthService {

  // ── Registro ─────────────────────────────────────────────────────────
  async registrar({ nombre, email, password }) {
    const existe = await Usuario.findOne({ email });
    if (existe) throw new Error('El email ya está registrado');

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const usuario = await Usuario.create({ nombre, email, password_hash });

    const token = generarToken({ id: usuario._id, role: usuario.role });
    return { token, usuario: { id: usuario._id, nombre, email, role: usuario.role } };
  }

  // ── Login (con 2FA opcional) ─────────────────────────────────────────
  async login(email, password) {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) throw new Error('Credenciales incorrectas');

    const valida = await usuario.compararPassword(password);
    if (!valida) throw new Error('Credenciales incorrectas');

    if (usuario.dos_factor?.activo) {
      const codigo = generarCodigo();
      const expira = new Date(Date.now() + 10 * 60 * 1000);

      usuario.dos_factor.codigo_temp    = codigo;
      usuario.dos_factor.codigo_expira  = expira;
      await usuario.save();

      await enviarEmail(
        usuario.email,
        'Tu código de acceso — Miga-Co',
        templateCodigo(codigo, '2fa')
      );

      return { requiere_2fa: true, email: usuario.email };
    }

    const token = generarToken({ id: usuario._id, role: usuario.role });
    return {
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, role: usuario.role }
    };
  }

  // ── Verificar código 2FA ─────────────────────────────────────────────
  async verificar2FA(email, codigo) {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) throw new Error('Usuario no encontrado');

    const { codigo_temp, codigo_expira } = usuario.dos_factor || {};

    if (!codigo_temp)                          throw new Error('No hay código pendiente');
    if (new Date() > new Date(codigo_expira))  throw new Error('El código ha expirado');
    if (codigo_temp !== codigo)                throw new Error('Código incorrecto');

    usuario.dos_factor.codigo_temp   = null;
    usuario.dos_factor.codigo_expira = null;
    await usuario.save();

    const token = generarToken({ id: usuario._id, role: usuario.role });
    return {
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, role: usuario.role }
    };
  }

  // ── Activar / desactivar 2FA ─────────────────────────────────────────
  async togglear2FA(usuarioId, activar) {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) throw new Error('Usuario no encontrado');

    if (!usuario.dos_factor) usuario.dos_factor = {};
    usuario.dos_factor.activo = activar;
    await usuario.save();

    return { dos_factor_activo: activar };
  }

  // ── Solicitar recuperación de contraseña ─────────────────────────────
  async solicitarRecuperacion(email) {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return { message: 'Si el correo existe, recibirás un código' };

    const codigo = generarCodigo();
    const expira = new Date(Date.now() + 10 * 60 * 1000);

    usuario.recuperacion = { codigo, expira };
    await usuario.save();

    await enviarEmail(
      email,
      'Recuperar contraseña — Miga-Co',
      templateCodigo(codigo, 'recuperacion')
    );

    return { message: 'Si el correo existe, recibirás un código' };
  }

  // ── Verificar código de recuperación ────────────────────────────────
  async verificarCodigoRecuperacion(email, codigo) {
    const usuario = await Usuario.findOne({ email });
    if (!usuario?.recuperacion?.codigo) throw new Error('No hay solicitud de recuperación');

    if (new Date() > new Date(usuario.recuperacion.expira))
      throw new Error('El código ha expirado. Solicita uno nuevo.');

    if (usuario.recuperacion.codigo !== codigo)
      throw new Error('Código incorrecto');

    const resetToken = generarToken({ id: usuario._id, accion: 'reset' }, '5m');

    usuario.recuperacion.codigo  = null;
    usuario.recuperacion.expira  = null;
    usuario.recuperacion.reset_token = resetToken;
    await usuario.save();

    return { reset_token: resetToken };
  }

  // ── Cambiar contraseña con token de reset ────────────────────────────
  async cambiarPassword(resetToken, nuevaPassword) {
    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      throw new Error('Token inválido o expirado');
    }

    if (payload.accion !== 'reset') throw new Error('Token inválido');

    const usuario = await Usuario.findById(payload.id);
    if (!usuario) throw new Error('Usuario no encontrado');
    if (usuario.recuperacion?.reset_token !== resetToken)
      throw new Error('Token ya utilizado');

    if (nuevaPassword.length < 6)
      throw new Error('La contraseña debe tener al menos 6 caracteres');

    const salt = await bcrypt.genSalt(10);
    usuario.password_hash = await bcrypt.hash(nuevaPassword, salt);
    usuario.recuperacion  = null;
    await usuario.save();

    return { message: 'Contraseña actualizada exitosamente' };
  }
}

module.exports = new AuthService();