const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

//const serviceAccount = require('./config/serviceAccountKey.json');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('Las variables de entorno de Firebase no están configuradas.');
}

const firebaseCredentials = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  // La siguiente línea es crucial: reemplaza los caracteres de escape '\n' por saltos de línea reales.
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};


admin.initializeApp({
  credential: admin.credential.cert(firebaseCredentials)
});

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const authRoutes = require('./routes/auth');
const foroRoutes = require('./routes/foro');
const destinosRoutes = require('./routes/destinos');
const lugaresRoutes = require('./routes/lugarTuristico');
const categoriasRoutes = require('./routes/categorias');
const resenasRoutes = require('./routes/resenas');
const reservasRoutes = require('./routes/reservas'); 

app.use('/api/auth', authRoutes);
app.use('/api/foros', foroRoutes);
app.use('/api/destinos', destinosRoutes);
app.use('/api/lugares', lugaresRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/resenas', resenasRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});