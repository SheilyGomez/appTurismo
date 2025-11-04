const admin = require('firebase-admin');
const db = admin.firestore();
const ForoSchema = require('../models/Foro'); // Asegúrate de que este path y nombre sean correctos
const ComentarioForoSchema = require('../models/ComentariosForo'); // **NUEVO MODELO - Asegúrate de crear este archivo**
const cloudinary = require('../config/cloudinaryConfig'); // Importa tu configuración de Cloudinary

// Función auxiliar para subir a Cloudinary
const uploadToCloudinary = async (fileBuffer, folderName) => {
  console.log(`[Cloudinary] Iniciando subida a la carpeta: ${folderName}`);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName, resource_type: "auto", timeout: 60000 }, // 60 s
      (error, result) => {
        if (result) {
          console.log('[Cloudinary] Subida exitosa:', result.secure_url);
          resolve(result.secure_url);
        } else {
          console.error('[Cloudinary] Error en la subida:', error);
          reject(error);
        }
      }
    );
    stream.end(fileBuffer);
  });
};


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
    // req.body contendrá los campos de texto
    const { titulo, descripcion } = req.body;
    // req.file contendrá la información del archivo subido por Multer (si hay uno)
    const file = req.file;

    const userId = req.user.uid;
    const userName = req.user.displayName || req.user.name;

    console.log('--- Recibiendo solicitud para crear foro ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file); // <-- ESTO ES CLAVE ahora

    if (!titulo || !descripcion) {
        return res.status(400).json({ message: 'El título y la descripción son obligatorios.' });
    }

    let imagenUrl = null;

    try {
        if (file) {
            // Si hay un archivo, súbelo a Cloudinary
            imagenUrl = await uploadToCloudinary(file.buffer, "foro");
            console.log('Imagen subida a Cloudinary:', imagenUrl);
        } else {
             console.log('No se recibió imagen para el foro.');
        }

        const newForoRef = db.collection('Foros').doc();
        const newForo = new ForoSchema(
            newForoRef.id, titulo, descripcion, imagenUrl, userId, userName
        );

        await newForoRef.set({
            ...newForo.toJSON(),
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
            fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
        });
        return res.status(201).json({ message: 'Foro creado correctamente!', foro: newForo.toJSON() });
    } catch (error) {
        // Asegúrate de manejar los errores de Multer (ej: archivo demasiado grande)
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: 'La imagen es demasiado grande. Máximo 5MB.' });
        }
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
// controllers/foroController.js
// ... (imports)

exports.addComentario = async (req, res) => {
    // req.body contendrá los campos de texto
    const { texto, userId, userName, foroId } = req.body;
    // req.file contendrá la información del archivo subido (si hay uno)
    const file = req.file;

    console.log('--- Recibiendo solicitud para agregar comentario ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file); // <-- ESTO ES CLAVE ahora

    if (!texto && !file) { // Un comentario puede ser solo texto, solo imagen o ambos
        return res.status(400).json({ message: 'El comentario no puede estar vacío y debe tener texto o una imagen.' });
    }

    let imagenUrl = null;

    try {
        if (file) {
            imagenUrl = await uploadToCloudinary(file.buffer, "foro");
            console.log('Imagen de comentario subida a Cloudinary:', imagenUrl);
        } else {
            console.log('No se recibió imagen para el comentario.');
        }

        const foroRef = db.collection('Foros').doc(foroId);
        const newComentarioRef = foroRef.collection('comentarios').doc();

        const newComentarioInstance = new ComentarioForoSchema(
            newComentarioRef.id, foroId, userId, userName, texto, imagenUrl
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
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: 'La imagen del comentario es demasiado grande. Máximo 5MB.' });
        }
        console.error('Error al agregar comentario:', error);
        return res.status(500).json({ message: 'Error al agregar comentario.' });
    }
};
