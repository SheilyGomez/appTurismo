const admin = require('firebase-admin');
const db = admin.firestore();
const ForoSchema = require('../models/Foro'); // Asegúrate de que este path y nombre sean correctos
const ComentarioForoSchema = require('../models/ComentariosForo'); // **NUEVO MODELO - Asegúrate de crear este archivo**

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
    const { titulo, descripcion, imagenUrl } = req.body;
    const userId = req.user.uid; // Asume que el middleware de autenticación añade el usuario al req
    const userName = req.user.displayName || req.user.name  ; // **CORREGIDO: Fallback para userName**

    if (!titulo || !descripcion) {
        return res.status(400).json({ message: 'El título y la descripción son obligatorios.' }); // **CORREGIDO: Mensaje en español**
    }

    try {
        const newForoRef = db.collection('Foros').doc();
        const newForo = new ForoSchema(
            newForoRef.id, titulo, descripcion, imagenUrl, userId, userName
        );
        // Cuando llamas a .set(), Firestore tomará el objeto que le pasas.
        // Si tu constructor de ForoSchema ya establece `fechaCreacion` y `fechaActualizacion` como `new Date()`,
        // Firebase los convertirá a Timestamps automáticamente.
        // Si quieres usar `serverTimestamp()`, debes pasarlos en el objeto a `set()`, no en el constructor del esquema.
        await newForoRef.set({
            ...newForo.toJSON(), // Usa el toJSON para obtener los atributos básicos
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp(), // Sobrescribe con serverTimestamp
            fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(), // Sobrescribe con serverTimestamp
        });
        return res.status(201).json({ message: 'Foro creado correctamente!', foro: newForo.toJSON() });
    } catch (error) {
        console.error('Error en la creacion del foro:', error);
        return res.status(500).json({ message: 'Error en la creacion del foro.' });
    }
};

// Obtener un tema específico del foro y sus comentarios
exports.getForoDetails = async (req, res) => { // Mantengo el nombre para la ruta, pero la lógica interna usa "foro"
    const { foroId } = req.params;
    try {
        const foroDoc = await db.collection('Foros').doc(foroId).get();
        if (!foroDoc.exists) {
            return res.status(404).json({ message: 'Foro no encontrado.' }); // **CORREGIDO: Mensaje en español**
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
    //const { foroId } = req.params;
    const { texto, imagenUrl, userId,userName,foroId } = req.body; // **CORREGIDO: de 'text' a 'texto' si cambiaste el nombre en el frontend**
    // **CORREGIDO: Fallback para userName**
    //const userId = req.user.uid;
    //const userName = req.user.displayName || req.user.email; // **CORREGIDO: Fallback para userName**

    if (!texto) { // **CORREGIDO: de 'text' a 'texto'**
        return res.status(400).json({ message: 'El texto del comentario es obligatorio.' }); // **CORREGIDO: Mensaje en español**
    }

    try {
        const foroRef = db.collection('Foros').doc(foroId);
        const newComentarioRef = foroRef.collection('comentarios').doc();
        // Usar ComentarioSchema para crear el objeto
        const newComentarioInstance = new ComentarioForoSchema(
            newComentarioRef.id, foroId, userId, userName, texto, imagenUrl
        );

        await newComentarioRef.set({
            ...newComentarioInstance.toJSON(), // Usa toJSON del nuevo esquema de comentario
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
            fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Actualizar el contador de comentarios y la fecha de actualización del foro
        await foroRef.update({
            numComentarios: admin.firestore.FieldValue.increment(1),
            fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(201).json({ message: 'Comentario agregado correctamente!', comentario: newComentarioInstance.toJSON() }); // **CORREGIDO: Mensaje en español**
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        return res.status(500).json({ message: 'Error al agregar comentario.' });
    }
};

