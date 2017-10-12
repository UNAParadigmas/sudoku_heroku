/*
  @author Denis Rodriguez Viquez
          Luis Vasquez Quiros
          Walter Chavez Oviedo
          Manuel Masis Segura
  @since 2017
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SudokuSchema = new Schema({
	hilera: String
});

module.exports = mongoose.model('Sudoku', SudokuSchema);