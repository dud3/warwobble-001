//this is idiotically designed because i just basically moved the original
//gloval server code into a "constructor"

function startMeasureLatency(player) {
   var measurement = {
		start: Date.now()
   };
	
   player.latencyTrips.push(measurement);
   player.socket.emit('ping');
}

function finishMeasureLatency(player) {
   var measurement = player.latencyTrips[player.latencyTrips.length - 1];
   console.log('latency measurement is', measurement);
   measurement.end = Date.now();
   measurement.roundTrip = measurement.end - measurement.start;
	
   player.averageLatency = 0;
   for (var c = 0; c < player.latencyTrips.length; c++) {
      player.averageLatency += measurement.roundTrip / 2;
   }
	
   player.averageLatency = player.averageLatency / player.latencyTrips.length;
   player.tickLag = Math.round(player.averageLatency * 2/100) + 1;
   console.log('player', player.number, 'has latency', player.tickLag);
}

function Room(name) {
	//players and global server variables.
	this.name = name;
	this.playernum = 0;
	this.players = [];
	this.currentServerTick = 0;
	this.currentServerCommands = [];
	this.gameInProgress = false;
	this.dead = false;
	this.interval = null; //the server interval function, cleared on cleanup.
}

Room.prototype.allReady = function() {
   if (this.players.length < 2) return false;
   
   for (var c = 0; c < this.players.length; c++) {
	   if (!this.players[c].ready) {
	      return false;
	   }
   }
	
   return true;
};

Room.prototype.upToDate = function() {
   for (var c = 0; c < this.players.length; c++) {
		var player = this.players[c];
		
	   if (player.lastConfirmedTick < this.currentServerTick) {
	      return false;
	   }
   }
	
   return true;
};

Room.prototype.getMaxLag = function() {
   var maxLag = 0;
	
   this.players.forEach(function(player) {
	   if (player.tickLag > maxLag) {
	      maxLag = player.tickLag;
	   }
   });
	
   return maxLag;
};

Room.prototype.getNames = function() {
   var names = [];
   this.players.forEach(function(player) {
      names.push(player.name);
   });
	
   return names;
};

Room.prototype.getLaggers = function() {
   //place holder
   return [];
};

//send a message to all players of this room over web sockets.
//could use socket.io full emit function, but that would broadcast
//to people we don't need to send information to.
Room.prototype.emit = function(type, message) {
	this.players.forEach(function(player) {
		player.socket.emit(type, message);
	});
};

Room.prototype.connect = function(socket) {
	if (!this.gameInProgress) {
		var player = {
			socket: socket,
			number: this.playernum,
			lastConfirmedTick: 0,
			averageLatency: 0,
			tickLag: 0,
			latencyTrips: [],
			ready: false
		};
		
		this.playernum++;
		this.players.push(player);
		
		console.log('player', player.number, 'joined');
		this.setUpChat(player, socket);
		this.setUpPlayer(player, socket);

		//confirm to player that he has joined this room.
		socket.emit('room_joined');
		return true;
	}
	else {
		return false;
	}
};

//insecure because someone could just send a ws event with the name
//and disconnect someone, but meh
Room.prototype.disconnect = function(playerName) {
	for (var c = 0; c < this.players.length; c++) {
		var player = this.players[c];

		if (player.name == playerName) {
			clearInterval(player.latencyInterval);
			this.players.splice(c, 1);
			break;
		}
	}

	if (this.players.length <= 0) {
		this.cleanup();
	}
};

//Set up start screen chat
//For most of these events we can just re-emit, as the data is
//always in the same format for sending and receiving.
Room.prototype.setUpChat = function(player, socket) {
	var self = this;
   //tell other people someone has joined.
   socket.on('startscreen_ready', function(data) {
      //re-emit the player list and a player joined message
      self.emit('startscreen_playerlist', {
         playerNames: self.getNames()
      });
      
      self.emit('startscreen_playerjoined', data);
   });
	
   //send chat messages to everyone (including the one who sent it)
   socket.on('startscreen_sendmessage', function(data) {
      self.emit('startscreen_receivemessage', data);
   });
};

//Set up core player events (latency, ready, preready, ticks)
Room.prototype.setUpPlayer = function(player, socket) {
	var self = this;
	
   //first thing: ask player for his latency every 10 sec
	//and immediately.
	player.latencyInterval = setInterval(function() {
		startMeasureLatency(player);
	}, 10000);

	startMeasureLatency(player);
	
   //event binding (receive client messages)
   //ALSO: ready confirmation - if everyone ready, start game.
   socket.on('ready', function() {
      console.log('player', player.number, 'is ready');
      player.ready = true;
		self.checkRoomReady();
   });
	
   //latency finish measurement
   socket.on('pong', function() {
      console.log('got pong from ' + player.name);
      finishMeasureLatency(player);
   });
	
   //receive a command
   //this is a core piece of the lockstep networking model.
   //schema: {tick: int, command: {} }
   //if command is present, we record it. otherwise is heartbeat
   socket.on('command', function(data) {
      player.lastConfirmedTick = data.playerTick + player.tickLag;
      
      if (data.command) {
         self.currentServerCommands.push(data.command);
	   }
   });
	
   //receive the player's name from the server and then tell them what
   //player number they are.
   socket.on('player_preready', function(data) {
      player.name = data.playerName;
      console.log('player name is', player.name);
      socket.emit('preready', {
         number: player.number
      });
   });

	//remove player from room on socket disconnect
	//or if they end the game
	socket.on('room_disconnect', function() {
		self.disconnect(player.name);
	});
	
	socket.on('disconnect', function() {
		self.disconnect(player.name);
	});
};

//main server loop (every 100ms)
Room.prototype.server = function() {
   if (this.upToDate()) {
	   var lag = this.getMaxLag();
	   var tick = this.currentServerTick + lag;
	   this.emit('game_tick', {
	      tick: tick,
	      commands: this.currentServerCommands
	   });
		
	   this.currentServerTick++;
	   this.currentServerCommands = [];
		
	   //calculate debug info
	   var playerInfo = {};
		
	   this.players.forEach(function(player) {
	      playerInfo[player.number] = {
		      ping: player.averageLatency,
		      tickLag: player.tickLag,
		      tick: player.lastConfirmedTick
	      };
	   });
		
	   this.emit('debug', {
	      serverTick: this.currentServerTick,
	      playerInfo: playerInfo
	   });
   }
   else {
	   var laggers = this.getLaggers();
	   console.log('laggers are', laggers);
   }
};

//check ready to actually start the room.
//called whenever someone sends the ready event.
Room.prototype.checkRoomReady = function() {
   if (this.allReady()) {
		console.log('everybody ready - starting game');

		this.players.forEach(function(player) {
			player.socket.emit('start', {
				number: player.number
			});
		});

		var self = this;
		this.interval = setInterval(function() {
			self.server();
		}, 100);
   }
};

Room.prototype.cleanup = function() {
	console.log('cleaning up room');
	clearInterval(this.interval);

	//remove player latency listeners
	this.players.forEach(function(player) {
		clearInterval(player.latencyInterval);
	});

	this.dead = true;
	return true;
};

//exports
module.exports.create = function(name) {
	return new Room(name);
};
