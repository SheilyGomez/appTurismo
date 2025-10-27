// backend/controllers/authController.js
const admin = require('firebase-admin');
const db = admin.firestore(); // Obtén la referencia a Firestore

// Importa tu clase UsuarioSchema para mantener la consistencia (opcional, pero buena práctica)
const UsuarioSchema = require('../models/Usuario.js');

// Función para registrar un nuevo usuario (AHORA CON PERFIL EN FIRESTORE)
exports.registrarUsuario = async (req, res) => {
  // Desestructura todos los campos que esperas recibir del frontend
  const {
    email,
    password,
    nombreUsuario,
    nombreCompleto,
    pais,
    preferenciasViaje,
    intereses,
    actividadesPreferidas,
    fechaDeNacimiento
    // Asumimos que 'rol' también viene en el body si lo necesitas
  } = req.body;

  // Validación básica para los campos más importantes
  if (
     !email || 
     !password || 
     !nombreUsuario ||
     !nombreCompleto || 
     !pais || 
     !preferenciasViaje || 
     !intereses || 
     !actividadesPreferidas || 
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
      preferenciasViaje , 
      intereses ,      
      actividadesPreferidas, 
      fechaDeNacimiento 
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


// Función para iniciar sesión (se gestiona principalmente en el frontend)
// El backend puede verificar el token de ID enviado desde el cliente
exports.iniciarSesion = async (req, res) => {
  // En una implementación real, el frontend enviaría un token de ID
  // y el backend lo verificaría. Por simplicidad, este ejemplo es básico.
  // Para una app móvil, el SDK de cliente de Firebase se encargará del inicio de sesión
  // y te proporcionará un token que puedes enviar al backend para verificar la sesión.
  res.status(200).json({ message: 'El inicio de sesión se gestiona en el cliente con el SDK de Firebase.' });
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