// backend/controllers/reservaController.js
const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * -----------------------------------------------------------------
 * 1. CREAR UNA NUEVA RESERVA
 * -----------------------------------------------------------------
 */
exports.crearReserva = async (req, res) => {
  try {
    // 1. Obtener el ID del usuario autenticado (gracias a authMiddleware)
    const usuarioId = req.user.uid;

    // 2. Obtener datos del cuerpo de la petición
    const { destinoId, fechaReserva, numeroPersonas, comentarios } = req.body;

    if (!destinoId || !fechaReserva || !numeroPersonas) {
      return res.status(400).json({ message: "Faltan campos obligatorios (destinoId, fechaReserva, numeroPersonas)." });
    }

    // 3. Obtener los datos "congelados" del Usuario y Destino
    // (Este es el paso clave que pediste)
    
    // --- Obtener datos del Usuario ---
    const userDoc = await db.collection('usuarios').doc(usuarioId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "El perfil de usuario no existe." });
    }
    const usuarioData = userDoc.data();

    // --- Obtener datos del Destino ---
    const destinoDoc = await db.collection('destinos').doc(destinoId).get();
    if (!destinoDoc.exists) {
      return res.status(404).json({ message: "El destino no existe." });
    }
    const destinoData = destinoDoc.data();

    // 4. Construir el objeto de la nueva reserva
    const nuevaReserva = {
      usuarioId: usuarioId,
      destinoId: destinoId,
      
      fechaReserva: new Date(fechaReserva), // Convertir string a Fecha
      numeroPersonas: parseInt(numeroPersonas, 10),
      comentarios: comentarios || null,
      estado: 'confirmada', // O 'pendiente' si necesitas aprobación
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),

      // Datos congelados
      usuarioInfo: {
        nombreCompleto: usuarioData.nombreCompleto,
        email: usuarioData.email,
        uid: usuarioId
      },
      destinoInfo: {
        nombre: destinoData.nombre,
        ubicacion: destinoData.ubicacion,
        imagenPrincipal: destinoData.imagenPrincipal
      }
    };

    // 5. Guardar en la base de datos
    const docRef = await db.collection('reservas').add(nuevaReserva);

    res.status(201).json({ 
      message: "Reserva creada exitosamente.", 
      reservaId: docRef.id,
      ...nuevaReserva 
    });

  } catch (error) {
    console.error("Error al crear la reserva:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * -----------------------------------------------------------------
 * 2. OBTENER "MIS RESERVAS" (del usuario autenticado)
 * -----------------------------------------------------------------
 */
exports.getMisReservas = async (req, res) => {
  try {
    const usuarioId = req.user.uid;

    const snapshot = await db.collection('reservas')
      .where('usuarioId', '==', usuarioId)
      .orderBy('fechaReserva', 'desc') // Mostrar las más próximas primero
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const reservas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(reservas);

  } catch (error) {
    console.error("Error al obtener las reservas:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * -----------------------------------------------------------------
 * 3. CANCELAR UNA RESERVA
 * -----------------------------------------------------------------
 */
exports.cancelarReserva = async (req, res) => {
  try {
    const usuarioId = req.user.uid;
    const { reservaId } = req.params; // ID de la reserva a cancelar

    const reservaRef = db.collection('reservas').doc(reservaId);
    const doc = await reservaRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Reserva no encontrada." });
    }

    // Seguridad: Asegurarnos que el usuario solo cancele SUS propias reservas
    if (doc.data().usuarioId !== usuarioId) {
      return res.status(403).json({ message: "No tienes permiso para cancelar esta reserva." });
    }
    
    // Opcional: No permitir cancelar reservas que ya pasaron
    // if (doc.data().fechaReserva.toDate() < new Date()) {
    //   return res.status(400).json({ message: "No puedes cancelar una reserva que ya ha pasado." });
    // }

    // Actualizar el estado a "cancelada"
    await reservaRef.update({
      estado: 'cancelada'
    });

    res.status(200).json({ message: "Reserva cancelada exitosamente." });

  } catch (error) {
    console.error("Error al cancelar la reserva:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};