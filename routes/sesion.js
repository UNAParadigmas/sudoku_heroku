/*
  @author Denis Rodriguez Viquez
          Luis Vasquez Quiros
          Walter Chavez Oviedo
          Manuel Masis Segura
  @since 2017
*/

var express = require('express');
var router = express.Router();

const Usuario = require("../model/usuario");

//login usuario
//ejemplo ARC= http://localhost:8080/api/login/vite0150/123
router.post('/login', function (req, res, next) {

    let data = req.body;
    console.log("LOGIN USUARIO");
    console.log("Login, data recibida: ", data.user +  data.pass)
    

    Usuario.findOne({
        usuario: data.user,
        pass: data.pass
    }, (err, usuario) => {
        if (err) {
            res.status(500).send(err);
        }
        console.log("Usuario encontrado: ", usuario);
        res.status(200).json(usuario);
    });
});


//registro usuario
//ejemplo ARC= http://localhost:8080/api/registro
//{"nombre" : "Juan","user" : "vite0150","pass" : "123"}
router.post('/registro', (req, res, next) => {
    let data = req.body;
    console.log("REGISTRO DE USUARIO, nombre: ", data.nombre);


    let newuser = new Usuario({
        nombre: data.nombre,
        usuario: data.user,
        pass: data.pass
    });

    Usuario.findOne({ usuario: newuser.usuario }, (err, usuario) => {
        if (err) {
            res.status(500).send(err);
        }
        if (usuario) {//ya existe ese usuario
            console.log("Error al registrar, el usuario: ", usuario.usuario+" ya EXISTE");
            res.status(500).send(null);
        }
        else {//el usuario se puede registrar

            newuser.save((err, usuario) => {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                }
                else {
                    console.log("usuario creado: ", usuario);
                    res.status(200).json(usuario);
                }
            });

        }
    });


});


//exportarlo para accederlo desde otros archivos
module.exports = router;