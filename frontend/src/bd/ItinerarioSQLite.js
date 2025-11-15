import * as SQLite from 'expo-sqlite';

// Función para abrir la base de datos con manejo de errores
let db;

const getDatabase = () => {
  if (!db) {
    try {
      db = SQLite.openDatabase('itinerarios.db');
      console.log('Base de datos SQLite abierta correctamente');
    } catch (error) {
      console.error('Error al abrir la base de datos SQLite:', error);
      throw error;
    }
  }
  return db;
};

export const initItinerarioDatabase = () => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    
    database.transaction(
      tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS itinerarios (
            id TEXT PRIMARY KEY,
            usuarioID TEXT NOT NULL,
            fechaCreacion INTEGER NOT NULL,
            fechaInicio INTEGER NOT NULL,
            fechaFin INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            destino TEXT NOT NULL,
            syncWithGoogle INTEGER DEFAULT 0,
            googleEventId TEXT
          );`,
          [],
          () => {
            console.log('Tabla itinerarios creada/existe');
            resolve();
          },
          (_, error) => {
            console.log('Error creando tabla:', error);
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        console.error('Error en transacción:', error);
        reject(error);
      }
    );
  });
};

export const addItinerario = (itinerario) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    
    database.transaction(
      tx => {
        tx.executeSql(
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
            itinerario.syncWithGoogle || 0,
            itinerario.googleEventId || null
          ],
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const getAllItinerarios = () => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    
    database.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM itinerarios ORDER BY fechaInicio DESC`,
          [],
          (_, { rows }) => {
            const itinerarios = rows._array.map(item => ({
              ...item,
              fechaCreacion: new Date(item.fechaCreacion),
              fechaInicio: new Date(item.fechaInicio),
              fechaFin: new Date(item.fechaFin),
              syncWithGoogle: Boolean(item.syncWithGoogle)
            }));
            resolve(itinerarios);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const updateItinerarioGoogleSync = (id, googleEventId) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    
    database.transaction(
      tx => {
        tx.executeSql(
          `UPDATE itinerarios SET syncWithGoogle = 1, googleEventId = ? WHERE id = ?`,
          [googleEventId, id],
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const deleteItinerario = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    
    database.transaction(
      tx => {
        tx.executeSql(
          `DELETE FROM itinerarios WHERE id = ?`,
          [id],
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export default getDatabase;