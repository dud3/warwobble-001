// =====
// WORLD
// =====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;

var world = {

camL : 0, // left of visible piece in tiles
camT : 0, // top of visible piece in tiles
camR : 14, // right of visible piece in tiles
camB : 14, // bottom of visible piece in tiles
width : 0, // width of whole world in tiles
height : 0, // height of whole world in tiles
maxWidth : 196, // maximum possible width of a map
maxHeight : 196, // maximum possible height of a map
isDesert : 1, // 2 if we have desert, 1 if we have winter, 0 if we have grassland
isWinter : 1, // 1 if we have winter, 0 if not (desert or grassland)
tilesFree : [[]], // boolean values that tell us whether
                  // the tile is free (true) or not
tilesGround : [[]], // integers that tell us which kind of floor we have
curCol : 0,  // the tile selected on the right side
curEnt : -1, // the entity selected on the right side
             // one of curCol and curEnt should always be -1 (the non-selected one)

minimap : {
    render : function (ctx) {
        // draw the mini-map
        ctx.fillStyle = "#000000";
        ctx.fillRect(23.5, 25.5, 129, 129);
        
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(24.5 + Math.floor(world.camL * 127 / world.width),
                       26.5 + Math.floor(world.camT * 127 / world.height),
                       Math.floor(14 * 128 / world.width),
                       Math.floor(14 * 128 / world.height));
    }
},

init: function() {

    world.tilesGround = [];
    
    for (var i = 0; i < this.maxWidth; i++) {
        world.tilesGround[i] = [];

        for (var j = 0; j < this.maxHeight; j++) {
            world.tilesGround[i][j] = 0;
        }
    }
},

update: function(du) {
    if (keysHooked) {
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
    }

    if (mouse.pressRight &&
       (mouse.X > 176) && (mouse.X < 624) &&
       (mouse.Y > 16) && (mouse.Y < 464)) {
        this.curCol = this.tilesGround[Math.floor((mouse.X - 176) / 32) + this.camL]
                                       [Math.floor((mouse.Y - 16) / 32) + this.camT];
        if (this.isTree(this.curCol)) {
            this.curCol = 25;
        }

        this.curEnt = -1;
    }
    
    if (mouse.pressed &&
       (mouse.X > 176) && (mouse.X < 624) &&
       (mouse.Y > 16) && (mouse.Y < 464)) {
        if (this.curCol >= 0) {
            this.tilesGround[Math.floor((mouse.X - 176) / 32) + this.camL]
                            [Math.floor((mouse.Y - 16) / 32) + this.camT] = this.curCol;
        } else if (this.curEnt >= 0) {
            // we only want to allow one entity per tile,
            // and therefore we have to find the current entity and delete it

            var si = entityList.sizes[entityList.iconToRace[this.curEnt]]
                                     [entityList.iconToType[this.curEnt]];

            for (var i = 0; i < si[0]; i++) {
                for (var j = 0; j < si[1]; j++) {
                    var someEnt = entityManager.findEntityInTile(mouse.tileX() + i, mouse.tileY() + j);
            
                    if (!(someEnt === 0)) {
                        someEnt._isDeadNow = true;
                    }
                }
            }

            if (!(this.curEnt === 90)) { // special case: cancellation
                entityManager.generateUnit({
                    type : entityList.iconToType[this.curEnt],
                    race : entityList.iconToRace[this.curEnt],
                    tileX : mouse.tileX(),
                    tileY : mouse.tileY()
                }, entityList.iconToRace[this.curEnt]);
            }
        }
    }

    if (mouse.pressUp) {
        this.recalculateTrees();
        this.recalculateIce();
        this.recalculateWater();
    }
},

render: function(ctx) {
    if (this.tileset) {
        // draw the background tiles
        for (var i = this.camL; i < this.camR; i++) {
            for (var j = this.camT; j < this.camB; j++) {
                this.tileset.drawTileAt(ctx, 176 + (i-this.camL)*32,
                    16 + (j-this.camT)*32, this.tilesGround[i][j]);
            }
        }
    }

    this.tileset.drawAt(g_tsctx, 0, 0); 

    if (this.curCol >= 0) {
        g_tsctx.strokeStyle = "#77ff77";
        g_tsctx.strokeRect((world.curCol % 8) * 32 + 3.5, Math.floor(world.curCol / 8) * 32 + 4.5, 25, 25);

        if ((mouse.X > 176) && (mouse.Y > 16) && (mouse.X < 640)) {
            ctx.strokeStyle = "#00ff00";
            ctx.strokeRect(176.5 + mouse.tileX() * 32 - world.camL * 32,
                           16.5 + mouse.tileY() * 32 - world.camT * 32,
                           32, 32);
        }
    }

    g_sprites.icons.drawAt(g_icctx, 0, 0);

    if (this.curEnt >= 0) {
        g_icctx.strokeStyle = "#77ff77";
        g_icctx.strokeRect((world.curEnt % 10) * 46 + 3.5, Math.floor(world.curEnt / 10) * 38 + 4.5, 39, 31);

        var si = entityList.sizes[entityList.iconToRace[this.curEnt]]
                                 [entityList.iconToType[this.curEnt]];

        if ((mouse.X > 176) && (mouse.Y > 16)) {
            ctx.strokeStyle = "#00ff00";
            ctx.strokeRect(176.5 + mouse.tileX() * 32 - world.camL * 32,
                           16.5 + mouse.tileY() * 32 - world.camT * 32,
                           32 * si[0], 32 * si[1]);
        }
    }
},

randomizeAll: function() {

    this.tilesFree = [];
    this.tilesGround = [];

    for (var i = 0; i < this.maxWidth; i++) {
        this.tilesFree[i] = [];
        this.tilesGround[i] = [];

        for (var j = 0; j < this.maxHeight; j++) {
            this.tilesFree[i][j] = true;
            // We go from 0 to 10, but we give 0 ten times as much likeliness to be taken.
            this.tilesGround[i][j] = util.max(0, Math.floor(util.randRange(-10, 11)));
        }
    }
},

isTree: function(tGij) {
    return ((tGij > 15) && (tGij < 20)) ||
           ((tGij > 23) && (tGij < 28)) ||
           ((tGij > 31) && (tGij < 36));
},

isIce: function(tGij) {
    return ((tGij > 39) && (tGij < 64));
},

isWater: function(tGij) {
    return ((tGij > 63) && (tGij < 88));
},

isIceOrWater: function(tGij) {
    return ((tGij > 39) && (tGij < 88));
},

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

recalculateIce: function() {
    var w = this.width,
        h = this.height,
        tG = this.tilesGround,
        tGij,
        ice = this.isIce,
        iceOrWater = this.isIceOrWater;

    for (var i = 0; i < w; i++) {
        for (var j = 0; j < w; j++) {
            tGij = tG[i][j];

            if (ice(tGij)) {
                tG[i][j] = 49;
                
                var id = Math.max(0, i-1),
                    iu = Math.min(w-1, i+1),
                    jd = Math.max(0, j-1),
                    ju = Math.min(h-1, j+1);

                // We first do the 3x3 main block - here horizontal
                if (!iceOrWater(tG[iu][j])) {
                    tG[i][j] += 1;
                } else if (!iceOrWater(tG[id][j])) {
                    tG[i][j] -= 1;
                }
                
                // Now the 3x3 main block vertical
                if (!iceOrWater(tG[i][ju])) {
                    tG[i][j] += 8;
                } else if (!iceOrWater(tG[i][jd])) {
                    tG[i][j] -= 8;
                }
                
                // If the main block didn't catch anything, then we are
                // surrounded by friendly tiles vertically and horizontally;
                // which still leaves the corners, a special case that is
                // routinely ignored for trees due to the special nature of
                // the tree tiles but has to be take into account for ice
                // and water.
                if (tG[i][j] === 49) {
                    if (!iceOrWater(tG[iu][ju])) {
                        tG[i][j] = 46;
                    } else if (!iceOrWater(tG[id][ju])) {
                        tG[i][j] = 47;
                    } else if (!iceOrWater(tG[iu][jd])) {
                        tG[i][j] = 54;
                    } else if (!iceOrWater(tG[id][jd])) {
                        tG[i][j] = 55;
                    }
                }
            }
        }
    }
},

recalculateWater: function() {
    var w = this.width,
        h = this.height,
        tG = this.tilesGround,
        tGij,
        water = this.isWater;

    for (var i = 0; i < w; i++) {
        for (var j = 0; j < w; j++) {
            tGij = tG[i][j];

            if (water(tGij)) {
                tG[i][j] = 73;
                
                var id = Math.max(0, i-1),
                    iu = Math.min(w-1, i+1),
                    jd = Math.max(0, j-1),
                    ju = Math.min(h-1, j+1);

                // We first do the 3x3 main block - here horizontal
                if (!water(tG[iu][j])) {
                    tG[i][j] += 1;
                } else if (!water(tG[id][j])) {
                    tG[i][j] -= 1;
                }
                
                // Now the 3x3 main block vertical
                if (!water(tG[i][ju])) {
                    tG[i][j] += 8;
                } else if (!water(tG[i][jd])) {
                    tG[i][j] -= 8;
                }
                
                // If the main block didn't catch anything, then we are
                // surrounded by friendly tiles vertically and horizontally;
                // which still leaves the corners, a special case that is
                // routinely ignored for trees due to the special nature of
                // the tree tiles but has to be take into account for ice
                // and water.
                if (tG[i][j] === 73) {
                    if (!water(tG[iu][ju])) {
                        tG[i][j] = 70;
                    } else if (!water(tG[id][ju])) {
                        tG[i][j] = 71;
                    } else if (!water(tG[iu][jd])) {
                        tG[i][j] = 78;
                    } else if (!water(tG[id][jd])) {
                        tG[i][j] = 79;
                    }
                }
            }
        }
    }
},

// initializes the world to a new map with given
// width w and height h
reset: function(w, h) {
    this.width = w;
    this.height = h;
    this.camL = 0;
    this.camT = 0;
    this.camR = 14;
    this.camB = 14;
},

saveMap: function() {
    var mapcanvas = document.getElementById('outCanvas');
    mapcanvas.width = world.width;
    mapcanvas.height = world.height;
    var w = world.width,
        h = world.height;
    var mapctx = mapcanvas.getContext("2d");

    var mapimgd = mapctx.getImageData(0, 0, w, h);
    var pix = mapimgd.data;
    var len = pix.length;

    for (var i = 0; i < w; i++) {
        var p = i*h*4;

        for (var j = 0; j < h; j++) {
            // We assign the R-value of the pixel to the ground tile.
            pix[p] = world.tilesGround[i][j];

            var someEnt = entityManager.findEntityInTileDumb(i, j);
            if (someEnt === 0) {
                pix[p+1] = 255;
                pix[p+2] = 255;
            } else {
                pix[p+1] = someEnt.race;
                pix[p+2] = someEnt.type;
            }

            // We also have the alpha channel, but it'd be the 
            // best thing to just leave that one alone - that way,
            // people will be able to copy maps using screenshots.
            pix[p+3] = 255;
            
            p += 4;
        }
    }

    mapctx.putImageData(mapimgd, 0, 0);

    // document.getElementById('mapOut').src = mapcanvas.toDataURL("image/png");
    // window.location = mapcanvas.toDataURL("image/png");
    window.open(mapcanvas.toDataURL("image/png"), '_blank');
},

loadMap: function() {
    // yep, inverted... we roll that way!
    var h = g_sprites.ourmap.width,
        w = g_sprites.ourmap.height;
    var mapcanvas = document.getElementById('outCanvas');
    mapcanvas.width = w;
    mapcanvas.height = h;
    world.reset(w, h);
    var mapctx = mapcanvas.getContext("2d");

    g_sprites.ourmap.drawAt(mapctx, 0, 0);

    var mapimgd = mapctx.getImageData(0, 0, w, h);
    var pix = mapimgd.data;
    var len = pix.length;

    for (var i = 0; i < w; i++) {
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
                    }, pix[p+1]);
                } else {
                    entityManager.generateUnit({
                        type : pix[p+2],
                        race : pix[p+1],
                        tileX : i,
                        tileY : j
                    }, pix[p+1]);
                }
            }
            
            p += 4;
        }
    }
}

}