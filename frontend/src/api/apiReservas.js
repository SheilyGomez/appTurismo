import client from './api'; 

/**
 * 1. Crear una nueva reserva
 * @param {Object} reservaData
 * @param {string} reservaData.destinoId - ID del destino
 * @param {string} reservaData.fechaReserva - Fecha en formato ISO (ej: "2025-12-24T18:00:00")
 * @param {number} reservaData.numeroPersonas - Cantidad de personas
 * @param {string} [reservaData.comentarios] - Comentarios opcionales
 */
export const crearReservaAPI = (reservaData) => {
  return client.post('/api/reservas', reservaData);
};


export const getMisReservasAPI = () => {
  return client.get('/api/reservas');
};

/**
 * 3. Cancelar una reserva específica
 * @param {string} reservaId - El ID de la reserva a cancelar
 */
export const cancelarReservaAPI = (reservaId) => {
  return client.put(`/api/reservas/${reservaId}/cancelar`);
};