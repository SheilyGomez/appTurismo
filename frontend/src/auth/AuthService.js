import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import api from '../api/api'; // Para llamar al backend
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  async registerUser(userData) {
    try {
      // Primero, registra en tu backend que también crea el usuario en Firebase Auth
      const response = await api.post('api/auth/register', userData);
      return response.data; // Devuelve los datos del usuario registrado
    } catch (error) {
      console.error('Error registering user via backend:', error.response?.data || error.message);
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      // Usa Firebase SDK para iniciar sesión en el cliente
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken(); // Obtiene el token de ID

      return { user, idToken };
    } catch (error) {
      console.error('Error logging in:', error.code, error.message);
      throw error;
    }
  }

  async logoutUser() {
    try {
      await signOut(auth);

      // Eliminar token de AsyncStorage si se guardó
      await AsyncStorage.removeItem('userToken');
    } catch (error) {
      console.error('Error logging out:', error.message);
      throw error;
    }
  }

}

export default new AuthService();