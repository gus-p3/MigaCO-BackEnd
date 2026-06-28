const resenaService = require('../services/resena.service');

class ResenaController {

  async crearResena(req, res) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.foto_url = `http://localhost:3000/uploads/${req.file.filename}`;
      }
      const resena = await resenaService.crearResena(data);
      res.status(201).json(resena);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getResenasPorProducto(req, res) {
    try {
      const { productoId } = req.params;
      const resenas = await resenaService.getResenasPorProducto(productoId);
      res.json(resenas);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getPromedio(req, res) {
    try {
      const { productoId } = req.params;
      const promedio = await resenaService.getPromedioCalificacion(productoId);
      res.json(promedio);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async eliminarResena(req, res) {
    try {
      const { resenaId } = req.params;
      await resenaService.eliminarResena(resenaId);
      res.json({ message: 'Reseña eliminada correctamente' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new ResenaController();