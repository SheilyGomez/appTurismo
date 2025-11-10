const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Colecciones: categoriaActividades, categoriaViaje, tipoViaje
const getCollection = async (collection) => {
  const snapshot = await admin.firestore().collection(collection).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Rutas
router.get('/actividades', async (req, res) => {
  try {
    const data = await getCollection('categoriaActividades');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías de actividades' });
  }
});

router.get('/viajes', async (req, res) => {
  try {
    const data = await getCollection('categoriaViaje');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías de viaje' });
  }
});

router.get('/tipos', async (req, res) => {
  try {
    const data = await getCollection('tipoViaje');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tipos de viaje' });
  }
});

module.exports = router;
