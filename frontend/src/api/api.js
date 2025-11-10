import axios from 'axios';
import { Platform } from 'react-native';

import { auth } from '../auth/firebaseConfig'; 

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
//const API_BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.19:5000' : 'http://localhost:5000';
//const API_BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.20:5000' : 'http://localhost:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json'
    //'Content-Type': 'application/json',
    //'Content-Type': 'multipart/form-data'
  },
});

client.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;

      if (user) {
        const token = await user.getIdToken(true); 
        
        config.headers.Authorization = `Bearer ${token}`;
        
        console.log("Token de Firebase enviado.");
      } else {
        console.log("Usuario no logueado, petición sin token.");
      }

      console.log('Axios Request Config:', config.headers);
      return config;
      
    } catch (error) {
      // Esto pasaría si el token no se puede obtener
      console.error("Error al obtener el token de Firebase:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.log(error, error.response, error.request, error.message);
    return Promise.reject(error, error.response, error.request, error.message);
  }
);

export default client;