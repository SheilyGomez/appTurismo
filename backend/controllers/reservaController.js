const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * Helper para generar un código de reserva aleatorio
 * Formato: UPR-ABC123
 */
function generarCodigoReserva() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  let charPart = '';
  let numPart = '';
  for (let i = 0; i < 3; i++) {
    charPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  for (let i = 0; i < 3; i++) {
    numPart += nums.charAt(Math.floor(Math.random() * nums.length));
  }
  return `UPR-${charPart}${numPart}`;
}

exports.crearReserva = async (req, res) => {
  try {
    const usuarioId = req.user.uid;
    
    const { destinoId, fechaReserva, numeroPersonas, comentarios, actividadReservada } = req.body;

    if (!destinoId || !fechaReserva || !numeroPersonas) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }


    const userDoc = await db.collection('usuarios').doc(usuarioId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "El perfil de usuario no existe." });
    }
    const usuarioData = userDoc.data();

    const destinoDoc = await db.collection('destinos').doc(destinoId).get();
    if (!destinoDoc.exists) {
      return res.status(404).json({ message: "El destino no existe." });
    }
    const destinoData = destinoDoc.data();

    const precioPorPersona = destinoData.precioPorPersona || 0;
    const precioTotal = precioPorPersona * parseInt(numeroPersonas, 10);

    const nuevaReserva = {
      usuarioId: usuarioId,
      destinoId: destinoId,

      codigoReserva: generarCodigoReserva(),
      precioTotal: precioTotal,
      actividadReservada: actividadReservada || "Reserva General",

      fechaReserva: new Date(fechaReserva),
      numeroPersonas: parseInt(numeroPersonas, 10),
      comentarios: comentarios || null,
      estado: 'confirmada',
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),

      usuarioInfo: {
        nombreCompleto: usuarioData.nombreCompleto,
        email: usuarioData.email,
        uid: usuarioId
      },
      destinoInfo: {
        nombre: destinoData.nombre,
        ubicacion: destinoData.ubicacion,
        imagenPrincipal: destinoData.imagenPrincipal,
        precioPorPersona: precioPorPersona
      }
    };

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

exports.getMisReservas = async (req, res) => {
  try {
    const usuarioId = req.user.uid;

    const snapshot = await db.collection('reservas')
      .where('usuarioId', '==', usuarioId)
      // .orderBy('fechaReserva', 'desc') // comentado para evitar error de índice
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const reservas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    reservas.sort((a, b) => {
      const dateA = a.fechaReserva.toMillis ? a.fechaReserva.toMillis() : new Date(a.fechaReserva).getTime();
      const dateB = b.fechaReserva.toMillis ? b.fechaReserva.toMillis() : new Date(b.fechaReserva).getTime();
      return dateB - dateA; 
    });

    res.status(200).json(reservas);

  } catch (error) {
    console.error("Error al obtener las reservas:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

exports.cancelarReserva = async (req, res) => {
  try {
    const usuarioId = req.user.uid;
    const { reservaId } = req.params;

    const reservaRef = db.collection('reservas').doc(reservaId);
    const doc = await reservaRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Reserva no encontrada." });
    }

    if (doc.data().usuarioId !== usuarioId) {
      return res.status(403).json({ message: "No tienes permiso para cancelar esta reserva." });
    }
    
    await reservaRef.update({
      estado: 'cancelada'
    });

    res.status(200).json({ message: "Reserva cancelada exitosamente." });

  } catch (error) {
    console.error("Error al cancelar la reserva:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};