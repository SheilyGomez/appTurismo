//frontend/src/api/perfilSyncService.js
import NetInfo from '@react-native-community/netinfo'; // Utiliza el paquete oficial de NetInfo
import { SYNC_STATUS } from './syncStatus';
import {
    getUsuarioProfileLocal,
    saveUsuarioProfileLocal,
    updateUsuarioProfileLocalStatus,
    getPendingUserProfiles,
} from '../bd/UsuarioSQLite';
import { getRemoteProfile, updateRemoteProfile } from './apiPerfil'; 
import AsyncStorage from '@react-native-async-storage/async-storage';


// --- Claves de AsyncStorage para control de sincronización ---
const LAST_PROFILE_SYNC_TIMESTAMP_KEY = 'lastProfileSyncTimestamp';

// --- Funciones de Utilidad ---
export const isConnected = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected;
};

// --- Funciones Principales del Servicio de Sincronización ---
/**
 * Realiza una sincronización completa para el perfil de usuario: SYNC_UP y SYNC_DOWN.
 * @returns {boolean} True si la sincronización fue exitosa, false en caso contrario.
 */

export const performProfileSync = async () => {
    console.log('Iniciando sincronización de perfil...');
    const connected = await isConnected();
    if (!connected) {
        console.log('No hay conexión a internet. Sincronización de perfil pospuesta.');
        return false;
    }

    try {
        // Prioridad: Enviar cambios locales antes de descargar posibles actualizaciones del servidor.
        await syncUpProfile();
        await syncDownProfile();
        console.log('Sincronización de perfil finalizada con éxito.');
        await AsyncStorage.setItem(LAST_PROFILE_SYNC_TIMESTAMP_KEY, new Date().toISOString());
        return true;
    } catch (error) {
        console.error('Error durante la sincronización de perfil:', error);
        return false;
    }
};

/**
 * Sincroniza el perfil del servidor a la base de datos local.
 * Descarga lo último del backend para actualizar lo que tenemos offline.
 */
export const syncDownProfile = async () => {
    console.log('Iniciando SYNC_DOWN del perfil...');
    const connected = await isConnected();
    if (!connected) {
        console.log('No hay conexión para SYNC_DOWN del perfil.');
        return;
    }

    try {
        const remoteProfile = await getRemoteProfile(); // Obtener el perfil del backend
        const localProfile = await getUsuarioProfileLocal(); // Obtener el perfil de SQLite

        if (remoteProfile) {
            // Lógica para resolver conflictos (ej. Last Write Wins)
            // Asumimos que `lastModified` es un campo tanto en el backend como en el local
            // y que el backend lo actualiza.
            if (!localProfile) {
                // No hay perfil local, lo guardamos
                await saveUsuarioProfileLocal({ ...remoteProfile, syncStatus: SYNC_STATUS.SYNCHRONIZED });
                console.log('Perfil remoto guardado localmente por primera vez.');
            } else if (localProfile.syncStatus === SYNC_STATUS.PENDING_UPDATE) {
                // CONFLICTO: Hay cambios pendientes LOCALES y el servidor tiene una versión.
                // Estrategia: Por ahora, el CAMBIO LOCAL TIENE PRIORIDAD.
                // Esto significa que syncUpProfile() ya envió los cambios locales,
                // y no queremos que syncDownProfile los sobrescriba inmediatamente.
                console.log('Perfil local tiene cambios pendientes, se mantiene la versión local para syncUp.');
            } else {
                // No hay cambios locales pendientes, y el servidor tiene un perfil.
                // Comparamos timestamps o simplemente actualizamos si son diferentes.
                // Aquí, una simple comparación de campos o un timestamp podría usarse.
                // Para simplicidad, si no hay PENDING_UPDATE, actualizamos si hay diferencia.
                if (localProfile.lastModified < remoteProfile.lastModified) { // Si el remoto es más reciente
                    await saveUsuarioProfileLocal({ ...remoteProfile, syncStatus: SYNC_STATUS.SYNCHRONIZED });
                    console.log('Perfil local actualizado con la versión remota más reciente.');
                } else {
                    console.log('Perfil remoto es igual o más antiguo que el local (o no tiene cambios pendientes).');
                }
            }
        } else {
            // El servidor no devolvió un perfil (ej. usuario no existe en DB, o error)
            console.warn('El servidor no devolvió un perfil para el usuario actual.');
        }

    } catch (error) {
        console.error('Error en SYNC_DOWN del perfil:', error);
        throw error;
    }
};

/**
 * Sincroniza los cambios locales del perfil (pendientes de actualización)
 * a la base de datos remota (backend).
 */
export const syncUpProfile = async () => {
    console.log('Iniciando SYNC_UP del perfil...');
    const connected = await isConnected();
    if (!connected) {
        console.log('No hay conexión para SYNC_UP del perfil.');
        return;
    }

    try {
        const pendingProfiles = await getPendingUserProfiles();

        if (pendingProfiles.length > 0) {
            // Asumimos que solo debería haber un perfil del usuario logueado
            const profileToSync = pendingProfiles[0];

            if (profileToSync.syncStatus === SYNC_STATUS.PENDING_UPDATE) {
                try {
                    //await updateProfileAPI(profileToSync); // Enviar el perfil completo al backend
                    await updateRemoteProfile(profileToSync); // Enviar el perfil completo al backend
                    await updateUsuarioProfileLocalStatus(profileToSync.id, SYNC_STATUS.SYNCHRONIZED);
                    console.log(`Perfil de usuario '${profileToSync.nombre}' actualizado en el servidor.`);
                } catch (error) {
                    console.error('Error al actualizar perfil de usuario en el servidor:', error);
                    // El syncStatus se mantiene PENDING_UPDATE para reintentar después
                    throw error; // Propagar para que performProfileSync lo capture
                }
            }
            // PENDING_CREATE para el perfil de usuario es menos probable, ya que el perfil se crea
            // al registrarse y se asume que existe en el backend desde ese momento.
        } else {
            console.log('No hay cambios pendientes de perfil para SYNC_UP.');
        }

    } catch (error) {
        console.error('Error en SYNC_UP del perfil:', error);
        throw error;
    }
};


/**
 * Obtiene el perfil del usuario. Prioriza el perfil local y puede disparar una sincronización
 * si los datos locales están desactualizados.
 * @param {boolean} forceSync Si es true, fuerza una sincronización con el backend.
 * @returns {object|null} El perfil del usuario.
 */
export const getUserProfile = async (forceSync = false) => {
    console.log('Obteniendo perfil de usuario...');
    let profile = await getUsuarioProfileLocal();

    const connected = await isConnected();
    const lastSyncTimestamp = await AsyncStorage.getItem(LAST_PROFILE_SYNC_TIMESTAMP_KEY);
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000); // Para revalidar cada 15 min

    // Si estamos online Y (se fuerza la sincronización O no hay timestamp de última sync O la última sync fue hace > 15 min)
    if (connected && (forceSync || !lastSyncTimestamp || new Date(lastSyncTimestamp) < fifteenMinutesAgo)) {
        console.log('Se necesita sincronizar el perfil (o fue forzado/desactualizado).');
        try {
            await performProfileSync();
            profile = await getUsuarioProfileLocal(); // Obtener el perfil actualizado
        } catch (error) {
            console.warn('Falló la sincronización del perfil, usando datos locales si disponibles.');
            // profile ya contiene los datos locales (potencialmente viejos o nulos)
        }
    } else {
        console.log('Usando perfil local sin sincronizar (offline o sincronización reciente).');
    }

    return profile;
};

// --- Listener para Cambios de Conectividad ---
let unsubscribeNetInfo = null;

export const startConnectivityListener = () => {
    if (unsubscribeNetInfo) return;

    unsubscribeNetInfo = NetInfo.addEventListener(state => {
        if (state.isConnected) {
            //console.log('Conexión a internet restablecida.');
            
            // Aquí es donde necesitamos la verificación del token
            const attemptSyncIfAuthenticated = async () => {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    console.log('Token detectado. Intentando sincronizar perfil...');
                    setTimeout(() => performProfileSync(), 5000); // Pequeño retardo
                } else {
                    console.log('No hay token de usuario. Sincronización pospuesta hasta el login.');
                }
            };
            attemptSyncIfAuthenticated();
        } else {
            console.log('Conexión a internet perdida.');
        }
    });
};

export const stopConnectivityListener = () => {
    if (unsubscribeNetInfo) {
        unsubscribeNetInfo();
        unsubscribeNetInfo = null;
    }
};
