// backend/models/Usuario.js (Versión Recomendada)

class UsuarioSchema {
  constructor(uid, email, nombreUsuario, nombreCompleto, pais, preferenciasViaje, intereses, actividadesPreferidas, fechaDeNacimiento) {
    this.uid = uid;
    this.email = email;
    this.nombreUsuario = nombreUsuario;
    this.nombreCompleto = nombreCompleto;
    this.pais = pais;
    this.preferenciasViaje = preferenciasViaje;
    this.intereses = intereses;
    this.actividadesPreferidas = actividadesPreferidas;
    // Almacena como Date; Firestore lo convertirá a Timestamp al guardar.
    this.fechaDeNacimiento = new Date(fechaDeNacimiento);
    this.rol = 'usuario';
    this.fechaCreacion = new Date();
  }

  /**
   * toJSON se usa cuando JSON.stringify se llama sobre la instancia,
   * o cuando se devuelve directamente la instancia en res.json().
   * Convierte los objetos Date a strings legibles:
   * - fechaDeNacimiento => 'YYYY-MM-DD'
   * - fechaCreacion => ISO datetime
   */
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
      fechaCreacion: this.fechaCreacion ? this.fechaCreacion.toISOString() : null
    };
  }
}

module.exports = UsuarioSchema;