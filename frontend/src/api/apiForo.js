import client from './api';

export const getForumsAPI = async () => {
    try {
        const response = await client.get('/api/foros');
        return response.data;
    } catch (error) {
        console.error('Error fetching forums:', error);
        throw error;
    }
};

export const createForumAPI = async (forumData) => {
    try {
        // Asegúrate de que las propiedades coincidan con tu backend (titulo, descripcion, imagenUrl)
        const response = await client.post('/api/foros/newforo', forumData);
        return response.data;
    } catch (error) {
        console.error('Error creating forum:', error);
        throw error;
    }
};

export const getForumDetailsAPI = async (forumId) => {
    try {
        const response = await client.get(`/api/foros/${forumId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching forum ${forumId} details:`, error);
        throw error;
    }
};

export const addCommentAPI = async (commentData) => { // forumId se pasa dentro de commentData
    try {
        // Asegúrate de que la ruta y las propiedades coincidan con tu backend
        const response = await client.post('/api/foros/addcomentarios', commentData);
        return response.data;
    } catch (error) {
        console.error(`Error adding comment:`, error);
        throw error;
    }
};