const { Schema, model } = require('mongoose');

const PedidoSchema = new Schema({
  usuario_id: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  items: [
    {
      producto_id: {
        type: Schema.Types.ObjectId,
        ref: 'Producto'
      },
      cantidad: Number,
      precio_unitario: Number,
      personalizacion: {
        mensaje: String,
        relleno: String
      }
    }
  ],
  logistica: {
    metodo_envio: String,
    direccion_entrega: {
      calle: String,
      ciudad: String,
      codigo_postal: String,
      referencias:String
    },
    estado: String
  },
  pago: {
    metodo: String,
    estado: String,
    transaccion_id: String
  },
  total: Number
});

module.exports = model('Pedido', PedidoSchema);