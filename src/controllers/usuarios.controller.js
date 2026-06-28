const usuarioService = require('../services/usuario.service');

class UsuarioController {
  async obtenerPerfil(req, res) {
    try {
      const usuario = await usuarioService.obtenerPerfil(req.usuario.id);
      res.json(usuario);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async actualizarPerfil(req, res) {
    try {
      const usuario = await usuarioService.actualizarPerfil(
        req.usuario.id, 
        req.body
      );
      res.json({
        message: 'Perfil actualizado exitosamente',
        usuario
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async agregarDireccion(req, res) {
    try {
      const { usuario, direccion } = await usuarioService.agregarDireccion(
        req.usuario.id,
        req.body
      );
      res.json({
        message: 'Dirección agregada exitosamente',
        usuario,
        direccion
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async actualizarDireccion(req, res) {
    try {
      const { usuario, direccion } = await usuarioService.actualizarDireccion(
        req.usuario.id,
        req.params.direccionId,
        req.body
      );
      res.json({
        message: 'Dirección actualizada exitosamente',
        usuario,
        direccion
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async eliminarDireccion(req, res) {
    try {
      const usuario = await usuarioService.eliminarDireccion(
        req.usuario.id,
        req.params.direccionId
      );
      res.json({
        message: 'Dirección eliminada exitosamente',
        usuario
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UsuarioController();