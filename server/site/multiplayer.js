"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ===========
// MULTIPLAYER
// ===========
// 
// The multiplayer mode works by decoupling the game logic from
// the animation. For every primitive command (move to the next
// tile, start building at your current position, start harvesting
// at your current position, etc.), a request is sent to the
// server, which hopefully distributes the commands to all clients
// in the next interval update. This might fail if any one of the
// clients lags too much, in which case all clients have to wait.

var multiplayer = {
    lastReceivedTick: 0,
    currentTick: 0,
    sentCommandForTick: false,
    commands: {},
    playerNumber: -1,
    interval: 100,

    sendCommand: function(mid, order, playerNumber) {
        var payload = {
            playerTick: multiplayer.currentTick,
            command: {
                player: playerNumber,
                mid: mid,
                details: order
            }
        };
        
        multiplayer.socket.emit('command', payload);
    },
    
    sendHeartbeat: function() {
        var payload = {
            playerTick: this.currentTick
        };
        
        this.socket.emit('command', payload);
    },

	joinOrCreateRoom: function(socket) {
		var roomName = prompt('Enter room to create/join');
		
		socket.emit('room_create_or_join', {
			name: roomName
		});
	},

	//end the game for this player.
	//used by victory screen.
	endGame: function() {
		this.socket.emit('room_disconnect');
	},

    //Set up a multiplayer game, which includes the event binding
    //and switching to the start room screen.
    mpSetup: function(socket) {
		 var self = this;
       this.socket = socket;
		 
       //latency measurement
       socket.on('ping', function() {
          socket.emit('pong');
       });

		 //rejection messages
		 socket.on('rejected', function(data) {
			 alert('Rejected by server - ' + data.reason);
			 self.joinOrCreateRoom(socket);
		 });
		 		 
		 //shall we join or create a room?
		 this.joinOrCreateRoom(socket);

		 //upon confirmation of room connection, ask for name and send
		 //pre-ready confirmation.
		 socket.on('room_joined', function() {
			 startScreenChat.playerName = prompt('Please enter your name');
			 //tell server we are ready to receive server info, and also send it
			 //our name.
			 socket.emit('player_preready', {
				 playerName: startScreenChat.playerName
			 });
		 });
		        
       //preready is when the server confirms the player connection,
       //so we can get info from the server about who we are and then
       //join the waiting room.
       socket.on('preready', function(data) {
          multiplayer.playerNumber = data.number;
          startScreenChat.show();
          startScreenChat.setup(socket);
       });

       //start the game when the server tells us.
       socket.on('start', function(data) {
          startScreenChat.hide();
          player.myID = multiplayer.playerNumber;
			 
            gotoGame([0, 1], 1);
			 
          setInterval(function() {
             mpUpdateLoop(socket);
          }, multiplayer.interval);
       });
		 
       //record frames from the server and commands as they come in.
       //processing of these commands on each frame is handled in
       //mpUpdateLoop.
       //this is one core of the lockstep networking model.
        socket.on('game_tick', function(data) {
           // We have:
           // data.tick
           // data.commands
           multiplayer.lastReceivedTick = data.tick;
			  
           if (data.commands) {
              multiplayer.commands[data.tick] = data.commands;
           }
        });
		 
       //if the server sends us debug messages, we should print them.
       socket.on('debug', function(data) {
          document.getElementById('debug').textContent = JSON.stringify(data);
       });
    }
}

// run on interval 100ms set up by main.js
//  this is the other core of the lockstep networking model.
function mpUpdateLoop(socket) {
    if (multiplayer.currentTick <= multiplayer.lastReceivedTick) {
        // process commands
        // => They will replace our update logic! ... somehow. =)
        var cmds = multiplayer.commands[multiplayer.currentTick];

        if (cmds) {
            for (var c = 0; c < cmds.length; c++) {
                var cmd = cmds[c];
                if (cmd) entityManager.processCommand(cmd);
            }
        }

        mouse.gatherInterval();

        // magic number: 0.06 * 100ms = 6 as du, which is 6 = 100ms / 16.666 ms
        world.mpUpdate(0.06 * multiplayer.interval);

        entityManager.mpUpdate(0.06 * multiplayer.interval);
        
        if (!multiplayer.sentCommandForTick) {
            console.log('curr tick:', multiplayer.currentTick);
            multiplayer.sendHeartbeat();
        }
        
        multiplayer.currentTick++;
        multiplayer.sentCommandForTick = false;
    }
}

var startScreenChat = {
    setup: function(socket) {
        this.socket = socket;
        var self = this;

        socket.on('startscreen_playerlist', function(data) {
            var playerList = document.getElementById('playerList');
            playerList.innerHTML = '';
            data.playerNames.forEach(function(name) {
                self.addPlayer(name);
            });
        });

        socket.on('startscreen_playerjoined', function(data) {
            self.addMessage({
                player: data.playerName,
                message: '<Joined the server>'
            });
        });

        socket.on('startscreen_receivemessage', function(data) {
            //data schema = { player: string, message: string }
            self.addMessage(data);
        });

        //ready up when pressed.
        var readyButton = document.getElementById('ready');
        readyButton.addEventListener('click', function() {
            self.ready();
        }, false);

        //send a message when pressing enter in the chat line.
        var chatline = document.getElementById('chatline');
        chatline.addEventListener('keypress', function(event) {
            //13 is the enter key
            var key = event.which || event.keyCode;
            if (key == 13) {
                //redeclare to avoid closure scope, though not sure if
                //this really will make it more efficient.
                var cl = document.getElementById('chatline');

                self.sendMessage(cl.value);
                cl.value = '';
                cl.focus();
            }
        }, false);

        //tell the server we are ready to interact with the start screen.
        socket.emit('startscreen_ready', {
            playerName: this.playerName
        });
    },

    sendMessage: function(message) {
        this.socket.emit('startscreen_sendmessage', {
            player: this.playerName,
            message: message
        });
    },

    addPlayer: function(playerName) {
        var el = document.createElement('div');
        el.className = 'player';
        el.textContent = playerName;
        var playerList = document.getElementById('playerList');
        playerList.appendChild(el);
    },

    addMessage: function(payload) {
        var now = new Date().toLocaleTimeString();
        var el = document.createElement('div');
        el.className = 'message';
        el.textContent = payload.player + '(' + now + '): ' + payload.message;
        var chat = document.getElementById('startRoomChat');
        chat.appendChild(el);
    },

    //called by pressing the ready button.
    ready: function() {
        this.socket.emit('ready');
        this.sendMessage('<Is Ready>');
    },

    show: function() {
        var canvas = document.getElementById('myCanvas');
        var roomScreen = document.getElementById('startRoom');
        var chatline = document.getElementById('chatline');
        canvas.style.display = 'none';
        roomScreen.style.display = 'inline';      
    },

    hide: function() {
        var canvas = document.getElementById('myCanvas');
        var roomScreen = document.getElementById('startRoom');
        var chatline = document.getElementById('chatline');
        canvas.style.display = 'inline';
        roomScreen.style.display = 'none';      
    }
};

var sendCommand = multiplayer.sendCommand;
