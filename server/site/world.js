"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ===========
// WORLD STUFF
// ===========
// 
// This file contains everything that is vaguely related to
// the general game world, which is a tile-based environment
// with a typical size of 32x32 up to 128x128 tiles.
// Each tile has a (hardcoded) size of 32x32 pixels.
// In here, we also undertake the spatial management, which
// basically means to store which tiles are free in a two-
// dimensional array. To do so, we store a 0 in tilesFree
// for each tile that is completely empty, and a 1 for each
// tile that is permanently blocked, because of a forest,
// or a building, or something like that.
// We also store other values (2 and above) that are depending
// on the units themselves and are recalculated on every frame.
// These values are used to block not only the tile that a
// unit is on right now, but also the tile that a unit would
// like to go onto next.

var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;

var world = {

allowKeyboardGather: false, //do we gather keyboard for events? enabled by game.
camL : 0, // left of visible piece in tiles
camT : 0, // top of visible piece in tiles
camR : 14, // right of visible piece in tiles
camB : 14, // bottom of visible piece in tiles
width : 0, // width of whole world in tiles
height : 0, // height of whole world in tiles
isDesert : 0, // 2 if we have desert, 1 if we have winter, 0 if we have grassland
isWinter : 0, // 1 if we have winter, 0 if not (desert or grassland)
passabilityview : false, // true if we display diagnostics
                         // concerning the tile passability
fogRender : true, // true if the fog is rendered,
                  // can be toggled off with the key 'V'

// Colors assigned to the different states in the passability view, key:
//  0 .. passable
//  1 .. permanently impassable
//  2 .. occupied by unit, currently moving away from this tile
//  3 .. occupied by unit, collision!
//  4 .. occupied by unit, will be its next target
//  5 .. occupied by unit, which is not moving but instead happily resting
//  6 .. IMPASSABLE. As in, outside of the map. As in, not even flying units are allowed to pass!
// 10 .. Water, see 0 (free)
// 11 .. Water, see 1 (permanently impassable)
// 12 .. Water, see 2 (unit, moving away)
// 13 .. Water, see 3 (unit, collision!)
// 14 .. Water, see 4 (unit, next target)
// 15 .. Water, see 5 (unit, happily resting)
fillPassView : ["#ffffff", "#000000", "#555599", "#ff0055", "#ffaa00", "#00ff22", "", "", "",
                "#bbbbff", "#000099", "#3333ff", "#ff00ff", "#ffaaff", "#00ffff"],
strokePassView : ["#000000", "#ffffff", "#000000", "#000000", "#000000", "#000000", "", "", "",
                  "#000000", "#ffffff", "#000000", "#000000", "#000000", "#000000"],

tilesFree : [[]], // integer values that tell us whether
                  // the tile is free now (0) or not (above 1)
                  // for more detailed information, see the key
                  // for fillPassView just a few lines above =)

tilesGround : [[]], // integers that tell us which kind of floor we have

tilesVisible : [[0,0],[0,0]], // integers that tell us whether the tile is invisible (0),
                              // visible but foggy (1), or clearly visible (2)
                              // ATTENTION! This has an offset of 1 tile in both vertical
                              // and horizontal direction!

tilesHarvestable : [[]], // array of arrays that contains objects of the form
                         // { gold: x, lumber: y } or just nothing (it will not
                         // typically contain an object just with zero-values,
                         // but instead simply not contain that particular object)
                         // Here, the gold and lumber are the resources that can
                         // be mined on this tile, and once all the resources have
                         // been mined, the tile will be destroyed.
                         // This has nothing at all to do with gold mines, which
                         // actually are buildings!

// a rectangle that is spanned with the pressed left mouse button
// to help select several units at the same time
choiceRect : {
    visible : false,
    left    : 0,
    top     : 0,
    width   : 0,
    height  : 0,
    
    render : function (ctx) {
        // draw the choice rectangle
        if (this.visible) {
            ctx.strokeStyle = "#00ff00";
            ctx.strokeRect(this.left + 0.5,
                           this.top + 0.5,
                           this.width,
                           this.height);
        }
    }
},

// a rectangle that is displayed while searching for a spot to build
buildRect : {
    visible : false,
    left    : 0,
    top     : 0,
    width   : 0,
    height  : 0,
    color   : "#00ff00",
    
    render : function (ctx) {
        // draw the building rectangle
        if (this.visible) {
            ctx.strokeStyle = this.color;

            ctx.strokeRect(this.left + 176.5 - (world.camL * 32),
                           this.top + 16.5 - (world.camT * 32),
                           this.width,
                           this.height);

            this.visible = false;
        }
    }
},

minimap : {
    tilesVisible : [[0,0],[0,0]], // The same as world.tilesVisible, but optimized
                                  // for the minimap.
    speedThingsUp : false, // We set this to true if the map is bigger than 50x50.
                           // It means that we then just leave out an algorithm
                           // for nice fog creation on the minimap, which leaves
                           // us with basic (but wrong) fog on the minimap.
                           // However, at this size the minimap is so small
                           // that no one sees the difference anyway, and the
                           // speedup will be significant.

    render : function (ctx) {
        // draw the entities on the mini-map
        entityManager.renderMinimap(ctx);
        
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(24.5 + Math.floor(world.camL * 127 / world.width),
                       26.5 + Math.floor(world.camT * 127 / world.height),
                       Math.floor(14 * 128 / world.width),
                       Math.floor(14 * 128 / world.height));
    }
},

// Never - NEVER! - overwrite a '1' in tilesFree. Unless it was a 
// building and you just destroyed it. Then go ahead. =P
setTilesFree: function(tileX, tileY, newValue) {
    if ((tileX > -1) && (tileY > -1) &&
        (tileX < world.width) && (tileY < world.height) &&
        !(this.tilesFree[tileX][tileY] === 1)) {
        this.tilesFree[tileX][tileY] = newValue;
    }
},

// gives back tilesFree[tileX][tileY] if in range,
// or '6' (INCREDIBLY IMPASSABLE) otherwise
tilesFreeReadSafe: function(tileX, tileY) {
    if ((tileX < 0) || (tileY < 0) ||
        (tileX > world.width - 1) || (tileY > world.height - 1)) {
        return 6;
    }

    return this.tilesFree[tileX][tileY];
},

isHarvestable: function(htileX, htileY) {
    return ((this.tilesGround[htileX][htileY] > 15) &&
            (this.tilesGround[htileX][htileY] < 40))
},

// returns an object containing the location on the nearest harvestable
// tile to the location wtileX, wtileY, or if no such tile can be found, 0
findNearestHarvestable: function(wtileX, wtileY){

    var tG = this.tilesGround,
        w = this.width,
        h = this.height,
        foundone = false,
        curEnt = {},
        curDist = 0;
    
    for (var i = 0; i < w; ++i) {
        for (var j = 0; j < h; ++j) {
            var tGij = tG[i][j];
        
            // magic numbers: in these three rows of the tileset,
            // all harvestable things are hidden =)
            if ((tGij > 15) && (tGij < 40)) {
                if (foundone) {
                    var thisEnt = {tileX: i, tileY: j};
                    var thisDist = (wtileX - thisEnt.tileX)*(wtileX - thisEnt.tileX) +
                                   (wtileY - thisEnt.tileY)*(wtileY - thisEnt.tileY);
                    if (thisDist < curDist) {
                        curEnt = thisEnt;
                        curDist = thisDist;
                    }
                } else {
                    foundone = true;
                    curEnt = {tileX: i, tileY: j};
                    curDist = (wtileX - curEnt.tileX)*(wtileX - curEnt.tileX) +
                              (wtileY - curEnt.tileY)*(wtileY - curEnt.tileY);
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

// returns an object containing the location on the nearest free
// tile to the location wtileX, wtileY, or if no such tile can be found, 0
findNearestFreeTile: function(wtileX, wtileY){

    var tF = this.tilesFree,
        w = this.width,
        h = this.height,
        foundone = false,
        curEnt = {},
        curDist = 0;

    for (var i = 0; i < w; ++i) {
        for (var j = 0; j < h; ++j) {
            if (tF[i][j] === 0) {
                if (foundone) {
                    var thisEnt = {tileX: i, tileY: j};
                    var thisDist = (wtileX - thisEnt.tileX)*(wtileX - thisEnt.tileX) +
                                   (wtileY - thisEnt.tileY)*(wtileY - thisEnt.tileY);
                    if (thisDist < curDist) {
                        curEnt = thisEnt;
                        curDist = thisDist;
                    }
                } else {
                    foundone = true;
                    curEnt = {tileX: i, tileY: j};
                    curDist = (wtileX - curEnt.tileX)*(wtileX - curEnt.tileX) +
                              (wtileY - curEnt.tileY)*(wtileY - curEnt.tileY);
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

isTree: function(tGij) {
    return ((tGij > 15) && (tGij < 20)) ||
           ((tGij > 23) && (tGij < 28)) ||
           ((tGij > 31) && (tGij < 36));
},

// this function is not *exactly* the same as the one in the map editor;
// we here have two more lines after 'tG[i][j] = 14;' which are
// 'this.tilesHarvestable[i][j] = undefined;' and
// 'this.tilesFree[i][j] = 0;'
recalculateTrees: function() {
    var w = this.width,
        h = this.height,
        tG = this.tilesGround,
        tGij,
        tree = this.isTree;

    for (var i = 0; i < w; i++) {
        for (var j = 0; j < w; j++) {
            tGij = tG[i][j];

            if (tree(tGij)) {
                tG[i][j] = 25;
                
                var id = Math.max(0, i-1),
                    iu = Math.min(w-1, i+1),
                    jd = Math.max(0, j-1),
                    ju = Math.min(h-1, j+1);

                if ((!tree(tG[iu][j])) && (!tree(tG[id][j]))) {
                    tG[i][j] += 2;
                } else {
                    if (!tree(tG[iu][j])) {
                        tG[i][j] += 1;
                    } else if (!tree(tG[id][j])) {
                        tG[i][j] -= 1;
                    }
                }
                
                if ((!tree(tG[i][ju])) && (!tree(tG[i][jd]))) {
                    tG[i][j] = 14;
                    this.tilesHarvestable[i][j] = undefined;
                    this.tilesFree[i][j] = 0;
                    i = Math.max(0, i - 2);
                } else {
                    if (!tree(tG[i][ju])) {
                        tG[i][j] += 8;
                    } else if (!tree(tG[i][jd])) {
                        tG[i][j] -= 8;
                    }
                }                
            }
        }
    }
},

recalculateHarvestableTiles: function() {

    var w = this.width,
        h = this.height,
        tG = this.tilesGround;

    for (var i = 0; i < w; i++) {
        for (var j = 0; j < h; j++) {
            var tGij = tG[i][j];
            
            if (this.isTree(tGij)) {

                // We populate some trees.

                this.tilesHarvestable[i][j] = {
                    gold : 0,   // these values are normalized to 1,
                    lumber : 1, // because different player-variables
                    oil : 0     // can affect the amount that can actually
                                // be harvested per harvesting =)
                };

            } else if ((tGij === 23) || (tGij === 31)) {
            
                // We populate some WarWind crystals.
            
                this.tilesHarvestable[i][j] = {
                    gold : 0.5,
                    lumber : 0,
                    oil : 0.1
                };

            } else {

                // Yep, these need to be defined, otherwise we can get problems
                // with the replay system once stupid messages are sent that don't
                // reflect the current state of affairs; which might also happen
                // during the multiplayer stuff otherwise!
                this.tilesHarvestable[i][j] = {
                    gold : 0,
                    lumber : 0,
                    oil : 0
                };

            }
        }
    }
},

recalculateFreeTiles: function() {

    var w = this.width,
        h = this.height,
        tG = this.tilesGround,
        tF = this.tilesFree;

    for (var i = 0; i < w; i++) {
        for (var j = 0; j < h; j++) {
            var tGij = tG[i][j];

            // passable tiles:
            //   the first three rows of the tileset
            //   the ice, that is the rows 7, 8, and 9 (if the first row is counted as row 1)
            if ((tGij < 16) || (tGij > 39) && (tGij < 64)) {
                tF[i][j] = 0;
            } else if ((tGij === 73) || (tGij === 76)) { // water
                tF[i][j] = 10;
            } else { // not passable, and not water either
                tF[i][j] = 1;
            }
        }
    }
    
    entityManager.addBuildingsToTiles();
},

mpUpdate: function(du) {
    var ww = this.width,
        wh = this.height,
        tV = this.tilesVisible,
        tmV = this.minimap.tilesVisible,
        tF = this.tilesFree,
        tFij = 0;

    // Here we reset all clearly visible tiles to foggy.
    // Afterwards, the entities clear the tiles that
    // they see in their update loops.
    for (var i = 0; i < ww+2; i++) {
        for (var j = 0; j < wh+2; j++) {
            if (tV[i][j] > 1) tV[i][j] = 1;
            if (tmV[i][j] > 1) tmV[i][j] = 1;
        }
    }

    for (var i = 0; i < ww; i++) {
        for (var j = 0; j < wh; j++) {
            tFij = tF[i][j];

            if (tFij > 10) {
                tF[i][j] = 10;
            } else if ((tFij > 1) && (tFij < 10)) {
                tF[i][j] = 0;
            }
        }
    }
},

update: function(du) {
    if (keys[KEY_LEFT]) {
        this.camL = util.max(0, this.camL - 1);
        this.camR = this.camL + 14;
    }
    if (keys[KEY_RIGHT]) {
        this.camR = util.min(this.width, this.camR + 1);
        this.camL = this.camR - 14;
    }
    if (keys[KEY_UP]) {
        this.camT = util.max(0, this.camT - 1);
        this.camB = this.camT + 14;
    }
    if (keys[KEY_DOWN]) {
        this.camB = util.min(this.height, this.camB + 1);
        this.camT = this.camB - 14;
    }
    
    // Here we start spanning a choice rectangle if the left mouse button
    // is pressed over the gamefield.
    if ((entityManager.nextPressAction === -1) &&
       mouse.pressDown &&
       (mouse.X > 176) && (mouse.X < 624) &&
       (mouse.Y > 16) && (mouse.Y < 464)) {
        this.choiceRect.visible = true;
        this.choiceRect.left = mouse.X;
        this.choiceRect.top = mouse.Y;
        this.choiceRect.width = 0;
        this.choiceRect.height = 0;
    }
    
    if (this.choiceRect.visible) {
        this.choiceRect.width = mouse.X - this.choiceRect.left;
        this.choiceRect.height = mouse.Y - this.choiceRect.top;
        
        if (mouse.pressUp) {
            this.choiceRect.visible = false;
            
            // The choice rectangle has been used to select a group
            // of units.
            // We now have to (1) unselect all currently selected units
            //            and (2) select the units that lie within
            //                    the choice rectangle
            // However, we are very lazy. Therefore, we don't do this ourselves,
            // but let the entityManager handle it it instead.
            if (!keys[2]) {
                entityManager.unselectAll();
            }
            entityManager.selectFromRect(this.choiceRect.left - 176 + this.camL*32,
                                         this.choiceRect.top - 16 + this.camT*32,
                                         this.choiceRect.width,
                                         this.choiceRect.height);
        }
    }
},

render: function(ctx) {
    if (this.tileset) {
        var tV = this.tilesVisible,
            ts = this.tileset,
            tG = this.tilesGround,
            cL = this.camL,
            cT = this.camT,
            cR = this.camR,
            cB = this.camB;

        // draw the background tiles
        for (var i = cL; i < cR; i++) {
            for (var j = cT; j < cB; j++) {
                // do not draw the tile if it is in complete blackness
                if (tV[i+1][j+1] > 0) {
                    ts.drawTileAt(ctx,
                                  176 + (i - cL)*32,
                                  16 + (j - cT)*32,
                                  tG[i][j]);
                }
            }
        }
    }
},

renderOnTop: function(ctx) {
    if (this.tileset) {
        // here we calculate the fog on the minimap -
        // we don't actually render it yet though!
        if (!this.minimap.speedThingsUp) {
            this.calculateMiniFog(ctx);
        }

        // here we calculate and render the fog on screen
        if (this.fogRender) {
            this.renderFog(ctx);
        }
        
        // draw the building rectangle
        this.buildRect.render(ctx);

        // draw the passability view on top of the tiles
        if (world.passabilityview) {
            for (var i = this.camL; i < this.camR; i++) {
                for (var j = this.camT; j < this.camB; j++) {
                    ctx.fillStyle = this.fillPassView[this.tilesFree[i][j]];
                    ctx.strokeStyle = this.strokePassView[this.tilesFree[i][j]];
                    
                    ctx.fillRect(188.5 + (i-this.camL)*32, 28.5 + (j-this.camT)*32, 8, 8);
                    ctx.strokeRect(188.5 + (i-this.camL)*32, 28.5 + (j-this.camT)*32, 8, 8);
                }
            }
        }
    }
},

calculateMiniFog : function(ctx) {
    var ww = world.width + 1,
        wh = world.height + 1,
        tV = this.tilesVisible,
        tmV = this.minimap.tilesVisible,
        cL = this.camL + 1,
        cR = this.camR + 1,
        cT = this.camT + 1,
        cB = this.camB + 1;

    // calcuate the fog of war for the entire map
    // to use it on the minimap (this needs to happen
    // before calulating the fog of war for the screen,
    // because that will change the data in tilesVisible)
    for (var i = 1; i < ww; i++) {
        for (var j = 1; j < wh; j++) {
            var x = (i - cL) * 32 + 176,
                y = (j - cT) * 32 + 16;
            
            if ((tV[i][j] > 0) &&
               ((tV[i][j-1] === 0) ||
               (tV[i-1][j] === 0) ||
               (tV[i][j+1] === 0) ||
               (tV[i+1][j] === 0) ||
               (tV[i-1][j-1] === 0) ||
               (tV[i+1][j-1] === 0) ||
               (tV[i-1][j+1] === 0) ||
               (tV[i+1][j+1] === 0))) {
                // Here we have a tile that should be black
                // on the minimap, because it was originally
                // white or gray but has at least one black
                // tile close to it.
                tmV[i][j] = 0;
            } else if ((tV[i][j] === 2) &&
                      ((tV[i][j-1] < 2) ||
                      (tV[i-1][j] < 2) ||
                      (tV[i][j+1] < 2) ||
                      (tV[i+1][j] < 2) ||
                      (tV[i-1][j-1] < 2) ||
                      (tV[i+1][j-1] < 2) ||
                      (tV[i-1][j+1] < 2) ||
                      (tV[i+1][j+1] < 2))) {
                // Here we have a tile that should be gray
                // on the minimap, because it was originally
                // white but has at least one gray tile close
                // to it.
                tmV[i][j] = 1;
            }
        }
    }
},

renderFog : function(ctx) {
    var ww = world.width + 1,
        wh = world.height + 1,
        tV = this.tilesVisible,
        dGTA = g_sprites.drawGeneralTileAt,
        cL = this.camL + 1,
        cR = this.camR + 1,
        cT = this.camT + 1,
        cB = this.camB + 1;

    ctx.fillStyle = "#000000";

    // draw the fog of war for the actual screen
    for (var i = cL; i < cR; i++) {
        for (var j = cT; j < cB; j++) {
            var x = (i - cL) * 32 + 176,
                y = (j - cT) * 32 + 16;

            if (tV[i][j] === 0) {
                // instead of copying an all-black sprite,
                // we just fill the rectangle black... this
                // should be a lot faster!
                ctx.fillRect(x, y, 32, 32);
            } else if (tV[i][j] === 1) {
                    dGTA(ctx, x, y, 9);
            } else {
                // This tile is completely visible, so theoretically
                // we don't have to do anything here. However, we still
                // want to draw some nice transition if there are invisible
                // tiles in the vicinity.
                // This transition is for the shadows, not for the complete
                // blackness.
                if ((j > 0) && (tV[i][j-1] < 2)) {
                    dGTA(ctx, x, y, 17);
                }
                if ((i > 0) && (tV[i-1][j] < 2)) {
                    dGTA(ctx, x, y, 10);
                }
                if ((j < wh) && (tV[i][j+1] < 2)) {
                    dGTA(ctx, x, y, 1);
                }
                if ((i < ww) && (tV[i+1][j] < 2)) {
                    dGTA(ctx, x, y, 8);
                }
                if ((i > 0) && (j > 0) && (tV[i-1][j-1] < 2)) {
                    dGTA(ctx, x, y, 18);
                }
                if ((i < ww) && (j > 0) && (tV[i+1][j-1] < 2)) {
                    dGTA(ctx, x, y, 16);
                }
                if ((i > 0) && (j < wh) && (tV[i-1][j+1] < 2)) {
                    dGTA(ctx, x, y, 2);
                }
                if ((i < ww) && (j < wh) && (tV[i+1][j+1] < 2)) {
                    dGTA(ctx, x, y, 0);
                }
            }
            
            if (tV[i][j] > 0) {
                // Now comes the transition for complete blackness.
                if ((j > 0) && (tV[i][j-1] === 0)) {
                    dGTA(ctx, x, y, 20);
                }
                if ((i > 0) && (tV[i-1][j] === 0)) {
                    dGTA(ctx, x, y, 13);
                }
                if ((j < wh) && (tV[i][j+1] === 0)) {
                    dGTA(ctx, x, y, 4);
                }
                if ((i < ww) && (tV[i+1][j] === 0)) {
                    dGTA(ctx, x, y, 11);
                }
                if ((i > 0) && (j > 0) && (tV[i-1][j-1] === 0)) {
                    dGTA(ctx, x, y, 21);
                }
                if ((i < ww) && (j > 0) && (tV[i+1][j-1] === 0)) {
                    dGTA(ctx, x, y, 19);
                }
                if ((i > 0) && (j < wh) && (tV[i-1][j+1] === 0)) {
                    dGTA(ctx, x, y, 5);
                }
                if ((i < ww) && (j < wh) && (tV[i+1][j+1] === 0)) {
                    dGTA(ctx, x, y, 3);
                }
            }
        }
    }
    
    // draw the routefinding overlay
    if (diagnostics.renderRoutefindingOverlay) {
        cL -= 1;
        cR -= 1;
        cB -= 1;
        cT -= 1;
        
        ctx.globalAlpha = 0.3;
        for (var i = cL; i < cR; i++) {
            for (var j = cT; j < cB; j++) {
                var x = (i - cL) * 32 + 176,
                    y = (j - cT) * 32 + 16;
    
                ctx.fillStyle = world.drawOverlay[i][j];
                ctx.fillRect(x, y, 32, 32);
            }
        }
        ctx.globalAlpha = 1;
    }
},

// initializes the world to a new map with given
// map number is mapNo and environment env (0 .. grass, 1 .. winter, 2 .. desert)
reset: function(mapNo, env) {

    player.me.gold = 2000;
    player.me.lumber = 2000;

    var ourmap;

    if (!singleplayer.on) {
        ourmap = g_sprites.multiMaps[mapNo - 1];
    } else if (player.me.race === 0) {
        ourmap = g_sprites.orcMaps[mapNo - 1];
    } else {
        ourmap = g_sprites.humanMaps[mapNo - 1];
    }

    // Yes, these need to be inverted - ourmap is written in that way!
    var h = ourmap.width,
        w = ourmap.height;

    this.width = w;
    this.height = h;
    this.camL = 0;
    this.camT = 0;
    this.camR = 14;
    this.camB = 14;
    
    this.minimap.speedThingsUp = (w > 49) && (h > 49);

    this.isDesert = env;

    if (env === 1) {
       this.isWinter = 1;
       
       world.tileset = g_sprites.winter_tileset;
       entityManager._minimapFogColors = ["#000000", "#666666", "#bbbbbb"];
    } else {
       this.isWinter = 0;
       
       if (env === 0) {
           world.tileset = g_sprites.grass_tileset;
           entityManager._minimapFogColors = ["#000000", "#066006", "#3E8313"];
       } else {
           world.tileset = g_sprites.desert_tileset;
           entityManager._minimapFogColors = ["#000000", "#662200", "#884404"];
       }
    }
    
    this.tilesFree = [];
    this.tilesGround = [];
    this.tilesVisible = [];
    this.tilesHarvestable = [];
    this.minimap.tilesVisible = [];
    this.drawOverlay = [];

    for (var i = 0; i < w; i++) {
        this.tilesFree[i] = [];
        this.tilesVisible[i] = [];
        this.tilesHarvestable[i] = [];
        this.minimap.tilesVisible[i] = [];
        this.drawOverlay[i] = [];

        for (var j = 0; j < h; j++) {
            this.tilesFree[i][j] = 0;
            this.tilesVisible[i][j] = 0;
            this.minimap.tilesVisible[i][j] = 0;
            this.drawOverlay[i][j] = "#000000";
        }
    }

    this.loadMap(ourmap);
    
    this.recalculateTrees();

    this.recalculateHarvestableTiles();

    this.recalculateFreeTiles();
    
    for (var i = 0; i < w+2; i++) {
        this.tilesVisible[i] = [];
        this.minimap.tilesVisible[i] = [];

        for (var j = 0; j < h+2; j++) {
            this.tilesVisible[i][j] = 0;
            this.minimap.tilesVisible[i][j] = 0;
        }
    }
},

loadMap: function(ourmap) {
    var raceToPlayer = [0, 1, 2];

    if (player.me.race !== player.myID) {
        raceToPlayer = [1, 0, 2];
    }

    // yep, inverted... we roll that way!
    var h = ourmap.width,
        w = ourmap.height;
    var mapcanvas = document.createElement('canvas');
    mapcanvas.width = w;
    mapcanvas.height = h;
    var mapctx = mapcanvas.getContext("2d");

    ourmap.drawAt(mapctx, 0, 0);

    var mapimgd = mapctx.getImageData(0, 0, w, h);
    var pix = mapimgd.data;
    var len = pix.length;

    world.tilesGround = [];
    
    for (var i = 0; i < w; i++) {
        world.tilesGround[i] = [];
        var p = i*h*4;

        for (var j = 0; j < h; j++) {
            // We assign to the ground the R-value of the pixel.
            world.tilesGround[i][j] = pix[p];

            if (!((pix[p+1] === 255) && (pix[p+2] === 255))) {
                if (pix[p+2] === 200) {
                    entityManager.generateUnit({
                        type : pix[p+2],
                        race : pix[p+1],
                        tileX : i,
                        tileY : j,
                        goldLeft : 25000
                    }, raceToPlayer[pix[p+1]]);
                } else {
                    entityManager.generateUnit({
                        type : pix[p+2],
                        race : pix[p+1],
                        tileX : i,
                        tileY : j
                    }, raceToPlayer[pix[p+1]]);
                }
            }
            
            p += 4;
        }
    }
}

}
