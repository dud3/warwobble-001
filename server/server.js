/*
 important limitation: game must be fully deterministic (floating point
 math could be difficult) useful book pages:
 - 120: diff between animation loop and draw loop
 - 325ish: multiplayer networking
 - 170: processing commands

 possible issues: how primitive do we have to make the command set?
 book says ?
 - internet seems to say we should sync every single frame. that is
   probably the safest thing to do.
 - this may not integrate well with requestAnimationFrame. example has it
   working with constant 100ms intervals on both sides.
 - book splits animationLoop and drawLoop. AL is on an interval and handles
   game logic updates. drawLoop is run via requestAnimationFrame.
 - we need to have a process command and send command (diff for SP/MP).
   SP simply delegates immediately to process command while MP sends it
   off to the server.
 
 client keeps track of its own ticks. web socket events: 
 - game_tick event: update last received tick and store any commands
   for that tick.

 in game loop:
 - if our curr tick is <= server's last sent tick, update simulation by
   processing any commands for the current tick.
 - then draw the world (render)
 - if we have not sent a command, send an empty command to tell the server
   we are alive (and transmit our tick).

 server web socket events:
 - receive command: push the command if it is non-empty, and record the
   player's last confirmed tick
 
 in the server loop:
 - if all players last confirmed tick >= to server tick, send a web
   socket msg containing commands to execute for the current server tick
   + room tick lag (max of all player tick lags). increment current
   server tick. clear out commands.
 - if all players are NOT >= curr server tick, someone is lagging. we can
   loop through and detect who is lagging (last confirmed tick < server tick)

 this seems fairly simple to do, so we will need to define a command set that
 covers actions in the game, which are probably primitives (e.g. move, build
 here, gather here)

 unit actions are defined as a set of primitive commands. for example, build
 action will be a set of move commands then a set of build progress commands.

*/

//server keeps track of its own ticks, and ticks of all players.
// - 
// - 

//client sends a command to the server it wants to execute.
//server receives command from user, adds it to a queue?

var http = require('http'),
    staticFileServer = require('node-static'),
    io = require('socket.io'),
    fs = require('fs'),
    path = require('path'),
	 rooms = require('./rooms');

var site = new staticFileServer.Server('./site', {
    cache: 0
});

//static file server to serve all js and the index file.
var app = http.createServer(function(req, res) {
    req.addListener('end', function() {
		 site.serve(req, res);
    }).resume();
});

app.listen(3000);

//keep track of rooms
var roomList = [];

function getRoomNames() {
	var names = [];

	roomList.forEach(function(room) {
		names.push(room.name);
	});

	return names;
};

//the actual server code.
//socket io server
var wobble = io.listen(app);

wobble.sockets.on('connection', function(socket) {
	//player creates or joins a room
	//(leaving room handled inside room itself.)
	socket.on('room_create_or_join', function(data) {
		for (var c = 0; c < roomList.length; c++) {
			var room = roomList[c];

			if (room.name == data.name) {
				var connected = room.connect(socket);

				if (!connected) {
					socket.emit('rejected', {
						reason: 'The room rejected you - game probably started'
					});
				}
				
				return;
			}
		}

		//room does not exist, create it.
		var room = rooms.create(data.name);
		roomList.push(room);
		room.connect(socket);
	});

	//broadcast room list
	socket.emit('room_list', {
		rooms: getRoomNames()
	});
});

//clean up dead rooms every 10 sec
setInterval(function() {
	for (var c = 0; c < roomList.length; c++) {
		var room = roomList[c];
		if (room.dead) {
			console.log('room ' + room.name + '(' + c + ') dead; removing.');
			delete roomList[c];
		}
	}

	roomList = roomList.filter(function(a) {
		return typeof a !== 'undefined';
	});
}, 10 * 1000);
