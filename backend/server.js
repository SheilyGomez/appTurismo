//backend/server.js
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Carga las credenciales de tu cuenta de servicio de Firebase
//const serviceAccount = require('./serviceAccountKey.json');
const serviceAccount = require('./config/serviceAccountKey.json');

// Inicializa la aplicación de Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Servidor HTTP
const app = express();

// Configuraciones del servidor http
app.use(express.json()); // Middleware para parsear JSON
app.use(cors());

// Rutas de la API
// Rutas de autenticación
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Rutas de lugares turísticos (no funcional)
const lugaresRoutes = require('./routes/lugarTuristico');
app.use('/api/lugares', lugaresRoutes);

// Puerto para el backend
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
