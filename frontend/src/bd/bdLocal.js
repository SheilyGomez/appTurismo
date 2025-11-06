import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('appturismo.db');

export const initDatabase = () => {
    try {
       db.execSync(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id TEXT PRIMARY KEY,
                firebaseUid TEXT UNIQUE,
                email TEXT UNIQUE,
                nombreUsuario TEXT,
                nombreCompleto TEXT,
                pais TEXT,
                preferenciasViaje TEXT,
                intereses TEXT,
                actividadesPreferidas TEXT,
                rol TEXT,
                fechaDeNacimiento TEXT,
                fechaCreacion TEXT,
                profileImageUrl TEXT,  -- NUEVO
                syncStatus TEXT NOT NULL DEFAULT 'SYNCHRONIZED',
                lastModified TEXT
            );
        `);

        console.log('Tabla usuarios creada/verificada con éxito.');
    
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
    }
};

export default db;