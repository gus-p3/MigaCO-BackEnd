const Personalizacion = require("../models/Personalizacion");
const Producto = require("../models/Producto");

const COSTO_EXTRA_OPCION = 35;

class PersonalizacionesController {
  constructor() {
    this.crearDraft = this.crearDraft.bind(this);
    this.editarDraft = this.editarDraft.bind(this);
    this.bloquearDraft = this.bloquearDraft.bind(this);
  }

  async crearDraft(req, res) {
    try {
      const {
        productoId,
        productoNombre,
        sessionId,
        usuarioId,
        rellenos = [],
        coberturas = [],
        mensaje = "",
      } = req.body;

      if (!productoId || !sessionId) {
        return res.status(400).json({
          message: "productoId y sessionId son obligatorios",
        });
      }

      // Si se corrió seed recientemente, el id puede cambiar; fallback por nombre.
      let producto = await Producto.findById(productoId);
      if (!producto && productoNombre) {
        producto = await Producto.findOne({ nombre: productoNombre });
      }

      if (!producto) {
        return res.status(404).json({
          message:
            "Producto no encontrado. Recarga el catálogo para sincronizar IDs.",
        });
      }

      const validacion = this.validarOpciones(producto, rellenos, coberturas);
      if (!validacion.ok) {
        return res.status(400).json({ message: validacion.message });
      }

      const costos = this.calcularCostos(producto.precio, rellenos, coberturas);

      const draft = await Personalizacion.create({
        producto_id: producto._id,
        usuario_id: usuarioId || null,
        session_id: sessionId,
        opciones: {
          rellenos,
          coberturas,
          mensaje,
        },
        costos,
        estado: "draft",
      });

      return res.status(201).json(draft);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async editarDraft(req, res) {
    try {
      const { id } = req.params;
      const { rellenos = [], coberturas = [], mensaje = "" } = req.body;

      const draft = await Personalizacion.findById(id);
      if (!draft) {
        return res
          .status(404)
          .json({ message: "Personalización no encontrada" });
      }

      if (draft.estado !== "draft") {
        return res.status(409).json({
          message: "Solo se puede editar una personalización en estado draft",
        });
      }

      const producto = await Producto.findById(draft.producto_id);
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      const validacion = this.validarOpciones(producto, rellenos, coberturas);
      if (!validacion.ok) {
        return res.status(400).json({ message: validacion.message });
      }

      const costos = this.calcularCostos(
        draft.costos.precio_base,
        rellenos,
        coberturas,
      );

      draft.opciones = {
        rellenos,
        coberturas,
        mensaje,
      };
      draft.costos = costos;

      await draft.save();
      return res.json(draft);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async bloquearDraft(req, res) {
    try {
      const { id } = req.params;
      const draft = await Personalizacion.findById(id);

      if (!draft) {
        return res
          .status(404)
          .json({ message: "Personalización no encontrada" });
      }

      if (draft.estado !== "draft") {
        return res.status(409).json({
          message: "La personalización ya no está en estado draft",
        });
      }

      draft.estado = "locked";
      draft.locked_at = new Date();

      await draft.save();
      return res.json(draft);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  calcularCostos(precioBase, rellenos, coberturas) {
    const extraRellenos = rellenos.length * COSTO_EXTRA_OPCION;
    const extraCoberturas = coberturas.length * COSTO_EXTRA_OPCION;

    return {
      precio_base: Number(precioBase),
      extra_rellenos: extraRellenos,
      extra_coberturas: extraCoberturas,
      total: Number(precioBase) + extraRellenos + extraCoberturas,
    };
  }

  validarOpciones(producto, rellenos, coberturas) {
    if (!Array.isArray(rellenos) || !Array.isArray(coberturas)) {
      return {
        ok: false,
        message: "rellenos y coberturas deben enviarse como arreglos",
      };
    }

    const rellenosValidos = producto.personalizable?.rellenos_disponibles || [];
    const coberturasValidas =
      producto.personalizable?.coberturas_disponibles || [];

    const rellenosInvalidos = rellenos.filter(
      (r) => !rellenosValidos.includes(r),
    );
    if (rellenosInvalidos.length > 0) {
      return {
        ok: false,
        message: `Rellenos no válidos: ${rellenosInvalidos.join(", ")}`,
      };
    }

    const coberturasInvalidas = coberturas.filter(
      (c) => !coberturasValidas.includes(c),
    );
    if (coberturasInvalidas.length > 0) {
      return {
        ok: false,
        message: `Coberturas no válidas: ${coberturasInvalidas.join(", ")}`,
      };
    }

    return { ok: true };
  }
}

module.exports = new PersonalizacionesController();
