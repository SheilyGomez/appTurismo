const express = require('express');
const router = express.Router();
const { 
  createResena, 
  getResenasPorDestino,
  updateResena,
  deleteResena
} = require('../controllers/resenaController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /api/resenas (Crear)
router.post('/', authMiddleware, createResena);

// GET /api/resenas/destino/:destinoId (Leer)
router.get('/destino/:destinoId', getResenasPorDestino);

// PUT /api/resenas/:resenaId (Actualizar)
router.put('/:resenaId', authMiddleware, updateResena);

// DELETE /api/resenas/:resenaId (Eliminar)
router.delete('/:resenaId', authMiddleware, deleteResena);

module.exports = router;