"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ==============
// ENTITY MANAGER
// ==============
// 
// This module handles arbitrary entity-management for WarWobble.

var entityManager = {

_p : [[]], // This array contains arrays of entities - one array for each player.
_mIDs: [], // This array contains the next multiplayer-safe ID for each player.
_deadEnts : [], // This array contains entities - to be more specific, DEAD entities.
                // They are not updated anymore except for counting down their corpse-life-spans,
                // and then they are rendered... and that is all. =)
// Here are the colors used on the minimap.
// They have to be initialized using initGame.
_minimapColors : ["#00FC00", "#0094FC"],
// The colors of fog on the minimap, 0: blckness, 1: shadows, 2: no fog at all. =)
// They are set to the values for the winter map right now, but should
// be initialized automatically by world.js once a map is chosen.
_minimapFogColors : ["#000000", "#666666", "#bbbbbb"],
_selarr : [], // array of all entities that are currently selected
_selactions : [], // array of all actions that are currently visible
// this is the action the selected entities will execute once we are pressing somewhere
// on the map and tell her where to go to do it
nextPressAction: -1,
nextPressActionInNextFrame: -1,

// 0 if we show the normal first action page
// 1 if we show the basic building action page
// 2 if we show the advanced building action page
actionPage: 0,

// set to true when buildings are destroyed
recalculateFreeTilesInNextLoop: false,

// A special return value, used by other objects,
// to request the blessed release of death!
//
KILL_ME_NOW : -1,

// Some things must be deferred until after initial construction
// i.e. thing which need `this` to be defined.
//
deferredSetup : function () {
    this._categories = [];

    for (var i = 0; i < player.amount; i++) {
        this._categories[i] = this._p[i];
    }
},

initGame : function() {
    this.reset();

    this._minimapColors = [];

    for (var i = 0; i < player.amount; i++) {
        if (i === player.myID) {
            // We always display our own units in green
            // on the minimap.
            this._minimapColors[i] = "#00FC00";
        } else {
            this._minimapColors[i] = player.raceToMiniColor[player.p[i].race];
        }
    }
},

// the generated unit is given back - just in case someone wants
// to do something with it =)
generateUnit : function(descr, ourplayer) {
    descr.id = this._p[ourplayer].length; // this ID always reflects where in the array
                                          // this entity can be found; it is updated whenever
                                          // the array changes
    descr.mid = this._mIDs[ourplayer]; // This ID, the multiplayer ID, is independent of
                                       // the array location.
                                       // It therefore takes a longer time to access an entity
                                       // through its mID than through its regular ID, but on
                                       // the other hand the mID is completely independent from
                                       // the array, and is the preferred method for addressing
                                       // entities while sending and processing commands via the
                                       // server (even the "imaginary" singleplayer-server).
    this._mIDs[ourplayer] += 1;
    descr.belongsTo = ourplayer;
    this._p[ourplayer].push(entityList.constructors[descr.race][descr.type](descr));

    var curEnt = this._p[ourplayer][descr.id],
        tF = world.tilesFree;

    if (curEnt.isBuilding) {
        for (var i = 0; i < curEnt.tilewidth; i++) {
            for (var j = 0; j < curEnt.tileheight; j++) {
                var cx = curEnt.tileX + i,
                    cy = curEnt.tileY + j;

                if (tF[cx][cy] > 9) {
                    tF[cx][cy] = 11;
                } else {
                    tF[cx][cy] = 1;
                }
            }
        }
    } else {
        player.p[ourplayer].eaten += 1;
    }
    
    return curEnt;
},

reset: function() {
    this._p = [];
    this._mIDs = [];
    
    for (var i = 0; i < player.amount; i++) {
        this._mIDs[i] = 0;
    }

    this.dropAll();
},

// delete all entities
dropAll: function() {

    this._deadEnts = [];

    for (var i = 0; i < player.amount; i++) {
        this._p[i] = [];
        player.p[i].eaten = 0;
    }

    this.deferredSetup();
},

// unselect all entities - even dead ones; you never know...
unselectAll: function() {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c],
            len = aCategory.length;

        for (var i = 0; i < len; ++i) {
            aCategory[i].selected = false;
        }
    }
    
    var aCategory = this._deadEnts,
        len = aCategory.length;
    
    for (var i = 0; i < len; i++) {
        aCategory[i].selected = false;
    }
},

addBuildingsToTiles: function() {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];
    
        for (var k = 0; k < aCategory.length; ++k) {
            var curEnt = aCategory[k],
                tF = world.tilesFree;

            if (curEnt.isBuilding) {
                for (var i = 0; i < curEnt.tilewidth; i++) {
                    for (var j = 0; j < curEnt.tileheight; j++) {
                        var cx = curEnt.tileX + i,
                            cy = curEnt.tileY + j;
        
                        if (tF[cx][cy] > 9) {
                            tF[cx][cy] = 11;
                        } else {
                            tF[cx][cy] = 1;
                        }
                    }
                }
            }
        }
    }
},

// gives back the nearest entity to the tile-based position etileX, etileY
// that belongs to the player ePlayer and is of type eType;
// if no such entity can be found, the numerical value 0 is returned
findNearestEntityOf: function(ePlayer, eType, etileX, etileY) {
    var aCategory = this._categories[ePlayer],
        foundone = false,
        curEnt = {},
        curDist = 0;
    
    for (var i = 0; i < aCategory.length; ++i) {
        if (aCategory[i].type === eType) {
            if (foundone) {
                var thisEnt = aCategory[i];
                var thisDist = (etileX - thisEnt.tileX)*(etileX - thisEnt.tileX) +
                               (etileY - thisEnt.tileY)*(etileY - thisEnt.tileY);
                if (thisDist < curDist) {
                    curEnt = thisEnt;
                    curDist = thisDist;
                }
            } else {
                foundone = true;
                curEnt = aCategory[i];
                curDist = (etileX - curEnt.tileX)*(etileX - curEnt.tileX) +
                          (etileY - curEnt.tileY)*(etileY - curEnt.tileY);
            }
        }
    }

    if (foundone) {
        return curEnt;
    } else {
        return 0;
    }
},

// gives back the nearest entity to the tile-based position etileX, etileY
// that is specified in the array eEntities, which may contain 0-values that
// are simply ignored
// if no such entity can be found, the numerical value 0 is returned
getNearestEntityOf: function(eEntities, etileX, etileY) {
    var foundone = false,
        curEnt = {},
        curDist = 0;
    
    for (var i = 0; i < eEntities.length; ++i) {
        if (!(eEntities[i] === 0)) {
            if (foundone) {
                var thisEnt = eEntities[i];
                var thisDist = (etileX - thisEnt.tileX)*(etileX - thisEnt.tileX) +
                               (etileY - thisEnt.tileY)*(etileY - thisEnt.tileY);
                if (thisDist < curDist) {
                    curEnt = thisEnt;
                    curDist = thisDist;
                }
            } else {
                foundone = true;
                curEnt = eEntities[i];
                curDist = (etileX - curEnt.tileX)*(etileX - curEnt.tileX) +
                          (etileY - curEnt.tileY)*(etileY - curEnt.tileY);
            }
        }
    }

    if (foundone) {
        return curEnt;
    } else {
        return 0;
    }
},

// gives back the nearest entity to the tile-based position etileX, etileY
// that belongs to an opposing player (but not the neutral player);
// if no such entity can be found, the numerical value 0 is returned
findNearestOpposingEntity: function(ePlayer, etileX, etileY) {

    var foundone = false,
        curEnt = {},
        curDist = 0;

    for (var c = 0; c < this._categories.length; ++c) {

        if ((c !== ePlayer) && (c !== player.neutralID)) {

            var aCategory = this._categories[c];
    
            for (var i = 0; i < aCategory.length; ++i) {
                if (foundone) {
                    var thisEnt = aCategory[i];
                    var thisDist = (etileX - thisEnt.tileX)*(etileX - thisEnt.tileX) +
                                   (etileY - thisEnt.tileY)*(etileY - thisEnt.tileY);
                    if (thisDist < curDist) {
                        curEnt = thisEnt;
                        curDist = thisDist;
                    }
                } else {
                    foundone = true;
                    curEnt = aCategory[i];
                    curDist = (etileX - curEnt.tileX)*(etileX - curEnt.tileX) +
                              (etileY - curEnt.tileY)*(etileY - curEnt.tileY);
                }
            }
        }
    }

    if (foundone) {
        return curEnt;
    } else {
        return 0;
    }
},

// Find unit (not building) in specific tile
movableEntityInTile: function(etileX, etileY) {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        for (var i = 0; i < aCategory.length; ++i) {
            
            if (aCategory[i].type < 100) {
                var entityInTile = aCategory[i];

                if ((entityInTile.tileX === etileX) && (entityInTile.tileY === etileY)) {
                    return entityInTile;
                }
            }
        }
    }

    return 0;
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

playerHasEntityOfType: function(ourplayer, ourtype) {
    var aCategory = this._categories[ourplayer];

    // magic number: everything above index 99 (that is, 100 and above) are buildings
    if (ourtype > 99) {
        for (var i = 0; i < aCategory.length; ++i) {
            if ((aCategory[i].type === ourtype) && (aCategory[i].highestSprite === 4)) {
                return true;
            }
        }
    } else {
        for (var i = 0; i < aCategory.length; ++i) {
            if (aCategory[i].type === ourtype) {
                return true;
            }
        }
    }

    return false;
},

// goes through all entities of the given player and recalculates how high
// the production value for each resource should currently be for that player;
// here, all the buildings that contribute to this are hardcoded, hooray! =)
recountProduction: function(ourplayer) {

    var gold = 100,
        lumber = 100,
        oil = 100;

    // fortress and stronghold
    if (this.playerHasEntityOfType(ourplayer, 102)) {
        gold += 25;
    } else if (this.playerHasEntityOfType(ourplayer, 101)) {
        gold += 10;
    }
    
    // lumber mill
    if (this.playerHasEntityOfType(ourplayer, 105)) {
        lumber += 25;
    }
    
    // oil refinery
    if (this.playerHasEntityOfType(ourplayer, 113)) {
        oil += 25;
    }

    player.p[ourplayer].harvestGold = gold;
    player.p[ourplayer].harvestLumber = lumber;
    player.p[ourplayer].harvestOil = oil;
},

// goes through all entities and recalculates for each player how much food is eaten
// and how much food is produced;
// this function should be run once directly after the map is loaded =)
recountFood: function() {

    for (var c = 0; c < this._categories.length; ++c) {
        var aCategory = this._categories[c];
        
        player.p[c].eaten = 0;

        for (var i = 0; i < aCategory.length; i++) {
            var curEnt = aCategory[i];

            if (curEnt.isBuilding) {
                if (curEnt.highestSprite === 4) {
                    player.p[c].food += curEnt.incFood;
                }
            } else {
                player.p[c].eaten += 1;
            }
        }
    }
},

// invert the selection of all entities within the given rectangle
selectFromRect: function(left, top, width, height) {

    // we reset the action page on which we are
    this.actionPage = 0;
    this.nextPressAction = -1;
    this.nextPressActionInNextFrame = -1;

    // we reorder the values depending on their actual contents
    if (width < 0) {
        left = left + width;
        width = - width;
    }
    
    if (height < 0) {
        top = top + height;
        height = - height;
    }
    
    // now we start the actual selection process
    
    var foundone = false;
    
    var we = this._p[player.myID];
    
    // We expand the rectangle a little bit by adding / subtracting
    // half of the width and height.
    // This trick means that a single click on an entity
    // will most likely select the entity, and the entity only -
    // we therefore get single-click-selection for free,
    // just by implementing group-selection. =)

    for (var i = 0; i < we.length; ++i) {
        if ((!we[i].isBuilding) &&
            (we[i].cx + 16 > left) &&
            (we[i].cx - 16 < left + width) &&
            (we[i].cy + 16 > top) &&
            (we[i].cy - 16 < top + height) &&
            we[i].visible) {
            we[i].selected = !we[i].selected;
            
            // only play for the first unit
            if (!foundone) {
                SOUND.playForSelectedEntity(we[i].race, we[i].type);
            }

            foundone = true;
        }
    }
    
    // If we found at least one unit, return. Otherwise, continue searching
    // for buildings.
    if (foundone) return;

    for (var i = 0; i < we.length; ++i) {
        if ((we[i].cx + we[i].width/2 > left) &&
            (we[i].cx - we[i].width/2 < left + width) &&
            (we[i].cy + we[i].height/2 > top) &&
            (we[i].cy - we[i].height/2 < top + height) &&
            we[i].visible) {
            we[i].selected = !we[i].selected;

            SOUND.playForSelectedEntity(we[i].race, we[i].type);

            // We do not want to select multiple buildings at the same
            // time, so we return after finding one building.
            return;
        }
    }

    // If we still didn't find anything, let's also search opponents and
    // positively everyone...

    for (var j = 0; j < player.amount; j++) {
        we = this._p[j];
        for (var i = 0; i < we.length; ++i) {
            if (((we[i].isBuilding && (world.tilesVisible[we[i].tileX + 1][we[i].tileY + 1] > 0)) || 
                (world.tilesVisible[we[i].tileX + 1][we[i].tileY + 1] === 2)) &&
                (we[i].cx + we[i].width/2 > left) &&
                (we[i].cx - we[i].width/2 < left + width) &&
                (we[i].cy + we[i].height/2 > top) &&
                (we[i].cy - we[i].height/2 < top + height) &&
                we[i].visible) {
                we[i].selected = !we[i].selected;
    
                SOUND.playForSelectedEntity(we[i].race, we[i].type);

                return;
            }
        }
    }
},

getEntityFromMID: function(ourplayer, ourmid) {
    var someplayer = this._categories[ourplayer];

    for (var i = 0; i < someplayer.length; i++) {
        if (someplayer[i].mid === ourmid) {
            return someplayer[i];
        }
    }

    return 0;
},

processCommand: function(cmd) {
    // schema { player: int, id: int, details: <> }
    // find entity to send primitive order to
    var someplayer = this._categories[cmd.player];

    // have we found a player for this command?
    if (someplayer) {
        for (var i = 0; i < someplayer.length; i++) {
            if (someplayer[i].mid === cmd.mid) {
                someplayer[i].processOrder(cmd.details);
                return;
            }
        }
    }
},

mpUpdate: function(du) {

    if (this.recalculateFreeTilesInNextLoop) {
        world.recalculateFreeTiles();
        
        this.recalculateFreeTilesInNextLoop = false;
    }

    this.nextPressAction = this.nextPressActionInNextFrame;

    // we first do a loop to establish the distribution of units in the world

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        for (var i = 0; i < aCategory.length; i++) {

            var curEnt = aCategory[i];

            // if this is a unit, not a building, then register its impassability
            if (!(curEnt.isBuilding || curEnt.isFlying)) {
                if (world.tilesFree[curEnt.tileX][curEnt.tileY] === 0) {
                    world.tilesFree[curEnt.tileX][curEnt.tileY] = 2;
                } else {
                    // We just wanted to register ourselves as on this spot -
                    // however, we realize that the spot wasn't free!
                    // Therefore, we do an emergency-movement out of the way,
                    // if possible.
                    curEnt.moveAway();
                }
                world.setTilesFree(curEnt.nexttileX, curEnt.nexttileY, 4);
            }
        }
    }
    
    var myc = player.myID,
        ww = world.width + 1,
        wh = world.height + 1,
        tV = world.tilesVisible,
        tmV = world.minimap.tilesVisible;

    for (var c = 0; c < this._categories.length; ++c) {

        // Only our own entities can see. =)
        if (c === myc) {
            var aCategory = this._categories[c];

            for (var i = 0; i < aCategory.length; i++) {

                var curEnt = aCategory[i];

                // Buildings can only see once they are at least to 66% finished
                if ((!curEnt.isBuilding) || (curEnt.highestSprite > 2)) {
                    var cEx = curEnt.tileX + curEnt.tileOffX,
                        cEy = curEnt.tileY + curEnt.tileOffY,
                        cEsm = curEnt.sight + 1,
                        cEs = curEnt.sight + 2;

                    // We clear the fog of war whereever we see something. =)
                    for (var x = Math.max(cEx - cEs, -1);
                        x < Math.min(cEx + cEs, ww); x++) {
                        for (var y = Math.max(cEy - cEs, -1);
                            y < Math.min(cEy + cEs, wh); y++) {
                            if ((x-cEx)*(x-cEx) + (y-cEy)*(y-cEy) < cEs*cEs) {
                                tV[x+1][y+1] = 2;
                                tmV[x+1][y+1] = 2;
                            }
                        }
                    }
                }
            }
        }
    }

    // now that we know where all the units are, we use another loop to call update
    // on each entity - if we would've done it all in one loop, then possibly some
    // unit positions would not have been updated correctly, rendering the collision
    // detection useless

    for (var c = 0; c < this._categories.length; ++c) {
        var aCategory = this._categories[c];
        var i = 0;
        
        var lostSomeBuilding = false;

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
                    this.recalculateFreeTilesInNextLoop = true;

                    if (curEnt.highestSprite === 4) {
                        player.p[c].food -= curEnt.incFood;
                    }
                    
                    lostSomeBuilding = true;
                } else {
                    player.p[c].eaten -= 1;
                }

                // remove  the dead guy, and shuffle the others down to
                // prevent a confusing gap from appearing in the array
                aCategory.splice(i,1);
                
                // we have to take the entity that died out of our selection array
                for (var k = this._selarr.length - 1; k > -1; k--) {
                    if (this._selarr[k].id === i) {
                        this._selarr.splice(k,1);
                    }
                }

                // after the splicing, we have to update everyone's IDs
                for (var k = i; k < aCategory.length; k++) {
                    aCategory[k].id = k;
                }
                
                // We want to keep track of the corpse - and maybe bring it
                // back to life later on?
                this._deadEnts.push(curEnt);
                curEnt.corpsify();

                this.rearrangeDeadEnts();

            } else {
                i++;
            }
        }
    
        if (lostSomeBuilding) {
            this.recountProduction(c);
        }
    }
    
    var len = this._deadEnts.length;
    
    for (var i = len - 1; i > -1; i--) {
        if (this._deadEnts[i].updateCorpse(du)) {
            this._deadEnts.splice(i, 1);
        }
    }
},

rearrangeDeadEnts: function() {
    // The corpses don't usually move, so we can once go over them,
    // arrange them in the correct order, and leave them like that.
    var renderorder = [],
        aCategory = this._deadEnts;

    for (var i = 0; i < aCategory.length; ++i) {

        var j = 0,
            aCy = aCategory[i].cy;
        
        while ((j < renderorder.length) && (renderorder[j].cy < aCy)) {
            j++;
        }

        renderorder.splice(j, 0, aCategory[i]);
    }
    
    this._deadEnts = renderorder;
},

update: function(du) {

    this._selarr = [];

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];
        var i = 0;

        while (i < aCategory.length) {

            var curEnt = aCategory[i];

            // if selected, push onto the array of selected entities
            if (curEnt.selected && curEnt.visible) {
                this._selarr.push(curEnt);
            }

            ++i;
        }
    }

    // We gather in selactions the actions that should be visible - that is,
    // the actions that are shared by all group members.
    this._selactions = [];
    this._selactFrame = [];

    if (this.actionPage === 0) {
        if (this._selarr.length > 1) {
    
            var len = this._selarr.length;
    
            this._selactions = [];
            for (var i = 0; i < action.amount; i++) {
                this._selactions[i] = true;
            }
    
            for (var i = 0; i < len; ++i) {
                // magic number: 9 is the amount of units in a group that can be displayed
                // in the HUD
                if (i < 9) {
                    var x = 5 + 56*(i%3);
                    var y = 165 + 55*Math.floor(i/3);
        
                    // After the button has been released, unselect all entities
                    // and only select the one whose icon was clicked upon.
                    if (mouse.pressUp &&
                        (mouse.X > x) && (mouse.X < x + 54) &&
                        (mouse.Y > y) && (mouse.Y < y + 53) &&
                        (mouse.dX > x) && (mouse.dX < x + 54) &&
                        (mouse.dY > y) && (mouse.dY < y + 53)) {
                        this.unselectAll();
                        this._selarr[i].selected = true;
                    }
                }
    
                this._selactFrame[this._selarr[i].curAction] = true;
    
                for (var j = 0; j < action.amount; j++) {
                    this._selactions[j] = this._selactions[j] &&
                                          this._selarr[i].actions[j];
                }
            }
        }
        
        // We don't put this into an else-statement because the user might have
        // clicked on an icon in the previous if-statement, so that now only
        // one entity is left selected =)
        if (this._selarr.length === 1) {
    
            // if this is not our unit then we have no business seeing its information
            if (!(this._selarr[0].belongsTo === player.myID)) return;
            
            // if this building is not yet completely constructed then we leave
            if ((this._selarr[0].isBuilding) && (this._selarr[0].highestSprite < 4)) return;

            for (var i = 0; i < action.amount; i++) {
                this._selactions[i] = this._selarr[0].actions[i];
            }
    
            this._selactFrame[this._selarr[0].curAction] = true;
    
        }
    
        this._selactFrame[10] = this._selactFrame[4];
        
        var makingUnit = (this._selarr.length > 0) &&
                         (this._selarr[0].isBuilding) &&
                         (this._selarr[0].generateUnitCounter > 0);
        
        if ((entityManager.nextPressAction === 0) ||
            (entityManager.nextPressAction === 2) ||
            (entityManager.nextPressAction === 4) ||
            makingUnit) {
            this._selactions = [];
            this._selactions[9] = true;
        }
    } else {
        if (this.actionPage === 1) {
            for (var i = 0; i < action.pageOne.length; i++) {
                this._selactions[i] = action.pageOne[i];
            }
        } else if (this.actionPage === 2) {
            for (var i = 0; i < action.pageTwo.length; i++) {
                this._selactions[i] = action.pageTwo[i];
            }
        }
        
        var len = this._selarr.length;

        for (var i = 0; i < len; ++i) {
            this._selactFrame[this._selarr[i].curAction] = true;
        }
    }
    
    // We now process pressing on those action icons, and also in the
    // same go disable all the actions that want to remain invisible
    // for now.
    for (var j = 0; j < action.amount; j++) {
        if (this._selactions[j]) {
            var act = action.fromNum[j];
            
            if (!act.visible(this._selarr)) {
                this._selactions[j] = false;
            } else {
                // Magic numbers: 54x46 is the size of hud_pici.png
                if (mouse.pressUp &&
                    (mouse.X > act.iconX) &&
                    (mouse.X < act.iconX + 54) &&
                    (mouse.Y > act.iconY) &&
                    (mouse.Y < act.iconY + 46) &&
                    (mouse.dX > act.iconX) &&
                    (mouse.dX < act.iconX + 54) &&
                    (mouse.dY > act.iconY) &&
                    (mouse.dY < act.iconY + 46)) {
                    act.onClick(this._selarr);
                }
            }
        }
    }
},

render: function(ctx) {

    var renderorder = [];
    var renderorderFlying = [];
    var myc = player.myID;
    var aCategory;

    for (var c = 0; c < this._categories.length; ++c) {

        aCategory = this._categories[c];

        for (var i = 0; i < aCategory.length; ++i) {

            var aC = aCategory[i];

            if (aC.visible && ((c === myc) || aC.isBuilding ||
                (world.tilesVisible[aC.tileX + 1][aC.tileY + 1] === 2))) {
                var j = 0,
                    aCy = aC.cy,
                    r = renderorder;
                
                if (aC.isFlying) {
                    r = renderorderFlying;
                }
                
                while ((j < r.length) && (r[j].cy < aCy)) {
                  j++;
                }

                r.splice(j, 0, aC);
            }
        }
    }
    
    for (var j = 0; j < this._deadEnts.length; ++j) {
        this._deadEnts[j].renderCorpse(ctx);
    }

    for (var j = 0; j < renderorder.length; ++j) {
        renderorder[j].render(ctx);
    }

    for (var j = 0; j < renderorderFlying.length; ++j) {
        renderorderFlying[j].render(ctx);
    }
},

renderMinimap: function(ctx) {

    var ww = world.width,
        wh = world.height,
        wwa = 127 / ww,
        wha = 127 / wh,
        wwb = Math.floor(128 / ww),
        whb = Math.floor(128 / wh),
        tvis = world.minimap.tilesVisible,
        tV = world.tilesVisible;

    // We prepare the minimap with fog of war.

    for (var x = 0; x < ww; x++) {
        for (var y = 0; y < wh; y++) {
            ctx.fillStyle = this._minimapFogColors[tvis[x+1][y+1]];
                ctx.fillRect(24 + Math.floor(x * wwa),
                             26 + Math.floor(y * wha),
                             wwb,
                             whb);
        }
    }

    // We now populate the minimap with entities. =)
    
    var myc = player.myID;
    
    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];
        
        ctx.fillStyle = this._minimapColors[c];
    
        for (var i = 0; i < aCategory.length; ++i) {
            var aC = aCategory[i];

            if (((c === myc) ||
                (aC.isBuilding &&
                (tV[aC.tileX+1][aC.tileY+1] > 0)) ||
                (tV[aC.tileX+1][aC.tileY+1] === 2)) &&
                aC.visible) {
                ctx.fillRect(24 + Math.floor(aC.tileX * wwa),
                             26 + Math.floor(aC.tileY * wha),
                             Math.floor(aC.tilewidth * 128 / ww),
                             Math.floor(aC.tileheight * 128 / wh));
            }
        }
    }
},

renderHUD: function(ctx) {

    // We draw the HUD.

    var fontcolor = screenManager.fontcolor;

    if (this._selarr.length === 1) {
    
        var curEnt = this._selarr[0];

        // Only one entity is selected - so we show the detailed view.

        g_sprites.hud_top.drawAt(ctx, 5, 165);
        g_sprites.drawIcon(ctx, 9, 169, curEnt.icon,
                           curEnt.ics);
        
        // We draw the health bar.

        if (curEnt.hp > curEnt.maxhp * 2/3) {
            ctx.fillStyle = "#347004";
        } else if (curEnt.hp > curEnt.maxhp / 3) {
            ctx.fillStyle = "#FCFC00";
        } else {
            ctx.fillStyle = "#FC0000";
        }
        
        ctx.fillRect(7, 211, 50 * curEnt.hp / curEnt.maxhp, 5);
        
        var curtop = 185;

        // We write out the name of the entity.        
        if (curEnt.names.length === 1) {
            g_sprites.writeCentered(ctx, curEnt.names[0], fontcolor, 113, curtop);
        } else {
            g_sprites.writeCentered(ctx, curEnt.names[0], fontcolor, 113, curtop - 7);
            curtop += 7;
            g_sprites.writeCentered(ctx, curEnt.names[1], fontcolor, 113, curtop);
        }

        // Everything after here can be shown for our own units and for neutral units.
        if (!((curEnt.belongsTo === player.myID) ||
            player.p[curEnt.belongsTo].neutral)) return;

        // We are looking at a gold mine.
        if (curEnt.type === 200) {
            g_sprites.writeRight(ctx, "Gold Left:", fontcolor, 100, 247);
            g_sprites.write(ctx, " " + Math.max(0, Math.floor(curEnt.goldLeft + 0.5)),
                            fontcolor, 100, 247);
        }

        // Everything after here can only be shown for our own units.
        if (!(curEnt.belongsTo === player.myID)) return;

        if (curEnt.isBuilding) {
            if (curEnt.highestSprite < 4) {

                // Do not display anything; except for the progress of the construction. =)

                g_sprites.bar.drawAt(ctx, 9, 310);
                ctx.fillStyle = "#347004";
                ctx.fillRect(12, 313, 151 * (curEnt.hp /
                             curEnt.maxhp), 13);
                g_sprites.writeCentered(ctx, Math.floor(100 * (curEnt.hp /
                                        curEnt.maxhp)) + "% Complete",
                                        fontcolor, 87, 313);

            } else if (curEnt.generateUnitCounter > 0) {

                // A unit is trained in this building.

                g_sprites.bar.drawAt(ctx, 9, 310);
                ctx.fillStyle = "#347004";
                ctx.fillRect(12, 313, 151 * (1 - (curEnt.generateUnitCounter /
                             curEnt.generateUnitCounterMax)), 13);
                g_sprites.writeCentered(ctx, Math.floor(100 * (1 - (curEnt.generateUnitCounter /
                                        curEnt.generateUnitCounterMax))) + "% Complete",
                                        fontcolor, 87, 313);

                g_sprites.write(ctx, "Training:", fontcolor, 38, 247);
                g_sprites.hud_pici.drawAt(ctx, 107, 238);
                g_sprites.drawIcon(ctx, 111, 242, curEnt.generateUnitIcon, curEnt.ics);
            } else if ((curEnt.type > 99) && (curEnt.type < 103)) {
                // We are looking at our town hall.

                g_sprites.write(ctx, "Production", fontcolor, 19, 232);
                g_sprites.writeRight(ctx, "Gold:", fontcolor, 100, 247);
                if (player.me.harvestGold === 100) {
                    g_sprites.write(ctx, " 100", fontcolor, 100, 247);
                } else {
                    g_sprites.writeEx(ctx, " 100_+" + (player.me.harvestGold - 100), fontcolor, 100, 247);
                }
                g_sprites.writeRight(ctx, "Lumber:", fontcolor, 100, 262);
                if (player.me.harvestLumber === 100) {
                    g_sprites.write(ctx, " 100", fontcolor, 100, 262);
                } else {
                    g_sprites.writeEx(ctx, " 100_+" + (player.me.harvestLumber - 100), fontcolor, 100, 262);
                }
                g_sprites.writeRight(ctx, "Oil:", fontcolor, 100, 277);
                if (player.me.harvestOil === 100) {
                    g_sprites.write(ctx, " 100", fontcolor, 100, 277);
                } else {
                    g_sprites.writeEx(ctx, " 100_+" + (player.me.harvestOil - 100), fontcolor, 100, 277);
                }
            } else if (curEnt.type === 103) { // We are looking at a farm.
                g_sprites.write(ctx, "Food Usage", fontcolor, 16, 232);
                g_sprites.writeRight(ctx, "Grown:", fontcolor, 100, 247);
                g_sprites.write(ctx, " " + player.me.food, fontcolor, 100, 247);
                g_sprites.writeRight(ctx, "Used:", fontcolor, 100, 262);
                if (player.me.eaten > player.me.food) {
                    g_sprites.write(ctx, " " + player.me.eaten, 2, 100, 262);
                } else {
                    g_sprites.write(ctx, " " + player.me.eaten, fontcolor, 100, 262);
                }
            }
        } else {
            // We write out the level of the entity.
            g_sprites.writeCentered(ctx, "Level: " + curEnt.level, fontcolor, 113, curtop + 14);
    
            // We write out the other details of the entity.
            g_sprites.writeRight(ctx, "Armor:", fontcolor, 100, 232);
            g_sprites.write(ctx, " " + curEnt.armor, fontcolor, 100, 232);
            g_sprites.writeRight(ctx, "Damage:", fontcolor, 100, 247);
            g_sprites.write(ctx, " " + curEnt.damage_str, fontcolor, 100, 247);
            g_sprites.writeRight(ctx, "Range:", fontcolor, 100, 262);
            g_sprites.write(ctx, " " + curEnt.range, fontcolor, 100, 262);
            g_sprites.writeRight(ctx, "Sight:", fontcolor, 100, 277);
            g_sprites.write(ctx, " " + curEnt.sight, fontcolor, 100, 277);
            g_sprites.writeRight(ctx, "Speed:", fontcolor, 100, 292);
            g_sprites.write(ctx, " " + curEnt.speed, fontcolor, 100, 292);
            if (curEnt.magic > 0) {
                g_sprites.writeRight(ctx, "Magic:", fontcolor, 100, 307);
                g_sprites.write(ctx, " " + curEnt.magic, fontcolor, 100, 307);
            }
        }
    } else if (this._selarr.length > 1) {

        // Several entities are selected, so we only show their icons.
        // (However, we show a maximum of 9. In the original game,
        // groups were limited to 9 entities only, so there is no more
        // space assigned for icons. We can allow more than 9 entities
        // in a group, but then simply do not display the others.)

        var len = util.min(9, this._selarr.length);

        for (var i = 0; i < len; ++i) {
            var x = 5 + 56*(i%3);
            var y = 165 + 55*Math.floor(i/3);

            g_sprites.hud_pic.drawAt(ctx, x, y);
            g_sprites.drawIcon(ctx, 4 + x, 4 + y, this._selarr[i].icon,
                               this._selarr[i].ics);

            // We draw the health bar.
            if (this._selarr[i].hp > this._selarr[i].maxhp * 2/3) {
                ctx.fillStyle = "#347004";
            } else if (this._selarr[i].hp > this._selarr[i].maxhp / 3) {
                ctx.fillStyle = "#FCFC00";
            } else {
                ctx.fillStyle = "#FC0000";
            }
            
            ctx.fillRect(2 + x, 46 + y, 50 * this._selarr[i].hp / this._selarr[i].maxhp, 5);
            
            // Magic numbers: 54x53 is the size of hud_pic.png
            if ((mouse.X > x) &&
                (mouse.X < x + 54) &&
                (mouse.Y > y) &&
                (mouse.Y < y + 53)) {
                ctx.strokeStyle = "#A0A0A4";
                ctx.strokeRect(x + 0.5, y + 0.5, 53, 52);
                
                var ourname = "";
                
                for (var k = 0; k < this._selarr[i].names.length; k++) {
                    ourname += this._selarr[i].names[k] + " ";
                }

                g_sprites.writeEx(ctx, ourname, fontcolor, 177, 466);
            }
        }
    } else {
        // We only want to continue from here on if at least one entity is selected.
        return;
    }
    
    // We now draw the actions that should be visible.
    for (var j = 0; j < action.amount; j++) {
        if (this._selactions[j]) {
            var act = action.fromNum[j];
            
            g_sprites.hud_pici.drawAt(ctx, act.iconX, act.iconY);

            // We use the actN of the first entity that is selected.
            // As all actions must be shared by all entities of the group,
            // its actN will not be zero for any of the chosen actions.
            g_sprites.drawIcon(ctx, act.iconX + 4, act.iconY + 4,
                               this._selarr[0].actN[j],
                               this._selarr[0].ics);
            
            // We draw a green frame around the action that is currently executed.
            if (this._selactFrame[j]) {
                ctx.strokeStyle = "#00ff00";
                ctx.strokeRect(act.iconX + 4.5, act.iconY + 4.5, 46, 38);
            }
            
            // Magic numbers: 54x46 is the size of hud_pici.png
            if ((mouse.X > act.iconX) &&
                (mouse.X < act.iconX + 54) &&
                (mouse.Y > act.iconY) &&
                (mouse.Y < act.iconY + 46)) {
                ctx.strokeStyle = "#A0A0A4";
                ctx.strokeRect(act.iconX + 0.5, act.iconY + 0.5, 53, 45);
                
                // We draw the tool tip, which is usually independent of the
                // race of the selected unit (act.name), but sometimes it
                // depends on it, in which case we use act.nameh (human) or
                // act.nameo (orc).
                if (act.name) {
                    g_sprites.writeEx(ctx, act.name, fontcolor, 177, 466);
                } else {
                    if (this._selarr[0].race === 1) {
                        g_sprites.writeEx(ctx, act.nameh, fontcolor, 177, 466);
                    } else {
                        g_sprites.writeEx(ctx, act.nameo, fontcolor, 177, 466);
                    }
                }

                if (act.getCosts) {
                    var ourcosts = act.getCosts(this._selarr, j);
                
                    if (ourcosts) {
                        if (ourcosts[0] > 0) {
                            g_sprites.cost_gold.drawAt(ctx, 466, 466);
                            g_sprites.write(ctx, "" + ourcosts[0], fontcolor, 484, 467);
                        }

                        if (ourcosts[1] > 0) {
                            g_sprites.cost_lumber.drawAt(ctx, 518, 466);
                            g_sprites.write(ctx, "" + ourcosts[1], fontcolor, 536, 467);
                        }
                        
                        if (ourcosts[2] > 0) {
                            g_sprites.cost_oil.drawAt(ctx, 570, 466);
                            g_sprites.write(ctx, "" + ourcosts[2], fontcolor, 588, 467);
                        }
                    }
                }
            }
        }
    }
}

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();
