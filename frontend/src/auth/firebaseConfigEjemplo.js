import { initializeApp } from "firebase/app";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth'; 

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
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
