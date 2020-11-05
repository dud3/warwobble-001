/*

entityManager.js

A module which handles arbitrary entity-management for "WarWobble"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops 
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/


var entityManager = {

// "PRIVATE" DATA

_p   : [[],[],[]],

// PUBLIC METHODS

// A special return value, used by other objects,
// to request the blessed release of death!
//
KILL_ME_NOW : -1,

// Some things must be deferred until after initial construction
// i.e. thing which need `this` to be defined.
//
deferredSetup : function () {
    this._categories = [this._p[0], this._p[1], this._p[2]];
},

// the generated unit is given back - just in case someone wants
// to do something with it =)
generateUnit : function(descr, ourplayer) {
    descr.id = this._p[ourplayer].length;
    descr.belongsTo = ourplayer;
    this._p[ourplayer].push(entityList.constructors[descr.race][descr.type](descr));

    var curEnt = this._p[ourplayer][descr.id];

    if (curEnt.isBuilding) {
        for (var i = 0; i < curEnt.tilewidth; i++) {
            for (var j = 0; j < curEnt.tileheight; j++) {
                world.tilesFree[curEnt.tileX + i][curEnt.tileY + j] = 1;
            }
        }
    }
    
    return curEnt;
},

// delete all entities
dropAll: function() {

    this._p = [[],[],[]];

    this.deferredSetup();

},

// unselect all entities
unselectAll: function() {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        for (var i = 0; i < aCategory.length; ++i) {

            aCategory[i].selected = false;

        }
    }
},

// Find entity in specific tile - even buildings; and yes, their sizes are taken into account,
// thank you very much. ;)
findEntityInTile: function(etileX, etileY) {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        for (var i = 0; i < aCategory.length; ++i) {

            var entityInTile = aCategory[i];

            if ((entityInTile.tileX < etileX + 1) &&
                (entityInTile.tileX + entityInTile.tilewidth > etileX) &&
                (entityInTile.tileY < etileY + 1) &&
                (entityInTile.tileY + entityInTile.tileheight > etileY)) {
                return entityInTile;
            }
        }
    }

    return 0;
},

// Find entity in specific tile - however, only consider one tile per entity,
// even for buildings!
findEntityInTileDumb: function(etileX, etileY) {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        for (var i = 0; i < aCategory.length; ++i) {

            var entityInTile = aCategory[i];

            if ((entityInTile.tileX === etileX) &&
                (entityInTile.tileY === etileY)) {
                return entityInTile;
            }
        }
    }

    return 0;
},

// select all entities within the given rectangle
selectFromRect: function(left, top, width, height) {

    // we reorder the values depending on their actual
    // contents
    
    if (width < 0) {
        left = left + width;
        width = - width;
    }
    
    if (height < 0) {
        top = top + height;
        height = - height;
    }
    
    // now we start the actual selection process

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        for (var i = 0; i < aCategory.length; ++i) {

            if ((aCategory[i].cx > left) &&
                (aCategory[i].cx < left + width) &&
                (aCategory[i].cy > top) &&
                (aCategory[i].cy < top + height)) {
                aCategory[i].selected = true;
            }
        }
    }
},

update: function(du) {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];
        var i = 0;

        while (i < aCategory.length) {

            var curEnt = aCategory[i];
            var status = curEnt.update(du);

            if (status === this.KILL_ME_NOW) {
                // we set this one to true so that other people can later on
                // still read it out - e.g. if someone has this entity as his
                // home base, and returns to it later, then he can figure out
                // that it now doesn't exist anymore
                curEnt._isDeadNow = true;

                if (curEnt.isBuilding) {
                    // If it was a building, we let all the occupied tiles
                    // become free.
                    for (var k = 0; k < curEnt.tilewidth; k++) {
                        for (var j = 0; j < curEnt.tileheight; j++) {
                            world.tilesFree[curEnt.tileX + k][curEnt.tileY + j] = 0;
                        }
                    }
                }

                // remove  the dead guy, and shuffle the others down to
                // prevent a confusing gap from appearing in the array
                aCategory.splice(i,1);

                // after the splicing, we have to update everyone's IDs
                for (var k = i; k < aCategory.length; k++) {
                    aCategory[k].id = k;
                }

            } else {
                i++;
            }
        }
    }

},

render: function(ctx) {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        for (var i = 0; i < aCategory.length; ++i) {

            aCategory[i].render(ctx);

        }
    }
}

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();

