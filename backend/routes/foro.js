// backend/routes/foro.js
const express = require('express');
const router = express.Router();
const {getForo, createForo, getForoDetails, addComentario} = require('../controllers/foroController');
const authMiddleware = require('../middlewares/authMiddleware'); // Asumiendo que tienes uno

// Rutas para foros
router.get('/', getForo);
router.post('/newforo', authMiddleware,createForo);

router.get('/:foroId', getForoDetails);

// Rutas para comentarios
//router.post('/:foro/comentarios', authMiddleware, foroController.addComentario);
router.post('/addcomentarios',authMiddleware ,addComentario);

module.exports = router;