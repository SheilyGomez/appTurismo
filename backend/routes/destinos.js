const express = require('express');
const router = express.Router();
const { getAllDestinos } = require('../controllers/destinoController');

// Ruta para obtener todos los destinos (es pública, no necesita authMiddleware)
router.get('/', getAllDestinos);

module.exports = router;