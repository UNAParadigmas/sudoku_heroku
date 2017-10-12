/*
  @author Denis Rodriguez Viquez
          Luis Vasquez Quiros
          Walter Chavez Oviedo
          Manuel Masis Segura
  @since 2017
*/

var express = require('express');
var router = express.Router();

const Historial = require("../model/historial");



/**
 * registros de juegos terminados para mostrar graficos de estadisticas
 */
router.post('/historial', (req, res, next) => {
    let data = req.body;
    console.log("Guardando nuevo historial");

    let newHistorial = new Historial({
        usuario: data._id,
        tiempo: data.partida.tiempo,
        dificultad: data.partida.dificultad
    })

    newHistorial.save((err, historial) => {
        if (err) {
            console.log(err.message);
            res.status(500).send(err);
        }
        else {
            console.log("historial guardado: ", historial);
            res.status(200).json(historial);
        }
    });

});

router.get('/historial/dificultad/:difi/identificacion/:id', (req, res) => {
    
    console.log("Cargando registros del jugador");
    Historial.find({ usuario: req.params.id, dificultad: req.params.difi }, null, { limit: 10, sort: {id:-1} }, (err, historiales) => {
        if (err) {
            console.log("error: ", err.message);
            res.status(500).send(err);
        }
        else {
            console.log("historiales encontrados: ", historiales);
            res.status(200).json(JSON.stringify(historiales));
        }
    });
});


router.get('/historial/:id', (req, res) => {
    
    console.log("Cargando cantidad de registros por dificultad");
    Historial.find({ usuario: req.params.id}, (err, historiales) => {
        if (err) {
            console.log("error: ", err.message);
            res.status(500).send(err);
        }
        else {
            let vec=[0,0,0];
            historiales.forEach(x=>{
                ++vec[x.dificultad];
            })
            console.log("Registros por dificultad: ", vec);
            res.status(200).json(JSON.stringify(vec));
        }
    });
});

module.exports = router;