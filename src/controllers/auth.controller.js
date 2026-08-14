// controllers/auth.controller.js
const authService = require('../services/auth.service');

class AuthController {

  // ── Registro ────────────────────────────────────────────────────────
  async registrar(req, res) {
    try {
      const { nombre, email, password } = req.body;

      if (!nombre || !email || !password)
        return res.status(400).json({ error: 'Nombre, email y password son requeridos' });

      if (password.length < 6)
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

      const resultado = await authService.registrar({ nombre, email, password });
      res.status(201).json({ message: 'Usuario registrado exitosamente', ...resultado });
    } catch (error) {
      console.error("Error en registrar controller:", error);
      res.status(400).json({ error: error.message, message: error.message });
    }
  }

  // ── Login ────────────────────────────────────────────────────────────
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        return res.status(400).json({ error: 'Email y password son requeridos' });

      const resultado = await authService.login(email, password);

      // Si requiere 2FA el servicio devuelve { requiere_2fa: true, email }
      res.json({ message: resultado.requiere_2fa ? 'Código enviado' : 'Login exitoso', ...resultado });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  // ── Verificar código 2FA ─────────────────────────────────────────────
  async verificar2FA(req, res) {
    try {
      const { email, codigo } = req.body;
      if (!email || !codigo)
        return res.status(400).json({ error: 'Email y código son requeridos' });

      const resultado = await authService.verificar2FA(email, codigo);
      res.json({ message: 'Verificación exitosa', ...resultado });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // ── Activar / desactivar 2FA ─────────────────────────────────────────
  async togglear2FA(req, res) {
    try {
      const { activar } = req.body; // boolean
      const resultado = await authService.togglear2FA(req.usuario.id, activar);
      res.json({ message: `2FA ${activar ? 'activado' : 'desactivado'}`, ...resultado });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // ── Solicitar código de recuperación ────────────────────────────────
  async solicitarRecuperacion(req, res) {
    try {
      const { email } = req.body;
      if (!email)
        return res.status(400).json({ error: 'Email es requerido' });

      const resultado = await authService.solicitarRecuperacion(email);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // ── Verificar código de recuperación ────────────────────────────────
  async verificarCodigoRecuperacion(req, res) {
    try {
      const { email, codigo } = req.body;
      if (!email || !codigo)
        return res.status(400).json({ error: 'Email y código son requeridos' });

      const resultado = await authService.verificarCodigoRecuperacion(email, codigo);
      res.json({ message: 'Código válido', ...resultado });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // ── Cambiar contraseña ───────────────────────────────────────────────
  async cambiarPassword(req, res) {
    try {
      const { reset_token, nueva_password } = req.body;
      if (!reset_token || !nueva_password)
        return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });

      const resultado = await authService.cambiarPassword(reset_token, nueva_password);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();