const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');
const Personalizacion = require('../models/Personalizacion');

class CarritoController {
  constructor() {
    this.obtenerCarrito = this.obtenerCarrito.bind(this);
    this.agregarItem = this.agregarItem.bind(this);
    this.actualizarCantidad = this.actualizarCantidad.bind(this);
    this.eliminarItem = this.eliminarItem.bind(this);
    this.vaciarCarrito = this.vaciarCarrito.bind(this);
    this.validarDisponibilidad = this.validarDisponibilidad.bind(this);
  }

  // GET /api/carrito
  async obtenerCarrito(req, res) {
    try {
      let carrito = await Carrito.findOne({ usuario_id: req.usuario.id })
        .populate('items.producto_id', 'nombre precio multimedia stock')
        .populate('items.personalizacion_id', 'opciones costos estado');

      if (!carrito) {
        return res.json({ usuario_id: req.usuario.id, items: [], subtotal: 0 });
      }

      const subtotal = carrito.items.reduce((acc, item) => {
        const precio = item.personalizacion_id?.costos?.total ?? item.precio_unitario;
        return acc + precio * item.cantidad;
      }, 0);

      res.json({ ...carrito.toObject(), subtotal });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // POST /api/carrito/items
  async agregarItem(req, res) {
    try {
      const { producto_id, cantidad = 1, personalizacion_id } = req.body;

      if (!producto_id) {
        return res.status(400).json({ message: 'producto_id es requerido' });
      }

      const producto = await Producto.findById(producto_id);
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      const stock = producto.stock?.sucursal_centro || 0;
      if (stock < cantidad) {
        return res.status(400).json({
          message: `Stock insuficiente. Disponible: ${stock}`
        });
      }

      // Validar y bloquear la personalización si se envió
      if (personalizacion_id) {
        const pers = await Personalizacion.findById(personalizacion_id);
        if (!pers || pers.estado === 'cancelled') {
          return res.status(400).json({ message: 'Personalización no válida' });
        }
        if (pers.estado === 'draft') {
          pers.estado = 'locked';
          pers.locked_at = new Date();
          await pers.save();
        }
      }

      let carrito = await Carrito.findOne({ usuario_id: req.usuario.id });
      if (!carrito) {
        carrito = new Carrito({ usuario_id: req.usuario.id, items: [] });
      }

      // Si el mismo producto (con la misma personalización) ya está, sumar cantidad
      const itemExistente = carrito.items.find((i) => {
        const mismoProducto = i.producto_id.toString() === producto_id;
        const mismaPers =
          (!i.personalizacion_id && !personalizacion_id) ||
          i.personalizacion_id?.toString() === personalizacion_id;
        return mismoProducto && mismaPers;
      });

      if (itemExistente) {
        const nuevaCantidad = itemExistente.cantidad + Number(cantidad);
        if (nuevaCantidad > stock) {
          return res.status(400).json({
            message: `No puedes agregar más. Stock disponible: ${stock}`
          });
        }
        itemExistente.cantidad = nuevaCantidad;
      } else {
        carrito.items.push({
          producto_id,
          cantidad: Number(cantidad),
          precio_unitario: producto.precio,
          personalizacion_id: personalizacion_id || null
        });
      }

      carrito.fecha_actualizacion = new Date();
      await carrito.save();

      const carritoActualizado = await Carrito.findById(carrito._id)
        .populate('items.producto_id', 'nombre precio multimedia stock')
        .populate('items.personalizacion_id', 'opciones costos estado');

      const subtotal = carritoActualizado.items.reduce((acc, item) => {
        const precio = item.personalizacion_id?.costos?.total ?? item.precio_unitario;
        return acc + precio * item.cantidad;
      }, 0);

      res.status(201).json({ ...carritoActualizado.toObject(), subtotal });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /api/carrito/items/:itemId
  async actualizarCantidad(req, res) {
    try {
      const { itemId } = req.params;
      const { cantidad } = req.body;

      if (!cantidad || Number(cantidad) < 1) {
        return res.status(400).json({ message: 'La cantidad debe ser al menos 1' });
      }

      const carrito = await Carrito.findOne({ usuario_id: req.usuario.id });
      if (!carrito) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
      }

      const item = carrito.items.id(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
      }

      const producto = await Producto.findById(item.producto_id);
      const stock = producto?.stock?.sucursal_centro || 0;
      if (Number(cantidad) > stock) {
        return res.status(400).json({
          message: `Stock insuficiente. Disponible: ${stock}`
        });
      }

      item.cantidad = Number(cantidad);
      carrito.fecha_actualizacion = new Date();
      await carrito.save();

      const carritoActualizado = await Carrito.findById(carrito._id)
        .populate('items.producto_id', 'nombre precio multimedia stock')
        .populate('items.personalizacion_id', 'opciones costos estado');

      const subtotal = carritoActualizado.items.reduce((acc, i) => {
        const precio = i.personalizacion_id?.costos?.total ?? i.precio_unitario;
        return acc + precio * i.cantidad;
      }, 0);

      res.json({ ...carritoActualizado.toObject(), subtotal });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // DELETE /api/carrito/items/:itemId
  async eliminarItem(req, res) {
    try {
      const { itemId } = req.params;

      const carrito = await Carrito.findOne({ usuario_id: req.usuario.id });
      if (!carrito) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
      }

      carrito.items = carrito.items.filter((i) => i._id.toString() !== itemId);
      carrito.fecha_actualizacion = new Date();
      await carrito.save();

      const carritoActualizado = await Carrito.findById(carrito._id)
        .populate('items.producto_id', 'nombre precio multimedia stock')
        .populate('items.personalizacion_id', 'opciones costos estado');

      const subtotal = carritoActualizado.items.reduce((acc, i) => {
        const precio = i.personalizacion_id?.costos?.total ?? i.precio_unitario;
        return acc + precio * i.cantidad;
      }, 0);

      res.json({ message: 'Producto eliminado del carrito', carrito: { ...carritoActualizado.toObject(), subtotal } });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // DELETE /api/carrito
  async vaciarCarrito(req, res) {
    try {
      const carrito = await Carrito.findOne({ usuario_id: req.usuario.id });
      if (!carrito) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
      }

      carrito.items = [];
      carrito.fecha_actualizacion = new Date();
      await carrito.save();

      res.json({ message: 'Carrito vaciado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /api/carrito/validar
  async validarDisponibilidad(req, res) {
    try {
      const carrito = await Carrito.findOne({ usuario_id: req.usuario.id })
        .populate('items.producto_id', 'nombre stock');

      if (!carrito || carrito.items.length === 0) {
        return res.json({ valido: true, items: [] });
      }

      const resultados = carrito.items.map((item) => {
        const stock = item.producto_id?.stock?.sucursal_centro || 0;
        const disponible = stock >= item.cantidad;
        return {
          item_id: item._id,
          nombre: item.producto_id?.nombre,
          cantidad_pedida: item.cantidad,
          stock_disponible: stock,
          disponible
        };
      });

      const valido = resultados.every((r) => r.disponible);
      res.json({ valido, items: resultados });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CarritoController();
