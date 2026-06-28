const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');

class PedidoController {
  // Obtener todos los pedidos (admin)
  async obtenerPedidos(req, res) {
    try {
      const pedidos = await Pedido.find()
        .populate('usuario_id', 'nombre email')
        .populate('items.producto_id', 'nombre precio imagen categoria')
        .sort({ fecha: -1 });
      
      // Formatear la respuesta para el frontend
      const pedidosFormateados = pedidos.map(pedido => ({
        _id: pedido._id,
        fecha: pedido.fecha,
        cliente: {
          nombre: pedido.usuario_id?.nombre || 'Usuario eliminado',
          email: pedido.usuario_id?.email || 'N/A'
        },
        productos: pedido.items.map(item => ({
          _id: item.producto_id?._id,
          nombre: item.producto_id?.nombre || 'Producto eliminado',
          precio: item.precio_unitario,
          cantidad: item.cantidad,
          subtotal: item.cantidad * item.precio_unitario,
          personalizacion: item.personalizacion
        })),
        total: pedido.total,
        estado: pedido.logistica?.estado || 'pendiente',
        direccion_envio: pedido.logistica?.direccion_entrega,
        metodo_envio: pedido.logistica?.metodo_envio,
        pago: pedido.pago,
        notas: pedido.items[0]?.personalizacion?.mensaje || ''
      }));
      
      res.json(pedidosFormateados);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Obtener pedidos del usuario autenticado
  async obtenerMisPedidos(req, res) {
    try {
      const pedidos = await Pedido.find({ usuario_id: req.usuario.id })
        .populate('items.producto_id', 'nombre precio imagen categoria')
        .sort({ fecha: -1 });
      
      res.json(pedidos);
    } catch (error) {
      console.error('Error al obtener mis pedidos:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Crear nuevo pedido (usuario)
  async crearPedido(req, res) {
    try {
      const { items, logistica, pago } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'El pedido debe tener al menos un producto' });
      }
      
      let totalCalculado = 0;
      const itemsProcesados = [];
      
      // Validar stock y procesar items
      for (const item of items) {
        const producto = await Producto.findById(item.producto_id);
        if (!producto) {
          return res.status(404).json({ message: `Producto no encontrado: ${item.producto_id}` });
        }
        
        // Verificar stock (usando la estructura de stock de tu producto)
        const stockDisponible = producto.stock?.sucursal_centro || 0;
        if (stockDisponible < item.cantidad) {
          return res.status(400).json({ 
            message: `Stock insuficiente para ${producto.nombre}. Disponible: ${stockDisponible}` 
          });
        }
        
        const precio_unitario = item.precio_unitario || producto.precio;
        const subtotal = precio_unitario * item.cantidad;
        totalCalculado += subtotal;
        
        itemsProcesados.push({
          producto_id: producto._id,
          cantidad: item.cantidad,
          precio_unitario: precio_unitario,
          personalizacion: item.personalizacion || {}
        });
        
        // Actualizar stock
        await Producto.findByIdAndUpdate(producto._id, {
          $inc: { 'stock.sucursal_centro': -item.cantidad }
        });
      }
      
      const nuevoPedido = new Pedido({
        usuario_id: req.usuario.id,
        items: itemsProcesados,
        total: totalCalculado,
        logistica: {
          metodo_envio: logistica?.metodo_envio || 'domicilio',
          direccion_entrega: logistica?.direccion_entrega,
          estado: 'pendiente'
        },
        pago: pago || {
          metodo: 'pendiente',
          estado: 'pendiente'
        },
        fecha: new Date()
      });
      
      await nuevoPedido.save();
      
      const pedidoCompleto = await Pedido.findById(nuevoPedido._id)
        .populate('usuario_id', 'nombre email')
        .populate('items.producto_id', 'nombre precio');
      
      res.status(201).json(pedidoCompleto);
    } catch (error) {
      console.error('Error al crear pedido:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Actualizar estado del pedido (admin)
  async actualizarEstadoPedido(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      const estadosValidos = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ message: 'Estado no válido' });
      }
      
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }
      
      // Si se cancela el pedido, devolver stock
      if (estado === 'cancelado' && pedido.logistica.estado !== 'cancelado') {
        for (const item of pedido.items) {
          await Producto.findByIdAndUpdate(item.producto_id, {
            $inc: { 'stock.sucursal_centro': item.cantidad }
          });
        }
      }
      
      pedido.logistica.estado = estado;
      await pedido.save();
      
      const pedidoActualizado = await Pedido.findById(id)
        .populate('usuario_id', 'nombre email')
        .populate('items.producto_id', 'nombre precio');
      
      res.json(pedidoActualizado);
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Actualizar estado de pago (admin)
  async actualizarEstadoPago(req, res) {
    try {
      const { id } = req.params;
      const { estado, transaccion_id } = req.body;
      
      const estadosValidos = ['pendiente', 'pagado', 'fallido', 'reembolsado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ message: 'Estado de pago no válido' });
      }
      
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }
      
      pedido.pago.estado = estado;
      if (transaccion_id) {
        pedido.pago.transaccion_id = transaccion_id;
      }
      await pedido.save();
      
      res.json({ message: 'Estado de pago actualizado', pedido });
    } catch (error) {
      console.error('Error al actualizar estado de pago:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Obtener detalle de un pedido específico
  async obtenerPedidoPorId(req, res) {
    try {
      const { id } = req.params;
      const pedido = await Pedido.findById(id)
        .populate('usuario_id', 'nombre email')
        .populate('items.producto_id', 'nombre precio imagen categoria tags');
      
      if (!pedido) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }
      
      // Verificar que el usuario sea el dueño del pedido o admin
      if (pedido.usuario_id._id.toString() !== req.usuario.id && req.usuario.role !== 'admin') {
        return res.status(403).json({ message: 'No autorizado' });
      }
      
      res.json(pedido);
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Obtener estadísticas de pedidos (admin)
  async obtenerEstadisticas(req, res) {
    try {
      const totalPedidos = await Pedido.countDocuments();
      const pedidosPorEstado = await Pedido.aggregate([
        { $group: { _id: '$logistica.estado', count: { $sum: 1 } } }
      ]);
      
      const ventasTotales = await Pedido.aggregate([
        { $match: { 'pago.estado': 'pagado' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      
      const pedidosRecientes = await Pedido.find()
        .sort({ fecha: -1 })
        .limit(5)
        .populate('usuario_id', 'nombre')
        .populate('items.producto_id', 'nombre');
      
      res.json({
        totalPedidos,
        pedidosPorEstado,
        ventasTotales: ventasTotales[0]?.total || 0,
        pedidosRecientes
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PedidoController();