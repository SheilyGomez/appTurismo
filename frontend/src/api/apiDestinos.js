import client from './api';

/**
 * Obtener destinos desde el backend con filtros opcionales
 * @param {Object} filtros Ejemplo: { nombre: "playa", tipoViaje: "Relax" }
 */
export const fetchDestinosAPI = (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString();
  return client.get(`/api/destinos?${params}`);
};

export const fetchDestinoByIdAPI = (id) => {
  return client.get(`/api/destinos/${id}`);
};


export const fetchCategoriasActividadesAPI = () => client.get('/api/categorias/actividades');
export const fetchCategoriasViajeAPI = () => client.get('/api/categorias/viajes');
export const fetchTiposViajeAPI = () => client.get('/api/categorias/tipos');