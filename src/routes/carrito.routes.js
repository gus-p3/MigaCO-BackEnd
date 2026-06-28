const router = require('express').Router();
const carritoController = require('../controllers/carrito.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Todas las rutas del carrito requieren autenticación
router.use(verificarToken);

router.get('/', carritoController.obtenerCarrito);
router.get('/validar', carritoController.validarDisponibilidad);
router.post('/items', carritoController.agregarItem);
router.put('/items/:itemId', carritoController.actualizarCantidad);
router.delete('/items/:itemId', carritoController.eliminarItem);
router.delete('/', carritoController.vaciarCarrito);

module.exports = router;
