// config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Asegúrate de cargar las variables de entorno

cloudinary.config({
    //cloud_name: 'dvs8o4rI6',
    //api_key: '744336447655428',
    //api_secret: 'gclxNWwxbYmuJzYrbrzsTEbaxG4',
    
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Para usar HTTPS
});
console.log(process.env.CLOUDINARY_CLOUD_NAME)
module.exports = cloudinary;