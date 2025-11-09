import client from './api';

export const fetchDestinosAPI = () => {
    return client.get('/api/destinos');
};