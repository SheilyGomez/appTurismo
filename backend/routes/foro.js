// backend/routes/foro.js
const express = require('express');
const router = express.Router();
const {getForo, createForo, getForoDetails, addComentario} = require('../controllers/foroController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ya NO necesitamos multer ni la configuración de upload aquí

router.get('/', getForo);
// La ruta ahora solo espera el authMiddleware y luego createForo
router.post('/newforo', authMiddleware, createForo);

router.get('/:foroId', getForoDetails);

// La ruta de comentarios también se simplifica
router.post('/addcomentarios', authMiddleware, addComentario);

module.exports = router;