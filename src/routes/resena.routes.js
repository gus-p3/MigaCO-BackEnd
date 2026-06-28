const router = require('express').Router();
const resenaController = require('../controllers/resena.controller');
const upload = require('../config/multer');


router.post('/', upload.single('foto'), resenaController.crearResena);
router.get('/producto/:productoId', resenaController.getResenasPorProducto);
router.get('/producto/:productoId/promedio', resenaController.getPromedio);
router.delete('/:resenaId', resenaController.eliminarResena);

module.exports = router;