// frontend/src/bd/UsuarioSQLite.js
import db from '../bd/bdLocal'; // Importa tu instancia de la base de datos
import { SYNC_STATUS } from '../api/syncStatus';

export const saveUsuarioProfileLocal = (profileData) => {
  try {
    const id = profileData.uid || profileData.id;
    db.runSync(
      `INSERT OR REPLACE INTO usuarios (
        id, firebaseUid, email, nombreUsuario, nombreCompleto, pais,
        preferenciasViaje, intereses, actividadesPreferidas, rol,
        fechaDeNacimiento,fechaCreacion ,syncStatus, lastModified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?);`,
      [
        id,
        profileData.firebaseUid || profileData.uid,
        profileData.email,
        profileData.nombreUsuario,
        profileData.nombreCompleto,
        profileData.pais,
        JSON.stringify(profileData.preferenciasViaje || []),
        JSON.stringify(profileData.intereses || []),
        JSON.stringify(profileData.actividadesPreferidas || []),
        profileData.rol || 'usuario',
        profileData.fechaDeNacimiento || null,
        profileData.fechaCreacion || new Date().toISOString(),
        profileData.syncStatus || SYNC_STATUS.SYNCHRONIZED,
        new Date().toISOString()
      ]
    );

    console.log('Perfil de usuario guardado/actualizado localmente.');

    const result = db.getAllSync(`SELECT * FROM usuarios WHERE id = ? LIMIT 1;`, [id]);
    if (result && result.length > 0) {
      const profile = result[0];
      profile.prefeciasViajes = JSON.parse(profile.prefeciasViajes || '[]');
      profile.intereses = JSON.parse(profile.intereses || '[]');
      profile.actividadesPreferidas = JSON.parse(profile.actividadesPreferidas || '[]');
      return profile;
    }

    return getUsuarioProfileLocal();
  } catch (error) {
    console.error('Error saving user profile locally:', error);
    throw error;
  }
};


export const getUsuarioProfileLocal = () => { 
    try {
        const result = db.getAllSync(`SELECT * FROM usuarios LIMIT 1;`);
        if (result.length > 0) {
            const profile = result[0]; // getALLSync devuelve un array de objetos
            profile.preferenciasViaje = JSON.parse(profile.preferenciasViaje || '[]');
            profile.intereses = JSON.parse(profile.intereses || '[]');
            profile.actividadesPreferidas = JSON.parse(profile.actividadesPreferidas || '[]');
            return profile;
        }
        return null; // No hay perfil guardado
    } catch (error) {
        console.error('Error getting user profile locally:', error);
        throw error;
    }
};

export const updateUsuarioProfileLocalStatus = (profileId, newStatus) => {
    try {
        db.runSync(
            `UPDATE usuarios SET syncStatus = ?, lastModified = ? WHERE id = ?;`,
            [newStatus, new Date().toISOString(), profileId]
        );
        console.log(`Estado de sincronización del usuario ${profileId} actualizado a ${newStatus}.`);
        return { success: true };
    } catch (error) {
        console.error(`Error updating syncStatus for user profile ${profileId}:`, error);
        throw error;
    }
};

export const getPendingUserProfiles = () => {
    try {
        const result = db.getAllSync(
            `SELECT * FROM usuarios WHERE syncStatus = ? OR syncStatus = ?;`,
            [SYNC_STATUS.PENDING_CREATE, SYNC_STATUS.PENDING_UPDATE]
        );
        const profiles = result.map(profile => ({
            ...profile,
            preferenciasViaje: JSON.parse(profile.preferenciasViaje || '[]'),
            intereses: JSON.parse(profile.intereses || '[]'),
            actividadesPreferidas: JSON.parse(profile.actividadesPreferidas || '[]'),
        }));
        return profiles;
    } catch (error) {
        console.error('Error getting pending user profiles locally:', error);
        throw error;
    }
};

export const clearUsuarioProfileLocal = (userId = null) => {
    try {
        if (userId) {
            db.runSync(`DELETE FROM usuarios WHERE id = ?;`, [userId]);
            console.log(`Perfil local del usuario ${userId} eliminado.`);
        } else {
            db.runSync(`DELETE FROM usuarios;`);
            console.log('Todos los perfiles locales eliminados.');
        }
        return { success: true };
    } catch (error) {
        console.error('Error clearing local user profile(s):', error);
        throw error;
    }
};