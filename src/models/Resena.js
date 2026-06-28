const { Schema, model } = require('mongoose');

const ResenaSchema = new Schema({
  usuario_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  producto_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Producto', 
    required: true 
  },
  calificacion: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comentario: { 
    type: String, 
    required: true, 
    maxlength: 500 
  },
  foto_url: { 
    type: String, 
    default: null 
  },
  verificada: { 
    type: Boolean, 
    default: false 
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = model('Resena', ResenaSchema);