// backend/controllers/authController.js
const admin = require('firebase-admin');
const db = admin.firestore(); // Obtén la referencia a Firestore

const UsuarioSchema = require('../models/Usuario.js');

exports.registrarUsuario = async (req, res) => {
  const {
    email,
    password,
    nombreUsuario,
    nombreCompleto,
    pais,
    CategoriaViaje,
    tipoViaje,
    actividadesCategoria,
    fechaDeNacimiento,
    
  } = req.body;

  if (
     !email || 
     !password || 
     !nombreUsuario ||
     !nombreCompleto || 
     !pais || 
     !CategoriaViaje || 
     !tipoViaje || 
     !actividadesCategoria || 
     !fechaDeNacimiento
    ) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  try {

    // ---- PASO 1: Crear el usuario en Firebase Authentication ----
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: nombreUsuario,
    });

    // ---- PASO 2: Crear el perfil del usuario en la colección 'usuarios' de Firestore ----
    // Usamos la clase UsuarioSchema para crear un objeto de usuario limpio y consistente
    const nuevoUsuario = new UsuarioSchema(
      userRecord.uid,
      userRecord.email,
      nombreUsuario,
      nombreCompleto,
      pais,
      CategoriaViaje , 
      tipoViaje ,      
      actividadesCategoria, 
      fechaDeNacimiento,
      null 
    );

    // Convertimos la instancia de la clase a un objeto plano para guardarlo en Firestore
    const userData = { ...nuevoUsuario };

    // Usamos el UID de la autenticación como el ID del documento
    await db.collection('usuarios').doc(userRecord.uid).set(userData);

    //res.status(201).json({ uid: userRecord.uid, ...userData });
    res.status(201).json({ message: 'Usuario registrado exitosamente!' });


  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
    }
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno al crear el usuario.' });
  }
};

// NUEVA FUNCIÓN: para actualizar el perfil de un usuario en Firestore

exports.updateUserProfile = async (req, res) => {
  const { id } = req.params; // El UID del usuario que se va a actualizar
  const authUid = req.user.uid; // El UID del usuario autenticado (del token)

  // Validación de seguridad: Asegúrate de que el usuario autenticado está actualizando su propio perfil.
  if (id !== authUid) {
    return res.status(403).json({ message: 'No tienes permiso para actualizar este perfil.' });
  }

  // Desestructura los campos que se pueden actualizar.
  // No se permite que el UID, email o fecha de creación se actualicen directamente aquí.
  const {
    nombreUsuario,
    nombreCompleto,
    pais,
    CategoriaViaje,
    tipoViaje,
    actividadesCategoria,
    profileImageUrl,      // NUEVO: URL de la imagen de perfil
  } = req.body;

  try {
    const userRef = db.collection('usuarios').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Perfil de usuario no encontrado.' });
    }

    // Construye el objeto con los datos a actualizar
    const updatedFields = {
      lastModified: admin.firestore.FieldValue.serverTimestamp(), // Firestore para obtener el timestamp del servidor
    };

    if (nombreUsuario !== undefined) updatedFields.nombreUsuario = nombreUsuario;
    if (nombreCompleto !== undefined) updatedFields.nombreCompleto = nombreCompleto;
    if (pais !== undefined) updatedFields.pais = pais;
    if (CategoriaViaje !== undefined) updatedFields.CategoriaViaje = CategoriaViaje;
    if (tipoViaje !== undefined) updatedFields.tipoViaje = tipoViaje;
    if (actividadesCategoria !== undefined) updatedFields.actividadesCategoria = actividadesCategoria;
    if (profileImageUrl !== undefined) updatedFields.profileImageUrl = profileImageUrl; // Guardar la URL
    
    // Realiza la actualización
    await userRef.update(updatedFields);

    // Opcional: Si el nombre de usuario cambió, también se actualiza el displayName en Firebase Auth
    if (nombreUsuario && nombreUsuario !== userDoc.data().nombreUsuario) {
        await admin.auth().updateUser(id, { displayName: nombreUsuario });
    }

    // Obtener el perfil actualizado para devolverlo
    const updatedUserDoc = await userRef.get();
    const rawData = updatedUserDoc.data();
    const Timestamp = admin.firestore.Timestamp;
    const formattedData = {};
    for (const [key, value] of Object.entries(rawData)) {
        if (value instanceof Timestamp) {
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('nacimiento')) {
                formattedData[key] = value.toDate().toISOString().split('T')[0];
            } else {
                formattedData[key] = value.toDate().toISOString();
            }
        } else {
            formattedData[key] = value;
        }
    }


    res.status(200).json({ message: 'Perfil actualizado con éxito.', uid: updatedUserDoc.id, ...formattedData });

  } catch (error) {
    console.error('Error al actualizar perfil de usuario:', error);
    res.status(500).json({ message: 'Error interno al actualizar el perfil.' });
  }
};

// Función para obtener el perfil de un usuario desde Firestore
exports.getUserProfile = async (req, res) => {
  try {
     //Para este punto, asumimos que el middleware de autenticación ya ha verificado que el token es válido
    // y verifico que usuario tenia ese token activo y lo añadió 'user' al objeto 'req'
    //de esta manera firebase se encarga de la autenticación y nosotros solo obtenemos el uid del usuario autenticado
    const uid = req.user.uid;
    const userDoc = await db.collection('usuarios').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Perfil de usuario no encontrado.' });
    }

    // Obtiene los datos tal y como vienen de Firestore
    const rawData = userDoc.data();

    // Helper: referencia al tipo Timestamp de Firestore
    const Timestamp = admin.firestore.Timestamp;

    // Recorre los campos y convierte los Timestamp a strings legibles.
    // - fechaDeNacimiento => 'YYYY-MM-DD' (fácil de usar en formularios/mostrar)
    // - fechaCreacion => ISO datetime (ej: 2025-10-20T14:30:00.000Z)
    const formattedData = {};
    for (const [key, value] of Object.entries(rawData)) {
      if (value instanceof Timestamp) {
        // Normaliza nombres de campo para detectar fecha de nacimiento
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('nacimiento')) {
          // Fecha solo con día, mes, año (útil para mostrar o calcular edad)
          formattedData[key] = value.toDate().toISOString().split('T')[0];
        } else {
          // Fecha completa en ISO
          formattedData[key] = value.toDate().toISOString();
        }
      } else {
        formattedData[key] = value;
      }
    }

    // Devuelve el perfil con las fechas ya formateadas
    res.status(200).json({ uid: userDoc.id, ...formattedData });

  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    res.status(500).json({ message: 'Error interno al obtener el perfil.' });
  }
};