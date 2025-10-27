const admin = require('firebase-admin');
const db = admin.firestore();

// Función para traer todos los lugares turísticos
exports.getLugares = async (req, res) => {
  try {
    const lugaresSnapshot = await db.collection('lugaresTuristicos').get();
    const lugares = lugaresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(lugares);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función para crear un nuevo lugar turístico
exports.addLugar = async (req, res) => {
  const { nombre, descripcion, ubicacion } = req.body;
  const nuevoLugar = { nombre, descripcion, ubicacion };

  try {
    const docRef = await db.collection('lugaresTuristicos').add(nuevoLugar);
    res.status(201).json({ id: docRef.id, ...nuevoLugar });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Función para actualizar un lugar turístico
exports.updateLugar = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, ubicacion } = req.body;

  try {
    const lugarRef = db.collection('lugaresTuristicos').doc(id);
    const doc = await lugarRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Lugar turístico no encontrado' });
    }

    await lugarRef.update({ nombre, descripcion, ubicacion });
    res.status(200).json({ id, nombre, descripcion, ubicacion });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Función para eliminar un lugar turístico
exports.deleteLugar = async (req, res) => {
  const { id } = req.params;

  try {
    const lugarRef = db.collection('lugaresTuristicos').doc(id);
    const doc = await lugarRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Lugar turístico no encontrado' });
    }

    await lugarRef.delete();
    res.status(200).json({ message: 'Lugar turístico eliminado' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};