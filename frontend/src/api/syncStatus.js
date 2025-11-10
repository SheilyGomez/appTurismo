//frontend/src/api/syncStatus.js
export const SYNC_STATUS = {
    SYNCHRONIZED: 'SYNCHRONIZED',
    PENDING_CREATE: 'PENDING_CREATE',  //pendiente de crear en el servidor
    PENDING_UPDATE: 'PENDING_UPDATE',  //actualizacion pendiente
    PENDING_DELETE: 'PENDING_DELETE',  //eliminacin pendinte
    ERROR: 'ERROR', 
};

