//backend/routes/auth.js

const express = require('express');
const router = express.Router();
const { registrarUsuario, iniciarSesion, getUserProfile,updateUserProfile  } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); // Necesitas el middleware

// Rutas para autenticación
router.post('/register', registrarUsuario);
router.get('/profile', authMiddleware, getUserProfile); // Ruta protegida con el middleware
router.put('/profile/:id', authMiddleware, updateUserProfile); // NUEVA RUTA: para actualizar el perfil
module.exports = router;


