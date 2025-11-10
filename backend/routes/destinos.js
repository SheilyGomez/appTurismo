// backend/routes/destinos.js
const express = require('express');
const router = express.Router();
// ❗️ Importa ambas funciones
const { getAllDestinos, getDestinoById } = require('../controllers/destinoController');

// Ruta para obtener todos los destinos (es pública)
router.get('/', getAllDestinos);

// ❗️ NUEVA RUTA: para obtener un destino por ID
router.get('/:id', getDestinoById);

module.exports = router;