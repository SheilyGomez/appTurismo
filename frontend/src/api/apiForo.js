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

export const createForumAPI = async (forumData) => { // Recibe un objeto con todos los datos, incluyendo imagenUrl
   try {
        //console.log('Creating forum with data:', forumData);
        // Axios automáticamente serializará 'forumData' a JSON y establecerá 'Content-Type': 'application/json'
        const response = await client.post('/api/foros/newforo', forumData);
        
        return response.data;
    } catch (error) {
        console.error('Error creating forum (API):', error);
        // Propaga el error para que la UI pueda manejarlo
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

export const addCommentAPI = async (commentData) => { // Recibe un objeto con todos los datos, incluyendo imagenUrl
    //console.log('Adding comment with data:', commentData);
    try {
        // Axios automáticamente serializará 'commentData' a JSON
        const response = await client.post('/api/foros/addcomentarios', commentData);
        return response.data;
    } catch (error) {
        console.error(`Error adding comment (API):`, error);
        // Propaga el error para que la UI pueda manejarlo
        throw error;
    }
};