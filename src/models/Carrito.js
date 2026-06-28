const { Schema, model } = require('mongoose');

const ItemCarritoSchema = new Schema({
  producto_id: {
    type: Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  precio_unitario: {
    type: Number,
    required: true
  },
  personalizacion_id: {
    type: Schema.Types.ObjectId,
    ref: 'Personalizacion',
    default: null
  }
});

const CarritoSchema = new Schema({
  usuario_id: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true
  },
  items: [ItemCarritoSchema],
  fecha_actualizacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = model('Carrito', CarritoSchema);
