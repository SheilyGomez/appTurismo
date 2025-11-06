import { initializeApp } from "firebase/app";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth'; 

const firebaseConfig = {
  apiKey: "AIzaSyD8UTWNQb2EupbB32TEWHV6mMaxSU9PEFY",
  authDomain: "appturismo-d03cf.firebaseapp.com",
  projectId: "appturismo-d03cf",
  storageBucket: "appturismo-d03cf.firebasestorage.app",
  messagingSenderId: "974907821671",
  appId: "1:974907821671:web:de4652b7be7bd5273a4ec2",
  measurementId: "G-MW3T6T4J4M"
};

const app = initializeApp(firebaseConfig);

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('Usando initializeAuth con persistencia AsyncStorage para React Native.');
} catch (e) {
  console.warn('Error al inicializar initializeAuth con persistencia React Native. Intentando con getAuth estándar.', e);
  auth = getAuth(app); 
}


export { app, auth };
