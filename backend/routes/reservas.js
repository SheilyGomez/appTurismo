// backend/routes/reservas.js
const express = require('express');
const router = express.Router();
const { 
  crearReserva, 
  getMisReservas, 
  cancelarReserva 
} = require('../controllers/reservaController');
const authMiddleware = require('../middlewares/authMiddleware');

// === RUTAS PROTEGIDAS ===
// Todas las rutas de reservas requieren que el usuario esté autenticado.

// POST /api/reservas
// Crear una nueva reserva
router.post('/', authMiddleware, crearReserva);

// GET /api/reservas
// Obtener todas las reservas del usuario autenticado ("Mis Reservas")
router.get('/', authMiddleware, getMisReservas);

// PUT /api/reservas/:reservaId/cancelar
// Marcar una reserva específica como "cancelada"
router.put('/:reservaId/cancelar', authMiddleware, cancelarReserva);


module.exports = router;