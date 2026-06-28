const router = require('express').Router();
const productosController = require('../controllers/productos.controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth.middleware');

// CRUD básico - rutas públicas
router.get("/", productosController.listarProductos);
router.get("/buscar", productosController.buscar);
router.get("/categorias", productosController.obtenerCategorias);
router.get("/:id", productosController.obtenerProducto);

// Rutas protegidas (solo admin)
router.post("/", verificarToken, verificarAdmin, productosController.crearProducto);
router.put("/:id", verificarToken, verificarAdmin, productosController.actualizarProducto);
router.delete("/:id", verificarToken, verificarAdmin, productosController.eliminarProducto);

module.exports = router;