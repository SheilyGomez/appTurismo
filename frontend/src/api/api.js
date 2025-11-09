//frontend/src/api/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

//const API_BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.19:5000' : 'http://localhost:5000';
//const API_BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.20:5000' : 'http://localhost:5000';
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

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
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    //console.log('Axios Request Config:', config);
    return config;
  },
  (error) => {
    console.log(error, error.response, error.request, error.message);
    return Promise.reject(error, error.response, error.request, error.message);
  }
);

export default client;