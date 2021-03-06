"use strict";

(function(){
	var socket;
	var canvas;
	var ctx;

	var user = {};
	var highScore, currentScore;

	var players = {};
	var arrayBullets = [];
	var time;
	var updated = false;

	function init() {
		socket = io.connect();
		canvas = document.querySelector('canvas');
		ctx = canvas.getContext('2d');

		canvas.setAttribute( 'width',  500);
		canvas.setAttribute( 'height', 500);

		setupUI();
		setupSocket();

		setInterval(update, 1000/60);
	}

	function setupUI(){
		user.name = document.querySelector('#user').innerHTML.substring(9);
		if(user.name == ''){
			user.name = "Guest " + Math.floor(Math.random()*100);
		}
		else{
			document.querySelector('#highScore').innerHTML = highScore;
			document.querySelector('#currentScore').innerHTML = currentScore;
			document.querySelector('#score').value = highScore;
		}
		highScore = 0;
		currentScore = 0;
	}

	// sets up the socket
	function setupSocket(){
		var pos = {
			x: Math.floor(Math.random()*451),
			y: Math.floor(Math.random()*451),
		};

		var color = {
			r: Math.floor(Math.random()*256),
			g: Math.floor(Math.random()*256),
			b: Math.floor(Math.random()*256)
		};

		user.pos = pos;
		user.radius = 20;
		user.color = color;
		user.hit = 0;

		socket.emit('join', {
			name: user.name,
			pos: pos,
			radius: 20,
			color: color,
			hit: 0,
			score: 0,
		});

		// get other clients data from server
		socket.on('initData', function(data){
			players = data.players;
			arrayBullets = data.arrayBullets;
		});

		// updates player movements & bullets
		socket.on('update', function(data){
			players = data.players;
			arrayBullets = data.arrayBullets;
			draw();
		});
	}

	// update
	function update(){
		var now = new Date().getTime(),
		//in seconds
			dt = (now - time)/1000;

		time = now;


		updated = false;

		if(myKeys.keydown[myKeys.KEYBOARD.KEY_W] == true){
			user.pos.y += -100 * dt;
			updated = true;
		}
		if(myKeys.keydown[myKeys.KEYBOARD.KEY_A] == true){
			user.pos.x += -100 * dt;
			updated = true;
		}
		if(myKeys.keydown[myKeys.KEYBOARD.KEY_S] == true){
			user.pos.y += 100 * dt;
			updated = true;
		}
		if(myKeys.keydown[myKeys.KEYBOARD.KEY_D] == true){
			user.pos.x += 100 * dt;
			updated = true;
		}

		// prevent player from going out of bound
		user.pos.x = clamp(user.pos.x, 20, 480);
		user.pos.y = clamp(user.pos.y, 20, 480);

		// if this client's user moves, send to server to update other clients
		if(updated == true){
			socket.emit('updatePlayer', {
				name: user.name,
				pos: user.pos
			});
		}
	}

	// draw other client's object
	function draw(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		var keys = Object.keys(players);

		for(var i = 0; i < keys.length; i++){
			var drawCall = players[ keys[i] ];
			if(drawCall.hit > 0){
				ctx.fillStyle = "rgb(" + (255 - drawCall.color.r) + ", " + (255 -drawCall.color.g) + ", " + (255 -drawCall.color.b) + ")";
			}	
			else{		
				ctx.fillStyle = "rgb(" + drawCall.color.r + ", " + drawCall.color.g + ", " + drawCall.color.b + ")";
			}
			ctx.beginPath();
			ctx.arc(drawCall.pos.x, drawCall.pos.y, drawCall.radius, 0, Math.PI * 2, false);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			if(drawCall.name == user.name){
				currentScore = drawCall.score;
				if(highScore < currentScore){
					highScore = currentScore;
				}
				document.querySelector('#highScore').innerHTML = 'High Score: ' + highScore;
				document.querySelector('#currentScore').innerHTML = 'Current Score: ' + currentScore;
				document.querySelector('#score').value = highScore;
			}
		}

		for(var i = 0; i<arrayBullets.length; i++){
			ctx.fillStyle = 'black';
			ctx.beginPath();
			ctx.arc(arrayBullets[i].pos.x, arrayBullets[i].pos.y, arrayBullets[i].radius, 0, Math.PI*2, false);
			ctx.fill();
			ctx.closePath();
		}
	}

	// Utilities
	function clamp(val, min, max){
		return Math.max(min, Math.min(max, val));
	}

	// Keyboard stuff
	var myKeys = {};
	myKeys.KEYBOARD = {
		"KEY_W": 87,
		"KEY_A": 65,
		"KEY_S": 83,
		"KEY_D": 68
	};

	myKeys.keydown = [];
	// event listeners
	window.addEventListener("keydown",function(e){
		myKeys.keydown[e.keyCode] = true;
	});
		
	window.addEventListener("keyup",function(e){
		myKeys.keydown[e.keyCode] = false;
	});

	window.onload = init;
	window.onunload = function(){
		socket.emit('disconnect');
	};
}());