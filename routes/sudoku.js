/*
  @author Denis Rodriguez Viquez
          Luis Vasquez Quiros
          Walter Chavez Oviedo
          Manuel Masis Segura
  @since 2017
*/

var express = require('express');
var router = express.Router();
var fs = require('fs');

const Sudoku = require("../model/sudoku");
const Usuario = require("../model/usuario");

//Sudoku
const {Board} = require("../sudoku_Solver/Board");


/**
 * guardar juego del usuario actual (enviar todo el usuario para buscar y actualizar)
 * PD: load no se ocupa porque los datos van a estar en el front end cuando inicion sesion
 */
router.put('/save', (req, res, next) => {
    let data = req.body;
    console.log("ACTUALIZANDO PARTIDA");
    Usuario.findOne({
        _id: data._id
    }, (err, usuario) => {
        if (err) {
            console.log("Error encontrar el usuario ", err.message)
            res.status(500).send(err);
        }
        console.log("Usuario encontrado: ", usuario);
        usuario.partida = data.partida;
        usuario.save((err, usuario) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            else {
                console.log("usuario actualizado: ", usuario);
                res.status(200).json(usuario);
            }
        });
    });
});



/**
 * Get generico de sudoku con switch basado en el param
 */
router.get('/sudoku/:param', (req, res) => {
    switch (req.params.param) {

        //buscar sudoku al azar y enviarlo
        case "newSudoku": {
            console.log("Obteniendo un sudoku al azar de la BD")

            Sudoku.aggregate([{ $sample: { size: 1 } }], (err, sudoku) => {
                if (err) {
                    console.log("Error al obtener sudoku al azar ", err.message)
                    res.status(500).send(err);
                }
                console.log("Sudoku encontrado: ", sudoku[0].hilera);
                res.status(200).json(sudoku[0]);
            });
        } break;

        //importar sudokus del .txt a la bd
        case "import": {
            console.log("Importando sudokus a la base de datos");
            Sudoku.count((err, count) => {
                if (err) {
                    console.log("error inesperado", err.message);
                    res.send(err);
                }
                else if (count == 0) {
                    fs.readFile('./Sudoku App/files/9x9(1465).txt', 'utf8', (err, data) => {
                        if (err) console.log("error al leer el archivo " + err.message);
                        let datos = data.split(/\r?\n/);

                        datos.map(sudoku => {
                            let newSudoku = new Sudoku({
                                hilera: sudoku
                            });

                            newSudoku.save((err) => {
                                if (err) {
                                    console.log(err.message);
                                    res.send(err);
                                }
                            });
                        });
                        console.log("Importacion exitosa");
                        res.status(200).json("importacion correcta");
                    });
                }
                else {
                    console.log("sudokus cargados anteriormente");
                    res.status(200).json("sudokus cargados anteriormente");
                }
            });
        } break;

    }
});

router.post('/sudoku/solve', function (req, res, next) {
    let data = req.body;
    console.log("RESOLVIENDO EN SERVER", data);
    
    //llega sudoku actual
    board = new Board();
    board.setString(data.actual,true);
    let startTime = new Date().getTime();
    let totalTime;
    if (board.trySolve()) {
		console.log("RESUELTO: ", board.stringAct);
        totalTime = ((new Date()).getTime() - startTime) / 1000
        res.status(200).json({ "msg": true, "actual": board.stringAct, "tiempo": totalTime });
    }
    else {
        totalTime = -1;
        res.status(500).json({ "msg": false, "actual": board.stringAct, "tiempo": totalTime });
    }


});

module.exports = router;