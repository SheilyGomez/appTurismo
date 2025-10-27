//backend/routes/auth.js

const express = require('express');
const router = express.Router();
const { registrarUsuario, iniciarSesion, getUserProfile  } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); // Necesitas el middleware

// Rutas para autenticación
router.post('/register', registrarUsuario);
router.post('/login', iniciarSesion);
router.get('/profile', authMiddleware, getUserProfile); // Ruta protegida con el middleware

module.exports = router;


