const router = require('express').Router();
const pedidoController = require('../controllers/pedidos.controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas para usuarios
router.get('/mis-pedidos', pedidoController.obtenerMisPedidos);
router.post('/', pedidoController.crearPedido);
router.get('/:id', pedidoController.obtenerPedidoPorId);

// Rutas para admin
router.get('/', verificarAdmin, pedidoController.obtenerPedidos);
router.put('/:id/estado', verificarAdmin, pedidoController.actualizarEstadoPedido);
router.put('/:id/pago', verificarAdmin, pedidoController.actualizarEstadoPago);
router.get('/estadisticas/resumen', verificarAdmin, pedidoController.obtenerEstadisticas);

module.exports = router;