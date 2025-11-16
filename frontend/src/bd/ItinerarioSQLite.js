import * as SQLite from 'expo-sqlite';

// Función para abrir la base de datos con manejo de errores
let db;

const getDatabase = () => {
  if (!db) {
    try {
      db = SQLite.openDatabaseSync('itinerarios.db'); 
      console.log('Base de datos SQLite abierta correctamente');
    } catch (error) {
      console.error('Error al abrir la base de datos SQLite:', error);
      throw error;
    }
  }
  return db;
};

export const initItinerarioDatabase = () => {
  try {
    const database = getDatabase();
    database.execSync(`
      CREATE TABLE IF NOT EXISTS itinerarios (
        id TEXT PRIMARY KEY,
        usuarioID TEXT NOT NULL,
        fechaCreacion INTEGER NOT NULL,
        fechaInicio INTEGER NOT NULL,
        fechaFin INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        destino TEXT NOT NULL,
        syncWithGoogle INTEGER DEFAULT 0,
        googleEventId TEXT
      );
    `);
    console.log('Tabla itinerarios creada/verificada con éxito.');
  } catch (error) {
    console.error('Error creando la tabla itinerarios:', error);
    throw error;
  }
};
export const addItinerario = (itinerario) => {
  try {
    const database = getDatabase();
    database.runSync(
      `INSERT INTO itinerarios 
       (id, usuarioID, fechaCreacion, fechaInicio, fechaFin, nombre, destino, syncWithGoogle, googleEventId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        itinerario.id,
        itinerario.usuarioID,
        itinerario.fechaCreacion.getTime(),
        itinerario.fechaInicio.getTime(),
        itinerario.fechaFin.getTime(),
        itinerario.nombre,
        itinerario.destino,
        itinerario.syncWithGoogle ? 1 : 0,
        itinerario.googleEventId || null
      ]
    );
    // runSync no devuelve un resultado útil, solo arroja error si falla.
    return { success: true, id: itinerario.id };
  } catch (error) {
    console.error('Error al añadir itinerario:', error);
    throw error;
  }
};

export const getAllItinerarios = () => {
  try {
    const database = getDatabase();
    const results = database.getAllSync(`SELECT * FROM itinerarios ORDER BY fechaInicio DESC`);
    
    // Mapeamos los resultados para convertir timestamps a objetos Date.
    const itinerarios = results.map(item => ({
      ...item,
      fechaCreacion: new Date(item.fechaCreacion),
      fechaInicio: new Date(item.fechaInicio),
      fechaFin: new Date(item.fechaFin),
      syncWithGoogle: Boolean(item.syncWithGoogle)
    }));
    
    return itinerarios;
  } catch (error) {
    console.error('Error al obtener todos los itinerarios:', error);
    throw error;
  }
};

export const updateItinerarioGoogleSync = (id, googleEventId) => {
  try {
    const database = getDatabase();
    database.runSync(
      `UPDATE itinerarios SET syncWithGoogle = 1, googleEventId = ? WHERE id = ?`,
      [googleEventId, id]
    );
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar la sincronización con Google:', error);
    throw error;
  }
};

export const deleteItinerario = (id) => {
  try {
    const database = getDatabase();
    database.runSync(`DELETE FROM itinerarios WHERE id = ?`, [id]);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar el itinerario:', error);
    throw error;
  }
};

export default getDatabase;