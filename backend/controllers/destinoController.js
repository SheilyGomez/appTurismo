const admin = require("firebase-admin");
const db = admin.firestore();

const getAllDestinos = async (req, res) => {
  try {
    const { nombre, tipoViaje, categoriaViaje, categoriaActividades } = req.query;
    let query = db.collection("destinos");

    // si hay filtros específicos, los aplicamos
    if (tipoViaje) query = query.where("tipoViaje", "==", tipoViaje);
    if (categoriaViaje) query = query.where("categoriaViaje", "==", categoriaViaje);
    if (categoriaActividades)
      query = query.where("categoriaActividades", "array-contains", categoriaActividades);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    let destinos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // si hay un nombre, filtramos por coincidencia parcial (case-insensitive)
    if (nombre) {
      destinos = destinos.filter((d) =>
        d.nombre.toLowerCase().includes(nombre.toLowerCase())
      );
    }

    res.status(200).json(destinos);
  } catch (error) {
    console.error("Error al obtener los destinos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


const getDestinoById = async (req, res) => {
  try {
    const { id } = req.params; // Obtenemos el ID de la URL
    
    if (!id) {
      return res.status(400).json({ message: "Se requiere un ID de destino" });
    }

    const docRef = db.collection("destinos").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Destino no encontrado" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });

  } catch (error) {
    console.error("Error al obtener el destino por ID:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


module.exports = { 
  getAllDestinos,
  getDestinoById 
};