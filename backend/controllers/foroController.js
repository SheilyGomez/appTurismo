const admin = require('firebase-admin');
const db = admin.firestore();
const ForoSchema = require('../models/Foro'); 
const ComentarioForoSchema = require('../models/ComentariosForo'); 

// Obtener todos los temas del foro
exports.getForo = async (req, res) => {
    try {
        const foroSnapshot = await db.collection('Foros').orderBy('fechaActualizacion', 'desc').get();
        const foro = foroSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(foro);

    } catch (error) {
        console.error('Error al extraer los foros:', error);
        return res.status(500).json({ message: 'Error al traer los foros.' });
    }
};

// Crear un nuevo tema en el foro
exports.createForo = async (req, res) => {
    const { titulo, descripcion,imagenUrl,profileImg} = req.body;
    const userId = req.user.uid;
    const userName = req.user.displayName || req.user.name;

    //console.log('--- Recibiendo solicitud para crear foro ---');
    //console.log('req.body:', req.body);
    
    if (!titulo || !descripcion) {
        return res.status(400).json({ message: 'El título y la descripción son obligatorios.' });
    }

    try {
    
        if (imagenUrl) {
            //console.log('Imagen URL recibida del frontend:', imagenUrl);
        } else {
            //console.log('No se recibió imagen URL para el foro del frontend.');
        }

        const newForoRef = db.collection('Foros').doc();
        const newForo = new ForoSchema(
            newForoRef.id, titulo, descripcion, imagenUrl, userId, userName, profileImg
        );

        await newForoRef.set({
            ...newForo.toJSON(),
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
            fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
        });
        return res.status(201).json({ message: 'Foro creado correctamente!', foro: newForo.toJSON() });
    } catch (error) {
        
        console.error('Error en la creacion del foro:', error);
        return res.status(500).json({ message: 'Error en la creacion del foro.' });
    }
};


// Obtener un tema específico del foro y sus comentarios
exports.getForoDetails = async (req, res) => { 
    const { foroId } = req.params;
    try {
        const foroDoc = await db.collection('Foros').doc(foroId).get();
        if (!foroDoc.exists) {
            return res.status(404).json({ message: 'Foro no encontrado.' }); 
        }
        const foro = { id: foroDoc.id, ...foroDoc.data() };

        const comentariosSnapshot = await db.collection('Foros').doc(foroId).collection('comentarios').orderBy('fechaCreacion', 'asc').get();
        const comentarios = comentariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json({ foro, comentarios });
    } catch (error) {
        console.error('Error al extraer los comentarios del foro:', error);
        return res.status(500).json({ message: 'Error al extraer los comentarios del foro' });
    }
};

// Añadir un comentario a un tema del foro

exports.addComentario = async (req, res) => {
    const { texto, userId, userName, foroId, imagenUrl,profileImageUrl } = req.body;

    //console.log('--- Recibiendo solicitud para agregar comentario ---');
    //console.log('req.body:', req.body);

    if (!texto && !file) { // Un comentario puede ser solo texto, solo imagen o ambos
        return res.status(400).json({ message: 'El comentario no puede estar vacío y debe tener texto o una imagen.' });
    }

    try {

        if (imagenUrl) {
            //console.log('Imagen URL de comentario recibida del frontend:', imagenUrl);
        } else {
            //console.log('No se recibió imagen URL para el comentario del frontend.');
        }

        const foroRef = db.collection('Foros').doc(foroId);
        const newComentarioRef = foroRef.collection('comentarios').doc();

        const newComentarioInstance = new ComentarioForoSchema(
            newComentarioRef.id, foroId, userId, userName, texto, imagenUrl || null, profileImageUrl || null
        );

        await newComentarioRef.set({
            ...newComentarioInstance.toJSON(),
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
            fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
        });

        await foroRef.update({
            numComentarios: admin.firestore.FieldValue.increment(1),
            fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(201).json({ message: 'Comentario agregado correctamente!', comentario: newComentarioInstance.toJSON() });
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        return res.status(500).json({ message: 'Error al agregar comentario.' });
    }
};
