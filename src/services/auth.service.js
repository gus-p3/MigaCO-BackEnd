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
// Paleta alineada al sistema de diseño del frontend:
//   --primary:       #2D006B  (morado oscuro)
//   --secondary:     #560BAD  (violeta medio)
//   --accent:        #7B2CBF  (violeta claro)
//   --neutral-light: #E9D8FD  (lavanda suave)
// Tipografías web-safe: 'Segoe UI' / Arial (los clientes de correo no cargan Google Fonts)

const templateCodigo = (codigo, tipo) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${tipo === '2fa' ? 'Código de verificación' : 'Recuperar contraseña'} — Miga-Co</title>
</head>
<body style="margin:0;padding:0;background-color:#F3EEFF;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">

  <!-- Wrapper externo -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#F3EEFF;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Tarjeta principal -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:560px;background-color:#ffffff;border-radius:20px;
                 box-shadow:0 8px 40px rgba(45,0,107,0.12),0 2px 8px rgba(0,0,0,0.06);
                 overflow:hidden;">

          <!-- ── HEADER con gradiente morado ── -->
          <tr>
            <td align="center"
              style="background:linear-gradient(135deg,#2D006B 0%,#560BAD 60%,#7B2CBF 100%);
                     padding:36px 40px 32px;text-align:center;">

              <!-- Logo -->
              <div style="margin-bottom:6px;">
                <span style="font-family:'Segoe UI','Trebuchet MS',Arial,sans-serif;
                             font-size:2.4rem;font-weight:900;letter-spacing:-0.02em;
                             color:#ffffff;line-height:1;">
                  Miga
                </span><span style="font-family:'Segoe UI','Trebuchet MS',Arial,sans-serif;
                             font-size:2.4rem;font-weight:400;font-style:italic;
                             color:#E9D8FD;line-height:1;">
                  -Co
                </span>
              </div>

              <!-- Tagline -->
              <p style="margin:0;font-size:0.65rem;letter-spacing:0.25em;
                        text-transform:uppercase;color:#C4A8F5;font-weight:600;">
                Pastelería artesanal
              </p>
            </td>
          </tr>

          <!-- ── CUERPO ── -->
          <tr>
            <td style="padding:40px 44px 32px;">

              <!-- Ícono contextual -->
              <div style="text-align:center;margin-bottom:20px;">
                <div style="display:inline-block;width:60px;height:60px;line-height:60px;
                            border-radius:50%;background:#E9D8FD;font-size:1.8rem;
                            text-align:center;">
                  ${tipo === '2fa' ? '🔐' : '🔑'}
                </div>
              </div>

              <!-- Título -->
              <h1 style="margin:0 0 10px;text-align:center;
                         font-family:'Segoe UI','Trebuchet MS',Arial,sans-serif;
                         font-size:1.6rem;font-weight:800;color:#2D006B;line-height:1.2;">
                ${tipo === '2fa' ? 'Código de verificación' : 'Recuperar contraseña'}
              </h1>

              <!-- Descripción -->
              <p style="margin:0 0 28px;text-align:center;font-size:0.97rem;
                        color:#560BAD;line-height:1.7;opacity:0.9;">
                ${tipo === '2fa'
                  ? 'Usa este código para completar tu inicio de sesión en <strong>Miga-Co</strong>.'
                  : 'Ingresa este código para restablecer tu contraseña en <strong>Miga-Co</strong>.'}
              </p>

              <!-- ── CAJA DEL CÓDIGO ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <div style="display:inline-block;background:linear-gradient(135deg,#2D006B,#560BAD);
                                border-radius:14px;padding:20px 40px;
                                box-shadow:0 4px 20px rgba(45,0,107,0.35);">
                      <span style="font-family:'Segoe UI','Courier New',monospace;
                                   font-size:2.8rem;font-weight:900;
                                   color:#ffffff;letter-spacing:0.55rem;
                                   display:block;line-height:1;">
                        ${codigo}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Aviso de expiración -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#F3EEFF;border-radius:10px;
                             border-left:4px solid #7B2CBF;padding:14px 18px;">
                    <p style="margin:0;font-size:0.83rem;color:#2D006B;line-height:1.6;">
                      ⏱ Este código expira en <strong>10 minutos</strong>.
                      Si no solicitaste esto, puedes ignorar este correo de forma segura.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── DIVISOR ── -->
          <tr>
            <td style="padding:0 44px;">
              <hr style="border:none;border-top:1px solid #E9D8FD;margin:0;" />
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="padding:24px 44px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:0.75rem;color:#7B2CBF;font-weight:600;
                        letter-spacing:0.15em;text-transform:uppercase;">
                Miga-Co · Pastelería artesanal
              </p>
              <p style="margin:0;font-size:0.7rem;color:#a78bca;line-height:1.5;">
                Este es un correo automático, por favor no respondas a este mensaje.<br/>
                © ${new Date().getFullYear()} Miga-Co. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Tarjeta principal -->

      </td>
    </tr>
  </table>

</body>
</html>
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