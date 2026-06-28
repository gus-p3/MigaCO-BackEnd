const router = require("express").Router();
const personalizacionesController = require("../controllers/personalizaciones.controller");

router.post("/", personalizacionesController.crearDraft);
router.patch("/:id", personalizacionesController.editarDraft);
router.post("/:id/lock", personalizacionesController.bloquearDraft);

module.exports = router;
