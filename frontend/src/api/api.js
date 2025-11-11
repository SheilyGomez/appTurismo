//frontend/src/api/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

<<<<<<< Updated upstream
const API_BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.19:5000' : 'http://localhost:5000';
=======
import { auth } from '../auth/firebaseConfig'; 

const API_BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.12:5000' : 'http://localhost:5000';
//const API_BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.19:5000' : 'http://localhost:5000';
//const API_BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.20:5000' : 'http://localhost:5000';
>>>>>>> Stashed changes

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;