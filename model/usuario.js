/*
  @author Denis Rodriguez Viquez
          Luis Vasquez Quiros
          Walter Chavez Oviedo
          Manuel Masis Segura
  @since 2017
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsuarioSchema = new Schema({
	nombre: { type: String, max: 35 },
	usuario: { type: String, required: true, max: 35 }, //usuario
	pass: { type: String, required: true, max: 35 }, //contraseña
	partida: { //Partida actual guardada en el perfil del usuario
		dificultad: Number, //Nivel de  dificultad
		tiempo: Number,
		sudokuGuardado: String,
		sudokuUndo: [String]
	}
});

module.exports = mongoose.model('Usuario', UsuarioSchema);