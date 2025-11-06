class ForoSchema {
    constructor(id, titulo, descripcion, imagenUrl, userId, userName,profileImg ,fechaCreacion, fechaActualizacion, numComentarios) {
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.imagenUrl = imagenUrl;
        this.userId = userId;
        this.userName = userName;
        this.profileImg = profileImg;
        this.fechaCreacion = fechaCreacion || new Date();
        this.fechaActualizacion = fechaActualizacion || new Date();
        this.numComentarios = numComentarios || 0;

    }

    // Método toJSON similar al de UsuarioSchema
    toJSON() {
        return {
            id: this.id,
            titulo: this.titulo,
            descripcion: this.descripcion,
            imagenUrl: this.imagenUrl,
            userId: this.userId,
            userName: this.userName,
            profileImg: this.profileImg,
            fechaCreacion: this.fechaCreacion.toISOString(),
            fechaActualizacion: this.fechaActualizacion.toISOString(),
            numComentarios: this.numComentarios
        };
    }
}
module.exports = ForoSchema;