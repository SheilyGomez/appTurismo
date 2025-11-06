import { Alert } from 'react-native';

// Accede a las variables de entorno de Expo directamente desde process.env
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadImageToCloudinary = async (imageUri, folderName = 'appTurismo') => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        Alert.alert('Error de Configuración', 'El nombre de la nube o el preset de Cloudinary no están configurados.');
        console.error('CLOUDINARY_CLOUD_NAME o CLOUDINARY_UPLOAD_PRESET no están definidos.');
        throw new Error('Configuración de Cloudinary incompleta.');
    }

    const localUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
    const filename = localUri.split('/').pop();

    const formData = new FormData();
    formData.append('file', {
        uri: localUri,
        name: filename,
        type: 'image/jpeg',
    });
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);
    formData.append('folder', folderName);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    try {
        console.log('[Frontend Cloudinary] Iniciando subida...');
        const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (response.ok && data.secure_url) {
            console.log('[Frontend Cloudinary] Subida exitosa:', data.secure_url);
            return data.secure_url;
        } else {
            console.error('[Frontend Cloudinary] Error en la subida a Cloudinary:', data);
            Alert.alert('Error de Subida', data.error?.message || 'No se pudo subir la imagen a Cloudinary.');
            throw new Error(data.error?.message || 'Error desconocido al subir a Cloudinary');
        }
    } catch (error) {
        console.error('[Frontend Cloudinary] Excepción en la subida:', error);
        Alert.alert('Error de Red', 'No se pudo conectar con el servidor de Cloudinary.');
        throw error;
    }
};