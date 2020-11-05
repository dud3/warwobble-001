"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ============
// SINGLEPLAYER
// ============
// 
// The singleplayer mode works very similar to the multiplayer
// mode. Again, the game logic and the animation are decoupled,
// and for every primitive command, a request is sent to the
// server. However, here the "server" is only imaginary, and
// the given commands are simply returned in the next interval
// update.

var singleplayer = {
    // an array that contains all the commands
    // that are currently wiating to be processed
    commands: [],
    interval: 100,
    intervalID: 0,
    // true if we are in singleplayer mode, false if not
    on: true,
    useReqAniFrame: true,

    // ID of the update that is currently being made
    updateID: 0,
    // defines some general things necessary for resetting the initial state
    // to start replaying
    replaySystem: {
        players: [0, 0],
        mapNo: "",
        maxID: 0,
        playing: false,
        commands: [],
        
        restart: function() {
            // save the current camera position
            var ocamL = world.camL,
                ocamT = world.camT,
                ocamR = world.camR,
                ocamB = world.camB;

            this.maxID = singleplayer.updateID;

            if (!singleplayer.useReqAniFrame) {
                clearInterval(singleplayer.intervalID);
            }

            
            // array copies are fun! =)

            var somePlayers = [];

            for (var i = 0; i < this.players.length; i++) {
                somePlayers[i] = this.players[i];
            }

            gotoSingleplayerGameDirectly(somePlayers, this.mapNo);

            // go back to the saved camera position
            world.camL = ocamL;
            world.camT = ocamT;
            world.camR = ocamR;
            world.camB = ocamB;
        }
    },
    
    // we here need a playerNumber because in singleplayer-mode,
    // one program is actually responsible for several players:
    // the real user as well as the AI controlled players
    sendCommand: function(mid, order, playerNumber) {
        singleplayer.commands.push({
    	    player: playerNumber,
    	    mid: mid,
    	    details: order
    	});
    },
    
    update: function(du) {
    
        var cmds = singleplayer.commands;
        
        var rS = singleplayer.replaySystem;

        if (rS.playing) {
            if (singleplayer.updateID >= rS.maxID) {
                cmds = [];
                rS.restart();
            }

            var rScmds = rS.commands[singleplayer.updateID];

            if (rScmds) {
                for (var i = 0; i < rScmds.length; i++) {
                    cmds.push(rScmds[i]);
                }
            }
        }
        
        singleplayer.replaySystem.commands[singleplayer.updateID] = cmds;
        singleplayer.updateID++;
        
        for (var c = 0; c < cmds.length; c++) {
            if (cmds[c]) entityManager.processCommand(cmds[c]);
        }
        
        singleplayer.commands = [];
        
        mouse.gatherInterval();
        
        world.mpUpdate(du);
    
        entityManager.mpUpdate(du);
    },
    
    switchReqAniFrame: function() {
    
        if (this.on) {
            if (singleplayer.useReqAniFrame) {
                clearInterval(this.intervalID);
            } else {
                this.intervalID = setInterval(function() {
                    spUpdateLoop();
                }, this.interval);
            }
        }
    }
}

// run on interval 100ms set up by main.js
function spUpdateLoop() {
    // magic number: 0.06 * 100ms = 6 as du, which is 6 = 100ms / 16.666 ms
    singleplayer.update(0.06 * singleplayer.interval);
}