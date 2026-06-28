const Resena = require('../models/Resena');

class ResenaService {

  async crearResena(data) {
    const resena = new Resena(data);
    return await resena.save();
  }

  async getResenasPorProducto(producto_id) {
    return await Resena.find({ producto_id })
      .populate('usuario_id', 'nombre')
      .sort({ fecha: -1 });
  }

  async getPromedioCalificacion(producto_id) {
    const result = await Resena.aggregate([
      { $match: { producto_id: producto_id } },
      { $group: { _id: null, promedio: { $avg: '$calificacion' }, total: { $sum: 1 } } }
    ]);
    return result[0] || { promedio: 0, total: 0 };
  }

  async eliminarResena(resena_id) {
    return await Resena.findByIdAndDelete(resena_id);
  }
}

module.exports = new ResenaService();