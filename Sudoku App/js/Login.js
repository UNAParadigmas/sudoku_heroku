/*
  @author Denis Rodriguez Viquez
          Luis Vasquez Quiros
          Walter Chavez Oviedo
          Manuel Masis Segura
  @since 2017
*/

$( document ).ready(() => {
	$().cargaSudokus(); //carga los sudokus a la base
	$().checkSession();	
});


$(function () {
	let $formLogin = $('#login-form');
	let $formLost = $('#lost-form');
	let $formRegister = $('#register-form');
	let $divForms = $('#div-forms');
	let $modalAnimateTime = 300;
	let $msgAnimateTime = 150;
	let $msgShowTime = 2000;

	$("form").submit(function (e) {
		e.preventDefault();
		switch (this.id) {
			case "login-form":
				let $lg_username = $('#login_username').val();
				let $lg_password = $('#login_password').val();
				let loginData = { user: $lg_username, pass: $lg_password };
				console.log("usuario/pass del form: ", $lg_username + "/" + $lg_password);

				$.ajax({
					type: 'POST',
					data: JSON.stringify(loginData),
					contentType: 'application/json',
					dataType: 'json',
					url: "api/login"
				}).done(result => {
					if (result == null) {
						msgChange($('#div-login-msg'), $('#icon-login-msg'), $('#text-login-msg'), "error", "glyphicon-remove", "Login Incorrecto");
					}
					else {

						let user=JSON.stringify(result);
						console.log("Resultado login: " + user);
						msgChange($('#div-login-msg'), $('#icon-login-msg'), $('#text-login-msg'), "succes", "glyphicon-ok", "Bienvenido " + result.nombre);
						setTimeout(() => {
							hideLogin();
							$().loginUsuario(result);
						}, 1000);
					}

				}).catch(err => {
					msgChange($('#div-login-msg'), $('#icon-login-msg'), $('#text-login-msg'), "error", "glyphicon-remove", "Login error");
				});
				break;

			case "register-form":
				let $rg_username = $('#register_username').val();
				let $rg_name = $('#register_name').val();
				let $rg_password = $('#register_password').val();
				let $rg_password2 = $('#register_password2').val();
				let registerData = { user: $rg_username, pass: $rg_password, nombre: $rg_name };

				if ($rg_password !== $rg_password2) {
					msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "error", "glyphicon-remove", "Passwords doesn't match");
					break;
				}

				$.ajax({
					type: 'POST',
					data: JSON.stringify(registerData),
					contentType: 'application/json',
					dataType: 'json',
					url: "api/registro"
				}).done(result => {

					if (result == null) {
						msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "error", "glyphicon-remove", "Error al registrar");
					}
					else {
						console.log("Resultado del registro: " + result);
						msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "succes", "glyphicon-ok", "Bienvenido " + result.nombre);
						setTimeout(() => {
							hideLogin();
							$().loginUsuario(result);
						}, 1000);
					}

				}).catch(err => {
					msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "error", "glyphicon-remove", err);
				});

				break;
			default:
				return false;
		}
		return false;
	});

	$("#logoutBtn").click(e => {
		e.preventDefault();
		console.log("LOGOUT");
		$().logoutUsuario();
		localStorage.removeItem('usuario');
		
		$("#canvas").show();
		$("#onStart").hide();
		$("#statusMsg").hide();
		$('#logoutBtn').hide();
		$('.logged').hide(); 
		$('#loginBtn').show();
		$.ajax({
			type: 'GET',
			dataType: 'json',
			url: "api/sudoku/newSudoku"
		})
			.done(result => {
				var val = $('#sel1 option:selected').text();
				console.log("Nuevo sudoku: ", result.hilera);
				$().creaCanvas([result.hilera], 0);
			})
			.fail(err => {
				console.log("error de conexion con backend: ");
				var val = $('#sel1 option:selected').text();
				$().creaCanvas(["8.5.....2...9.1...3.........6.7..4..2...5...........6....38.....4....7...1.....9."], 0);
			});
			
			
			

	});

	$('#login_register_btn').click(function () { modalAnimate($formLogin, $formRegister) });
	$('#register_login_btn').click(function () { modalAnimate($formRegister, $formLogin); });
	$('#login_lost_btn').click(function () { modalAnimate($formLogin, $formLost); });
	$('#lost_login_btn').click(function () { modalAnimate($formLost, $formLogin); });
	$('#lost_register_btn').click(function () { modalAnimate($formLost, $formRegister); });
	$('#register_lost_btn').click(function () { modalAnimate($formRegister, $formLost); });

	function modalAnimate($oldForm, $newForm) {
		let $oldH = $oldForm.height();
		let $newH = $newForm.height();
		$divForms.css("height", $oldH);
		$oldForm.fadeToggle($modalAnimateTime, function () {
			$divForms.animate({ height: $newH }, $modalAnimateTime, function () {
				$newForm.fadeToggle($modalAnimateTime);
			});
		});
	}

	function msgFade($msgId, $msgText) {
		$msgId.fadeOut($msgAnimateTime, function () {
			$(this).text($msgText).fadeIn($msgAnimateTime);
		});
	}
	
	function msgChange($divTag, $iconTag, $textTag, $divClass, $iconClass, $msgText) {
		let $msgOld = $divTag.text();
		msgFade($textTag, $msgText);
		$divTag.addClass($divClass);
		$iconTag.removeClass("glyphicon-chevron-right");
		$iconTag.addClass($iconClass + " " + $divClass);
		setTimeout(function () {
			msgFade($textTag, $msgOld);
			$divTag.removeClass($divClass);
			$iconTag.addClass("glyphicon-chevron-right");
			$iconTag.removeClass($iconClass + " " + $divClass);
		}, $msgShowTime);
	}
});

	$.fn.checkSession = () => {
		let data = localStorage.getItem('usuario');
		if (data !== null) {
			data=JSON.parse(data);
			console.log("usuario en local storage: ", data);
			hideLogin();
			$().loginUsuario(data);
		} else {
			console.log("No hay datos de usuario en el local storage");
			$('#logoutBtn').hide();
		}
	}
	
	$.fn.loginUsuario = function(user){
	usuario = user;
	localStorage.removeItem('usuario');
	localStorage.setItem('usuario', JSON.stringify(usuario));
	chart();
	chart2();
	if (usuario.partida.sudokuUndo.length > 0) {
		console.log("CARGANDO SUDOKU DEL USUARIO LOGEADO");
		$().creaCanvas(usuario.partida.sudokuUndo, usuario.partida.tiempo);
		
	}
	else { //es un usuario nuevo, sin partidas guardadas
		if(game.board.stringAct.length > 1){ //verificar si ya inicio un sudoku
			usuario.partida.sudokuUndo=game.board.stringAct;
			$().creaCanvas([usuario.partida.sudokuUndo], 0);
		}
		else{
			$("#canvas").show();
			$("#onStart").hide();
			$("#statusMsg").hide();
			$.ajax({
				type: 'GET',
				dataType: 'json',
				url: "api/sudoku/newSudoku"
			})
				.done(result => {
					console.log("Nuevo sudoku: ", result.hilera);
					$().creaCanvas([result.hilera], 0);
				})
				.fail(err => {
					console.log("error de conexion con backend: ");
					$().creaCanvas(["8.5.....2...9.1...3.........6.7..4..2...5...........6....38.....4....7...1.....9."], 0);
				});
		}
		
	}
		$("#onStart").hide();
		$("#statusMsg").hide();
		$("#canvas").show();
	}


	function hideLogin() {
		$('#login-modal').modal('hide');
		$('#loginBtn').hide();
		$('#logoutBtn').show();
		$('.logged').show();
	}

/**
 * Cargar la lista de sudokus del txt a la base de datos al inicio (primero verificando si ya existen)
 */
$.fn.cargaSudokus = () => {
	$.ajax({
		type: 'GET',
		dataType: 'json',
		url: "api/sudoku/import"
	}).done(result => {
		console.log("Cargando sudokus a la base de datos: ", result);

	}).fail(err => {
		console.log("Error al conectar con el servidor para cargar los sudokus", err);
	});
}