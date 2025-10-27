const express = require('express');
const router = express.Router();
const {
  getLugares,
  addLugar,
  updateLugar,
  deleteLugar
} = require('../controllers/lugarTuristicoController');

// Rutas para lugares turísticos
router.get('/', getLugares);
router.post('/', addLugar);
router.put('/:id', updateLugar);
router.delete('/:id', deleteLugar);

module.exports = router;