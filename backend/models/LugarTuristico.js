class LugarTuristico {
  constructor(id, nombre, descripcion, ubicacion) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.ubicacion = ubicacion; // Puede ser un objeto con latitud y longitud
  }
}

module.exports = LugarTuristico;