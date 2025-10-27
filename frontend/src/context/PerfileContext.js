//frontend/src/context/PerfileContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
    performProfileSync,
    getUserProfile as getProfileFromSyncService,
    SYNC_STATUS,
    isConnected // Importa isConnected para decisiones de UI
} from '../api/perfilSyncService';
import { saveUsuarioProfileLocal, updateUsuarioProfileLocalStatus, clearUsuarioProfileLocal } from '../bd/UsuarioSQLite';
import { useAuth } from '../auth/AuthContext'; // Para saber si hay un usuario logueado

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const { user, userToken, loading: authLoading } = useAuth(); // Obtener estado de autenticación
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProfileSyncing, setIsProfileSyncing] = useState(false); // Nuevo estado para la UI
    const [error, setError] = useState(null);


    // Función para cargar y sincronizar el perfil
    const loadAndSyncProfile = useCallback(async (forceSync = false) => {
        if (!user) { // No hay usuario autenticado, no hay perfil que cargar
            setProfile(null);
            setLoading(false);
            return;
        }

        setIsProfileSyncing(true); // Indica que la sincronización está en curso
        try {
            const currentProfile = await getProfileFromSyncService(forceSync);
            setProfile(currentProfile);

            // Si no hay perfil y estamos online, intentar una sincronización forzada
            // (esto es más bien un catch-all si getUserProfile() no lo hizo)
            if (!currentProfile && await isConnected()) {
                console.log("No profile locally, attempting forced sync in ProfileContext.");
                await performProfileSync();
                const updatedProfile = await getProfileFromSyncService(false); // Recargar
                setProfile(updatedProfile);
            }
        } catch (error) {
            console.error('Error loading/syncing user profile in ProfileContext:', error);
            setProfile(null); // Podrías querer mantener el perfil viejo si hubo error de sync
            setError(error);
        } finally {
            setIsProfileSyncing(false);
            setLoading(false);
        }
    }, [user]); // Dependencia del usuario para cargar el perfil al cambiar

    // función para limpiar datos locales al cerrar sesión
    const clearLocalUserData = useCallback(async () => {
        setIsProfileSyncing(true);
        try {
            // Limpiar estado en memoria
            setProfile(null);

            // Intentar limpiar en SQLite si la función existe
            if (typeof clearUsuarioProfileLocal === 'function') {
                await clearUsuarioProfileLocal(); // Implementar en bd/UsuarioSQLite: borrar filas del usuario previo
            } else if (typeof window !== 'undefined' && window.localStorage) {
                // Fallback para web si se usa localStorage para cache
                window.localStorage.removeItem('user_profile');
            }
        } catch (err) {
            console.warn('Error clearing local user data:', err);
        } finally {
            setIsProfileSyncing(false);
            setLoading(false);
        }
    }, []);

    // Reacciona a cambios de usuario: si se cierra sesión limpiar, si hay usuario cargar/sincronizar
    useEffect(() => {
        if (authLoading) return; // Esperar a que termine la carga de auth

        if (!user) {
            // Usuario salió: limpiar datos locales para evitar mostrar perfil anterior
            (async () => {
                await clearLocalUserData();
            })();
            return;
        }

        // Usuario entró/cambió: cargar perfil del usuario actual
        loadAndSyncProfile();
    }, [user, authLoading, loadAndSyncProfile, clearLocalUserData]);

    // Función para actualizar el perfil desde la UI
    const updateProfileData = async (newProfileData) => {
        setIsProfileSyncing(true);
        try {
            const currentProfile = await saveUsuarioProfileLocal({
                ...profile, // Mantener los campos existentes que no se actualizan
                ...newProfileData, // Nuevos datos enviados desde la UI
                syncStatus: SYNC_STATUS.PENDING_UPDATE,
                lastModified: new Date().toISOString()
            }); // Guardar localmente y marcar para sync
            setProfile(currentProfile); // Actualizar estado del contexto

            // Intentar sincronizar inmediatamente si hay conexión
            if (await isConnected()) {
                await performProfileSync();
                // Recargar el perfil desde local después de la sincronización para reflejar el estado 'synced'
                const updatedProfile = await getProfileFromSyncService(false);
                setProfile(updatedProfile);
            } else {
                console.log('Offline: Perfil actualizado localmente, se sincronizará cuando haya conexión.');
            }
            return currentProfile;
        } catch (error) {
            console.error('Error updating profile data:', error);
            throw error;
        } finally {
            setIsProfileSyncing(false);
        }
    };

    return (
        <ProfileContext.Provider value={{ profile, loading, isProfileSyncing, updateProfileData, loadAndSyncProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => useContext(ProfileContext);