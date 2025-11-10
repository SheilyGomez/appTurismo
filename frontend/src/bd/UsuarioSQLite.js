// frontend/src/bd/UsuarioSQLite.js
import db from '../bd/bdLocal'; // Importa tu instancia de la base de datos
import { SYNC_STATUS } from '../api/syncStatus';

export const saveUsuarioProfileLocal = (profileData) => {
  try {
    const id = profileData.uid || profileData.id;
    db.runSync(
      `INSERT OR REPLACE INTO usuarios (
        id, firebaseUid, email, nombreUsuario, nombreCompleto, pais,
        CategoriaViaje, tipoViaje, actividadesCategoria, rol,
        fechaDeNacimiento, fechaCreacion, profileImageUrl, syncStatus, lastModified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, 
      [
        id,
        profileData.firebaseUid || profileData.uid,
        profileData.email,
        profileData.nombreUsuario,
        profileData.nombreCompleto,
        profileData.pais,
        JSON.stringify(profileData.CategoriaViaje || []),
        JSON.stringify(profileData.tipoViaje || []),
        JSON.stringify(profileData.actividadesCategoria || []),
        profileData.rol || 'usuario',
        profileData.fechaDeNacimiento || null,
        profileData.fechaCreacion || new Date().toISOString(),
        profileData.profileImageUrl || null, // Guardar la URL de la imagen de perfil
        profileData.syncStatus || SYNC_STATUS.SYNCHRONIZED,
        new Date().toISOString()
      ]
    );

    console.log('Perfil de usuario guardado/actualizado localmente.');

    const result = db.getAllSync(`SELECT * FROM usuarios WHERE id = ? LIMIT 1;`, [id]);
    if (result && result.length > 0) {
      const profile = result[0];
      profile.prefeciasViajes = JSON.parse(profile.prefeciasViajes || '[]');
      profile.tipoViaje = JSON.parse(profile.tipoViaje || '[]');
      profile.actividadesCategoria = JSON.parse(profile.actividadesCategoria || '[]');
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
            profile.CategoriaViaje = JSON.parse(profile.CategoriaViaje || '[]');
            profile.tipoViaje = JSON.parse(profile.tipoViaje || '[]');
            profile.actividadesCategoria = JSON.parse(profile.actividadesCategoria || '[]');
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
            CategoriaViaje: JSON.parse(profile.CategoriaViaje || '[]'),
            tipoViaje: JSON.parse(profile.tipoViaje || '[]'),
            actividadesCategoria: JSON.parse(profile.actividadesCategoria || '[]'),
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