var bullet = require('./bullet.js'); 

var players = {};
var arrayBullets = [];
var time = new Date().getTime();

var onJoined = function(socket) {
	socket.on('join', function(data){
		socket.join('room1');

		socket.name = data.name;

		players[data.name] = data;

		socket.emit('initData', {
			players: players,
			arrayBullets: arrayBullets
		});
	});
};

var onMsg = function(socket) {
	socket.on('createPlayer', function(data){
		players[data.name] = data;
	});
	socket.on('updatePlayer', function(data){
		players[data.name].pos = data.pos;
	});
};

var onDisconnect = function(socket) {
	socket.on('disconnect', function(){
		delete players[socket.name];
	});
};

var update = function(io){
	var keys = Object.keys(players);
	var now = new Date().getTime();

	// in seconds
	var dt = (now - time) / 1000;
	time = now;

	// update bullets
	for(var i = 0; i<arrayBullets.length; i++){
		arrayBullets[i].update(dt);
	}

	// update player
	for(var i = 0; i < keys.length; i++){
		var player = players[ keys[i] ];

		for(var j=0; j<arrayBullets.length; j++){
			// if a player hits a bullet
			var distance = circlesIntersect(player.pos, arrayBullets[j].pos);

			if(distance <= (player.radius + arrayBullets[j].radius)){
				player.hit = 200;
				arrayBullets[j].active = false;
				player.score = 0;
			}
			else if(player.hit > 0){
				player.hit--;
			}
			else{
				player.score++;
			}
		}
	}

	// remove bullets that are out of bound
	arrayBullets = arrayBullets.filter(function(bullet){
		return bullet.active;
	});

	// add new bullets if there are less the 20
	if (arrayBullets.length < 30){
		var num = 30 - arrayBullets.length;

		for(var i=0; i<num; i++){
			arrayBullets.push(bullet.create(getRandom(20, 480), -50, 10, getRandom(-1, 1) * 150, getRandom(0.5, 1) * 150));
		}
	}

	io.sockets.in('room1').emit('update', {
		players: players,
		arrayBullets: arrayBullets
	});
};

//Utilties
function getRandom(min, max) {
  	return Math.random() * (max - min) + min;
}

function circlesIntersect(c1,c2){
	var dx = c2.x - c1.x;
	var dy = c2.y - c1.y;
	var distance = Math.sqrt(dx*dx + dy*dy);
	return distance;
}

module.exports.onJoined = onJoined;
module.exports.onMsg = onMsg;
module.exports.onDisconnect = onDisconnect;
module.exports.update = update;