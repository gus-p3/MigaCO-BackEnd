const { Schema, model } = require("mongoose");

const PersonalizacionSchema = new Schema(
  {
    producto_id: {
      type: Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
    },
    usuario_id: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      default: null,
    },
    session_id: {
      type: String,
      required: true,
      trim: true,
    },
    opciones: {
      rellenos: {
        type: [String],
        default: [],
      },
      coberturas: {
        type: [String],
        default: [],
      },
      mensaje: {
        type: String,
        default: "",
        trim: true,
        maxlength: 120,
      },
    },
    costos: {
      precio_base: {
        type: Number,
        required: true,
      },
      extra_rellenos: {
        type: Number,
        required: true,
        default: 0,
      },
      extra_coberturas: {
        type: Number,
        required: true,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    estado: {
      type: String,
      enum: ["draft", "locked", "paid", "cancelled"],
      default: "draft",
    },
    locked_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = model("Personalizacion", PersonalizacionSchema);
