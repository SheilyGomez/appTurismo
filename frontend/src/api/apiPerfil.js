//frontend/src/api/apiPerfil.js
import client from './api'; // Importa la instancia base de Axios

export const getRemoteProfile = async () => {
    try {
        const response = await client.get('/api/auth/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching remote profile:', error.response?.data || error.message);
        throw error;
    }
};

export const updateRemoteProfile = async (profileData) => {
    try {
        const response = await client.put(`/api/auth/profile/${profileData.id}`, profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating remote profile:', error.response?.data || error.message);
        throw error;
    }
};