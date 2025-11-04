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

export const createForumAPI = async (formData) => { // AHORA RECIBE formData
    try {
        // Axios automáticamente establecerá el Content-Type a multipart/form-data
        // cuando detecta que el 'data' es una instancia de FormData.
        console.log('Creating forum with formData:', formData);
        const response = await client.post('/api/foros/newforo', 
            formData);
        
        return response.data;
    } catch (error) {
        console.error('Error creating forum:', error);
        throw error;
    }
};

export const getForumDetailsAPI = async (forumId) => {
    const response = await client.get(`/api/foros/${forumId}`);
    try {
        return response.data;
    } catch (error) {
        console.error(`Error fetching forum ${forumId} details:`, error);
        throw error;
    }
};

export const addCommentAPI = async (formData) => { // AHORA RECIBE formData
    console.log('Adding comment with formData:', formData);
    try {
        
        const response = await client.post('/api/foros/addcomentarios', formData);
        return response.data;
    } catch (error) {
        console.error(`Error adding comment:`, error);
        throw error;
    }
};