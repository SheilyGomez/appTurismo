const admin = require("firebase-admin");
const db = admin.firestore();

exports.createResena = async (req, res) => {
  const usuarioId = req.user.uid; 
  const { destinoId, comentario, calificacion, fotosURLs } = req.body;

  if (!destinoId || !comentario || !calificacion) {
    return res.status(400).json({ message: "destinoId, comentario y calificacion son obligatorios." });
  }

  const rating = Number(calificacion);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "La calificacion debe ser un número entre 1 y 5." });
  }

  try {
    const userDoc = await db.collection('usuarios').doc(usuarioId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    const userData = userDoc.data();

    const resenaRef = db.collection('resenas').doc(); 
    const destinoRef = db.collection('destinos').doc(destinoId);

    const nuevaResena = {
      destinoId,
      usuarioId,
      comentario,
      calificacion: rating,
      fotosURLs: fotosURLs || [],
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      usuarioInfo: {
        nombreUsuario: userData.nombreUsuario,
        profileImageUrl: userData.profileImageUrl || null
      }
    };

    await db.runTransaction(async (transaction) => {
      const destinoDoc = await transaction.get(destinoRef);
      if (!destinoDoc.exists) {
        throw new Error("El destino no existe y no se puede actualizar.");
      }

      transaction.set(resenaRef, nuevaResena);

      const destinoData = destinoDoc.data();
      const numReviewsActual = destinoData.numReviews || 0;
      const totalRatingActual = destinoData.totalRating || 0;

      const nuevoNumReviews = numReviewsActual + 1;
      const nuevoTotalRating = totalRatingActual + rating;
      const nuevaValoracionPromedio = (nuevoTotalRating / nuevoNumReviews).toFixed(2);

      transaction.update(destinoRef, {
        numReviews: nuevoNumReviews,
        totalRating: nuevoTotalRating,
        valoracionPromedio: Number(nuevaValoracionPromedio)
      });
    });

    res.status(201).json({ 
      message: "Resena creada con éxito", 
      resena: {
        id: resenaRef.id,
        ...nuevaResena 
      }
    });

  } catch (error) {
    console.error("Error al crear la resena:", error);
    res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
  }
};

exports.getResenasPorDestino = async (req, res) => {
  try {
    const { destinoId } = req.params;
    if (!destinoId) {
      return res.status(400).json({ message: "Se requiere un ID de destino." });
    }

    const snapshot = await db.collection('resenas')
      .where('destinoId', '==', destinoId)
      // .orderBy('fechaCreacion', 'desc')
      .limit(30)
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const resenas = snapshot.docs.map(doc => {
      return {
        id: doc.id, 
        ...doc.data()
      }
    });
    res.status(200).json(resenas);

  } catch (error) {
    console.error("Error al obtener resenas:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};


exports.updateResena = async (req, res) => {
  const usuarioId = req.user.uid;
  const { resenaId } = req.params;
  const { comentario, calificacion } = req.body; 

  const rating = Number(calificacion);
  if (!comentario || !rating) {
    return res.status(400).json({ message: "Comentario y calificacion son obligatorios." });
  }

  try {
    const resenaRef = db.collection('resenas').doc(resenaId);
    
    await db.runTransaction(async (transaction) => {
      
      const resenaDoc = await transaction.get(resenaRef);
      if (!resenaDoc.exists) {
        throw new Error("La resena no existe.");
      }
      
      const resenaData = resenaDoc.data();
      const destinoRef = db.collection('destinos').doc(resenaData.destinoId);
      const destinoDoc = await transaction.get(destinoRef);

      if (resenaData.usuarioId !== usuarioId) {
        throw new Error("No tienes permiso para editar esta resena.");
      }
      if (!destinoDoc.exists) {
        throw new Error("El destino asociado no existe.");
      }
      
      transaction.update(resenaRef, {
        comentario: comentario,
        calificacion: rating,
        fechaEdicion: admin.firestore.FieldValue.serverTimestamp()
      });

      const destinoData = destinoDoc.data();
      const calificacionAntigua = resenaData.calificacion;
      const nuevoTotalRating = (destinoData.totalRating - calificacionAntigua) + rating;
      const nuevaValoracionPromedio = (nuevoTotalRating / destinoData.numReviews).toFixed(2);

      transaction.update(destinoRef, {
        totalRating: nuevoTotalRating,
        valoracionPromedio: Number(nuevaValoracionPromedio)
      });
    });

    res.status(200).json({ message: "Resena actualizada con éxito." });

  } catch (error) {
    console.error("Error al actualizar la resena:", error);
    if (error.message.includes("permiso")) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
  }
};

exports.deleteResena = async (req, res) => {
  const usuarioId = req.user.uid;
  const { resenaId } = req.params;

  try {
    const resenaRef = db.collection('resenas').doc(resenaId);

    await db.runTransaction(async (transaction) => {
      
      const resenaDoc = await transaction.get(resenaRef);
      if (!resenaDoc.exists) {
        throw new Error("La resena no existe.");
      }

      const resenaData = resenaDoc.data();
      const destinoRef = db.collection('destinos').doc(resenaData.destinoId);
      const destinoDoc = await transaction.get(destinoRef);

      // --- 2. FASE DE VALIDACIÓN ---
      if (resenaData.usuarioId !== usuarioId) {
        throw new Error("No tienes permiso para eliminar esta resena.");
      }


      transaction.delete(resenaRef);

      if (destinoDoc.exists) { 
        const destinoData = destinoDoc.data();
        const calificacionAntigua = resenaData.calificacion;
        
        const nuevoNumReviews = (destinoData.numReviews || 1) - 1;
        const nuevoTotalRating = destinoData.totalRating - calificacionAntigua;
        
        const nuevaValoracionPromedio = (nuevoNumReviews > 0) 
          ? (nuevoTotalRating / nuevoNumReviews).toFixed(2) 
          : 0;

        transaction.update(destinoRef, {
          numReviews: nuevoNumReviews,
          totalRating: nuevoTotalRating,
          valoracionPromedio: Number(nuevaValoracionPromedio)
        });
      }
    });

    res.status(200).json({ message: "Resena eliminada con éxito." });

  } catch (error) {
    console.error("Error al eliminar la resena:", error);
    if (error.message.includes("permiso")) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
  }
};