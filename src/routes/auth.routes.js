const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/registro', authController.registrar);
router.post('/login', authController.login);

router.post('/2fa/verificar',authController.verificar2FA.bind(authController));
 
// Recuperación de contraseña (3 pasos)
router.post('/recuperar',authController.solicitarRecuperacion);
router.post('/recuperar/verificar',authController.verificarCodigoRecuperacion.bind(authController));
router.post('/recuperar/cambiar',authController.cambiarPassword.bind(authController));
 
// ── Rutas protegidas ──────────────────────────────────────────────────────
// Activar / desactivar 2FA (requiere estar logueado)
router.put('/2fa/toggle', verificarToken,authController.togglear2FA.bind(authController));
 

module.exports = router;