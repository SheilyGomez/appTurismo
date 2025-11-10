const admin = require('firebase-admin');
const db = admin.firestore();

exports.getAllDestinos = async (req, res) => {
    try {
        const destinosSnapshot = await db.collection('destinos').get();
        if (destinosSnapshot.empty) {
            return res.status(200).json([]);
        }
        
        const destinos = destinosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.status(200).json(destinos);

    } catch (error) {
        console.error('Error al obtener los destinos:', error);
        res.status(500).json({ message: 'Error interno al obtener los destinos.' });
    }
};