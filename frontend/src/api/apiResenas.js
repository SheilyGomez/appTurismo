// frontend/src/api/apiResenas.js
import client from './api'; 

/**
 *
 */
export const createResenaAPI = (resenaData) => {
  return client.post('/api/resenas', resenaData);
};

/**
 * 
 */
export const getResenasAPI = (destinoId) => {
  return client.get(`/api/resenas/destino/${destinoId}`);
};

/**
 * 
 * @param {string} resenaId - El ID de la reseña a editar
 * @param {Object} data - { comentario, calificacion }
 */
export const updateResenaAPI = (resenaId, data) => {
  return client.put(`/api/resenas/${resenaId}`, data);
};

/**
 *
 * @param {string} resenaId - El ID de la reseña a eliminar
 */
export const deleteResenaAPI = (resenaId) => {
  return client.delete(`/api/resenas/${resenaId}`);
};