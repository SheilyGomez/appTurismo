const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
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