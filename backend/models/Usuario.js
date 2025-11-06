// backend/models/Usuario.js

class UsuarioSchema {
  constructor(uid, email, nombreUsuario, nombreCompleto, pais, preferenciasViaje, intereses, actividadesPreferidas, fechaDeNacimiento, profileImageUrl = null, backgroundImageUrl = null) {
    this.uid = uid;
    this.email = email;
    this.nombreUsuario = nombreUsuario;
    this.nombreCompleto = nombreCompleto;
    this.pais = pais;
    this.preferenciasViaje = preferenciasViaje;
    this.intereses = intereses;
    this.actividadesPreferidas = actividadesPreferidas;
    this.fechaDeNacimiento = new Date(fechaDeNacimiento);
    this.rol = 'usuario';
    this.fechaCreacion = new Date();
    this.profileImageUrl = profileImageUrl;    // NUEVO
  }

  toJSON() {
    return {
      uid: this.uid,
      email: this.email,
      nombreUsuario: this.nombreUsuario,
      nombreCompleto: this.nombreCompleto,
      pais: this.pais,
      preferenciasViaje: this.preferenciasViaje,
      intereses: this.intereses,
      actividadesPreferidas: this.actividadesPreferidas,
      fechaDeNacimiento: this.fechaDeNacimiento ? this.fechaDeNacimiento.toISOString().split('T')[0] : null,
      rol: this.rol,
      fechaCreacion: this.fechaCreacion ? this.fechaCreacion.toISOString() : null,
      profileImageUrl: this.profileImageUrl,    // NUEVO
    };
  }
}

module.exports = UsuarioSchema;