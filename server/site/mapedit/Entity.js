"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ======
// ENTITY
// ======
// 
// Provides a set of common functions which can be "inherited" by all other
// game Entities. Through the setup and setdown methods it also allows generic
// data to be filled in automagically, such that the specific unit- and building-
// implementations don't have to care too much about all the background work.

function Entity() {
};

Entity.prototype.setup = function (descr) {

    // Apply all setup properies from the (optional) descriptor
    for (var property in descr) {
        this[property] = descr[property];
    }
    
    // I am not dead yet!
    this._isDeadNow = false;
    
    // I am not selected.
    this.selected = false;

    // The pose system is... funky. ^^
    // We have curPoseF, which contains the
    // current pose as float (so that we can add
    // arbirarily small values).
    this.curPoseF = 1;
    // The plain curPose is just the floored value of curPoseF.
    this.curPose = 1;
    // Then we also have curPoseA, which is the adjusted
    // current pose. This one is the actual pose that is used
    // later on. We need it, because we save space in our
    // poses file by cycling through the first state several times.
    // Basically, if each row in the file gets a number from 1 to 5 assigned,
    // we logically go through 1,2,3,4,5,6 (using curPose).
    // However, there are only 5 actual poses in the file.
    // Therefore, what we actually do is going through 1,2,3,1,4,5 (using curPoseA).
    this.curPoseA = 1;
    this.maxPose = 6;
    // For buildings we take tileX and tileY to be the top left tile of the building
    // and collisions with buildings run over the grid in a hardcoded manner
    // (a tile with a building on it is set to impassable once the building arrives
    // and set to passable once the building is away).
    this.tileX = Math.floor(this.tileX);
    this.tileY = Math.floor(this.tileY);
    
    // These should never be called without being initialized somewhere else
    // before, but better be safe than sorry.
    this.harvestAtX = this.tileX;
    this.harvestAtY = this.tileY;

    this.curAction = 1; // 0 .. walk, 1 .. stop, etc.; for more, see action.js

    // 0 .. move to the place where stuff needs to be done
    // 1 .. do the actual stuff (e.g. harvesting, fighting)
    // 2 .. move back to base to deliever goodies
    // repeat with 0
    this.curSubAction = 0;

    // We use these render-offsets to present animations when there actually
    // are none - that is, during animation frames that lie within one single
    // timer interval, such that two animation frames basically only have the
    // same game data to work on.
    // These offsets are therefore highly imaginary and should not be treated
    // as anything reliable - they will be used for up to 100ms, and shouldn't
    // be trusted any further than that!
    this.renderOffX = 0;
    this.renderOffY = 0;
    this.renderOffcurPoseF = 0;
    this.renderTime = (new Date()).getTime();

    this.orientation = 4; // 0 .. up
                          // 1 .. right up
                          // 2 .. right
                          // 3 .. right down
                          // 4 .. down
                          // 5 .. left down
                          // 6 .. left
                          // 7 .. left up
    this.level = 1;
    
    // We didn't harvest anything yet.
    this.harvestedLumber = 0;
    this.harvestedGold = 0;
    this.harvestedOil = 0;

    this.actions = [];
    this.actN = [];
    
    for (var i = 0; i < action.amount; i++) {
        this.actions[i] = false;
        this.actN[i] = 0;
    }
    
    this.velX = 0;
    this.velY = 0;
    
    this.visible = true;
    
    // This is a pointer to our current home base, or 0.
    // It is used when we return home after harvesting, in which
    // case a new home base is searched for when the harvesting
    // is done, and then stored in this pointer here.
    this.home = 0;
    
    // a pointer to the closest gold mine, or 0
    this.goldmine = 0;
    
    // a pointer to our current enemy entity, or 0
    this.curEnemy = 0;
    
    // a pointer to the building that we are currently building, or 0
    this.curBuilding = 0;

    // We really shouldn't ignore enemies - that is, ignore it
    // when someone attacks us.
    // However, if the user wants to us to move away, then constantly
    // turning back towards the enemy isn't going to help, so in that
    // special case we actually do want to ignore the attacking enemies.
    this.ignoreEnemy = false;

    // We are just being created here, so it really is way too soon for thinking
    // about dying already, but still... it is nice to have it all in place,
    // just in case.
    this.isCorpse = false;
    this.corpseTime = 0;
    this.corpseSpriteX = 0;
    this.corpseSpriteY = 0;

    // Will be true once we want to be removed.
    // I mean, not just being dead (and therefore corpsified), but seriously
    // wanting to be completely removed from the game, fully.
    this.DELETED = false;
};

Entity.prototype.setdown = function (descr) {

    this.tilewidth = this.width / 32;
    this.tileheight = this.height / 32;

    this.cx = (this.tileX * 32) + (this.width / 2);
    this.cy = (this.tileY * 32) + (this.height / 2);

    // Our actual far-away target.
    this.targetX = this.cx;
    this.targetY = this.cy;

    // The next cx and cy position that we want to arrive at.
    this.nextX = this.cx;
    this.nextY = this.cy;
    
    // nextX and nextY as tiles
    this.nexttileX = this.tileX;
    this.nexttileY = this.tileY;

    // We have an offset because internally we represent each
    // building by its upper left tile, but in the original game
    // the middlemost lower right corner is used (so the tile in the
    // middle, unless the width is even, in which case the tile
    // just right to the bottom of the middle is used).
    this.tileOffX = Math.floor(this.tilewidth / 2);
    this.tileOffY = Math.floor(this.tileheight / 2);

    this.hp = this.maxhp;

    for (var i = 0; i < this.action.length; i++) {
        this.actions[action.fromIcon[this.action[i]]] = true;
        this.actN[action.fromIcon[this.action[i]]] = this.action[i];
    }
    
    // every entity should have icon 91 for their cancellation actions
    this.actN[9] = 91;
    this.actN[17] = 91;
    
    // we load the building action icons depending on our own race
    this.actN[11] = 39 - this.race;
    this.actN[12] = 43 - this.race;
    this.actN[13] = 41 - this.race;
    this.actN[14] = 45 - this.race;
    this.actN[15] = 47 - this.race;
    this.actN[16] = 61 - this.race;
};

Entity.prototype.kill = function () {
    this._isDeadNow = true;
};

Entity.prototype.canBuildEntityAt = function(race, buildtype, mx, my) {

    var buildable = 2, // 2 .. great, 1 .. maybe, 0 .. no way
        buildsize = entityList.sizes[race][buildtype],
        up = Math.min(buildsize[0] + mx, world.width),
        dn = Math.min(buildsize[1] + my, world.height);

    for (var i = mx; i < up; i++) {
        for (var j = my; j < dn; j++) {
            if (world.tilesVisible[i+1][j+1] === 2) {
                if ((world.tilesFree[i][j] > 0) &&
                    !((this.tileX === i) && (this.tileY === j))) {
                    return 0;
                }
            } else if (buildable > 1) {
                buildable = 1;
            }
        }
    }
    
    return buildable;
};

Entity.prototype.update = function (du) {

    if (this._isDeadNow) return entityManager.KILL_ME_NOW;

};
