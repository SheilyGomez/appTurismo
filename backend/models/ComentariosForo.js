class ComentarioForoSchema {
    constructor(id, foroId, userId, userName, texto, imagenUrl, fechaCreacion, fechaActualizacion) {
        this.id = id;
        this.foroId = foroId;
        this.userId = userId;
        this.userName = userName;
        this.texto = texto; // Usar 'texto' para coincidir con el controlador
        this.imagenUrl = imagenUrl;
        this.fechaCreacion = fechaCreacion || new Date();
        this.fechaActualizacion = fechaActualizacion || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            foroId: this.foroId,
            userId: this.userId,
            userName: this.userName,
            texto: this.texto,
            imagenUrl: this.imagenUrl,
            fechaCreacion: this.fechaCreacion instanceof Date ? this.fechaCreacion.toISOString() : this.fechaCreacion,
            fechaActualizacion: this.fechaActualizacion instanceof Date ? this.fechaActualizacion.toISOString() : this.fechaActualizacion,
        };
    }
}
module.exports = ComentarioForoSchema;