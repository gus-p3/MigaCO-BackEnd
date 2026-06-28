const router = require('express').Router();
const usuarioController = require('../controllers/usuarios.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get('/perfil', usuarioController.obtenerPerfil);
router.put('/perfil', usuarioController.actualizarPerfil);
router.post('/direcciones', usuarioController.agregarDireccion);
router.put('/direcciones/:direccionId', usuarioController.actualizarDireccion); 
router.delete('/direcciones/:direccionId', usuarioController.eliminarDireccion);

module.exports = router;