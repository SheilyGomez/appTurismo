//frontend/src/auth/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './AuthService';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { startConnectivityListener, stopConnectivityListener } from '../api/perfilSyncService'; // Solo iniciar/detener el listener global


const initialAuthContextValue = {
    user: null,
    userToken: null,
    loading: true, // Por defecto, se asume que está cargando
    login: async () => { console.warn("Login function not provided"); },
    logout: async () => { console.warn("Logout function not provided"); },
    register: async () => { console.warn("Register function not provided"); },
};

export const AuthContext = createContext(initialAuthContextValue); 

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Firebase User object
    const [loading, setLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    useEffect(() => {
        if (!auth) {
            console.error('Firebase "auth" está indefinido. Revisa ./firebaseConfig export.');
            setLoading(false);
            return;
        }

        startConnectivityListener(); // Inicia el listener de conectividad globalmente

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                try {
                    setUser(firebaseUser);
                    const token = await firebaseUser.getIdToken();
                    await AsyncStorage.setItem('userToken', token);
                    
                    setUserToken(token);
                } catch (error) {
                    console.error('Error during onAuthStateChanged processing:', error);
                    setUser(null);
                    setUserToken(null);
                    await AsyncStorage.removeItem('userToken');
                } finally {
                    setLoading(false);
                }
            } else {
                try {
                    setUser(null);
                    setUserToken(null);
                    await AsyncStorage.removeItem('userToken');
                } catch (e) {
                    console.error('Error removing token on logout:', e);
                } finally {
                    setLoading(false);
                }
            }
        });

        return () => {
            unsubscribe();
            stopConnectivityListener(); // Detiene el listener al desmontar
        };
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { user: firebaseUser, idToken } = await AuthService.loginUser(email, password);
            setUser(firebaseUser);
            setUserToken(idToken);
            await AsyncStorage.setItem('userToken', idToken);
            
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await AuthService.logoutUser();
            setUser(null);
            setUserToken(null);
            await AsyncStorage.removeItem('userToken');
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await AuthService.registerUser(userData);
            return response; // onAuthStateChanged manejará el auto-logueo si aplica
        } catch (error) {
            console.error('Register failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userToken, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);