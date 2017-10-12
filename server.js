/*
  @author Denis Rodriguez Viquez
          Luis Vasquez Quiros
          Walter Chavez Oviedo
          Manuel Masis Segura
  @since 2017
*/

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var sudoku = require('./routes/sudoku');
var sesion = require('./routes/sesion');
var historial = require('./routes/historial');

var app = express();


//Motor de vista
app.set('views', path.join(__dirname, 'Sudoku App'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//static folder (archivos estaticos, para JS, css, imagenes, etc)
app.use(express.static(path.join(__dirname, 'Sudoku App')));

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:0150@ds141242.mlab.com:41242/sudoku_paradigmas', {
//mongoose.connect('mongodb://localhost/sudoku', {
    useMongoClient: true
});
var db = mongoose.connection;
db.on('error', console.log.bind(console, 'Error al conectar a la DB !!!!!'));
db.once('open', console.log.bind(console, 'Conectado a la DB !!!!!'));



app.use('/api', sudoku);
app.use('/api', sesion);
app.use('/api', historial);
app.get('*', (req, res) => {
    res.render('index.html');
});
var server = app.listen(process.env.PORT || 8080, () => {
    var port = server.address().port;
    console.log("App corriendo en puerto: ", port);
});
