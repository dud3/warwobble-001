"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ====================
// PLAYER-RELATED STUFF
// ====================
// 
// This file keeps track of the players' resources as well as
// doing some housekeeping on the actual amount of players
// present. Also, the value of myID should always be taken
// to be the ID of the human player - of "us", basically.
// Especially in a multiplayer game, it cannot be assumed that
// this ID always coincides with 0.

var player = {

    // This is us! =)
    me: {},
    // This is our ID.
    myID: 0,
    // This is the ID of the neutral player.
    neutralID: 2,
    // This will be the amount of players later on.
    // So far we leave it at 2, as most of the code
    // is still using the hardcoded 2-player-assumption;
    // however, one by one we want to replace everything
    // to make it available for N players.
    // However, we have the numerical value 3 here,
    // because we also need to account for the neutral player
    // (who owns sheep, goldmines, etc.).
    amount: 3,
    // An array that assigns colors based on race.
    // Of course, in the future we would like to change
    // this and allow different colors for the same
    // race, but that would mean either lots and lots
    // of new sprites, or changing sprites on the fly
    // on the client's system... So, let's do that later.
    // Or never. We'll see.
    raceToColor: ["#A10000", "#0094FC", "#FCFC00"],
    raceToMiniColor: ["#D00000", "#0094FC", "#FCFC00"],

    p: [], // an array of players
    
    // takes an array of races, where each number in the
    // array is the player ID and each race is an integer
    // value
    reset: function(players) {
        this.p = [];
        
        // if no specific players are specified,
        // we just take orcs until we get to our
        // own ID
        if (players.length < 1) {
            for (var i = 0; i < this.myID + 1; i++) {
                players[i] = 0;
            }
        }

        // never forget the neutral player!
        players[players.length] = 2;

        this.amount = players.length;

        this.neutralID = this.amount - 1;

        for (var i = 0; i < this.amount; i++) {
            this.p[i] = {};
            this.reset_player(this.p[i], players[i], i);
        }
        
        this.p[this.amount - 1].neutral = true;

        this.me = this.p[this.myID];
        
        entityManager.reset();
    },
    
    reset_player: function(pl, pl_race, num) {
        pl.id = num; // a player should keep track of his own ID
        pl.gold = 0;
        pl.lumber = 0;
        pl.oil = 0;
        pl.food = 0;
        pl.eaten = 0;
        pl.race = pl_race;
        pl.color = this.raceToColor[pl_race];
        pl.neutral = false;
        pl.harvestGold = 100;
        pl.harvestLumber = 100;
        pl.harvestOil = 100;
        // All computer controlled players are aggressive, except for
        // the neutral player, who is not.
        pl.AI = (this.neutralID === num) || (singleplayer.on && !(this.myID === num));
        pl.aggressive = (singleplayer.on && !(this.myID === num)) && !(this.neutralID === num);
    },
    
    update: function(du) {

        if (!screenManager.curFrame.visible) return;
        
        var lostOrWon = [];
        var lostAmount = 0;

        // check if anyone won, but not the neutral player

        for (var i = 0; i < this.amount - 1; i++) {
            var nounitfound = true;
            var cat = entityManager._p[i];

            for (var k = 0; k < cat.length; k++) {
                if (!cat[k].isBuilding) {
                    nounitfound = false;
                    break;
                }
            }

            if (nounitfound) {
                lostOrWon[i] = 0;
                lostAmount += 1;
            } else {
                lostOrWon[i] = 1;
            }
        }
        
        // all players lost except for one
        if (lostAmount >= this.amount - 2) {
            if (lostOrWon[this.myID] === 0) {
                screenManager.defeatFrame.show();
            } else {
                screenManager.victoryFrame.show();
            }
        }
        
    }
};