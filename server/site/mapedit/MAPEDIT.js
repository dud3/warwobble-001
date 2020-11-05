// =========
// WarWobble
// =========
/*

A hopefully-soon-playable version of the awesomest game ever: WarCraft II.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// ====================================
// JUMP TO THE NEXT SECTION OF THE GAME
// ====================================

// This contains the things that are shared between starting a human game
// and starting an orc game.
function startSomeGame() {
    mouse.clear();
}

function startOrcGame() {
    mouse.sprite = g_sprites.orc_hand;
    screenManager.orcFrame.visible = true;
    world.tileset = g_sprites.winter_tileset;
    world.reset(32, 32);
    world.randomizeAll();

    startSomeGame();
}

// =============
// GATHER INPUTS
// =============

var HELP_KEY = 'H'.charCodeAt(0);
var SAVE_KEY = 'S'.charCodeAt(0);
var LOAD_KEY = 'L'.charCodeAt(0);
var KEY_SIZE_1 = '1'.charCodeAt(0);
var KEY_SIZE_2 = '2'.charCodeAt(0);
var KEY_SIZE_3 = '3'.charCodeAt(0);
var KEY_SIZE_4 = '4'.charCodeAt(0);
var KEY_WINTER = 'W'.charCodeAt(0);
var KEY_DESERT = 'D'.charCodeAt(0);
var KEY_GRASS = 'G'.charCodeAt(0);
var KEY_RANDOM = 'I'.charCodeAt(0);
var KEY_HOOK = 'M'.charCodeAt(0);

var keysHooked = false;

var MAPEDIT = {
    showHelp: function() {
        alert("Right now, you can use the following keys:\n\n" +
              "[ S ] Save the map \n" +
              "[ L ] Load map 'map.png' \n" +
              "[ 1 ] Set map size to 32x32, [ 2 ] 64x64, [ 3 ] 96x96, [ 4 ] 128x128 \n" +
              "[ D ] Set map to desert, [ W ] winter, [ G ] grass \n" +
              "[ I ] Reset map to randomness \n" +
              "[ M ] Hook and unhook the arrow keys to the window \n" +
              "[ H ] display help\n\n" + 
              "Debug stuff:\n" +
              "[ P ] toggle pause, [ O ] step ahead one step, [ C ] toggle clear,\n" + 
              "[ B ] box, [ U ] undo box, [ F ] flipflop,\n" +
              "[ X ] toggle collision view,\n" + 
              "[ R ] toggle render, [ Q ] quit");
    },
    
    toggleKeyHook: function() {
        keysHooked = !keysHooked;
        
        if (keysHooked) {
            document.getElementById('ourbody').style = "overflow:hidden;";
        } else {
            document.getElementById('ourbody').style = "";
        }
    },
    
    randomizeMap: function() {
        world.randomizeAll();
        entityManager.dropAll();
    },
    
    setWinter: function() {
        world.tileset = g_sprites.winter_tileset;
        world.isWinter = 1;
        world.isDesert = 1;
    },
    
    setGrass: function() {
        world.tileset = g_sprites.grass_tileset;
        world.isWinter = 0;
        world.isDesert = 0;
    },
    
    setDesert: function() {
        world.tileset = g_sprites.desert_tileset;
        world.isWinter = 0;
        world.isDesert = 2;
    }
}

function gatherInputs() {
    // We only need to consider one special key: L for help.
    // All the others are handled somewhere else.
    if (eatKey(HELP_KEY)) {
        MAPEDIT.showHelp();
    }
    
    if (eatKey(SAVE_KEY)) {
        world.saveMap();
    }
    
    if (eatKey(LOAD_KEY)) {
        world.loadMap();
    }

    if (eatKey(KEY_HOOK)) {
        MAPEDIT.toggleKeyHook();
    }
    
    if (eatKey(KEY_RANDOM)) {
        MAPEDIT.randomizeMap();
    }
    
    if (eatKey(KEY_SIZE_1)) {
        world.reset(32, 32);
    }
    
    if (eatKey(KEY_SIZE_2)) {
        world.reset(64, 64);
    }
    
    if (eatKey(KEY_SIZE_3)) {
        world.reset(96, 96);
    }
    
    if (eatKey(KEY_SIZE_4)) {
        world.reset(128, 128);
    }
    
    if (eatKey(KEY_WINTER)) {
        MAPEDIT.setWinter();
    }
    
    if (eatKey(KEY_GRASS)) {
        MAPEDIT.setGrass();
    }
    
    if (eatKey(KEY_DESERT)) {
        MAPEDIT.setDesert();
    }
    
    mouse.gather();
}


// =================
// UPDATE SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `update` routine handles generic stuff such as
// pausing, single-step, and time-handling.
//
// It then delegates the game-specific logic to `updateSimulation`


// GAME-SPECIFIC UPDATE LOGIC

function updateSimulation(du) {
    
    processDiagnostics();
    
    world.update(du);
    
    entityManager.update(du);

    screenManager.update(du);

}

// GAME-SPECIFIC DIAGNOSTICS

function processDiagnostics() {

// none so far, but that should change at some point ;)

}


// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`


// GAME-SPECIFIC RENDERING

function renderSimulation(ctx) {

    world.render(ctx);

    entityManager.render(ctx);

    world.minimap.render(ctx);

    screenManager.render(ctx);
    
    mouse.render(ctx);
}


// =============
// PRELOAD STUFF
// =============

var g_images = {};

function requestPreloads() {

    var requiredImages = {
	human_peon       : "./images/human_peon.png",
	human_grunt      : "./images/human_grunt.png",
	human_archer     : "./images/human_archer.png",
	human_zeppelin   : "./images/human_zeppelin.png",
	human_hall            : "./images/human_hall.png",
	human_stronghold      : "./images/human_stronghold.png",
	human_fortress        : "./images/human_fortress.png",
	human_farm            : "./images/human_farm.png",
	human_barracks        : "./images/human_barracks.png",
	human_lumbermill      : "./images/human_lumbermill.png",
	human_smith           : "./images/human_smith.png",
	human_tower           : "./images/human_tower.png",
	human_tower_extra     : "./images/human_tower_extra.png",
	human_tower_cannon    : "./images/human_tower_cannon.png",
	human_alchemist       : "./images/human_alchemist.png",
	human_altar           : "./images/human_altar.png",
	human_foundry         : "./images/human_foundry.png",
	human_oilrig          : "./images/human_oilrig.png",
	human_refinery        : "./images/human_refinery.png",
	human_roost           : "./images/human_roost.png",
	human_shipyard        : "./images/human_shipyard.png",
	human_stables         : "./images/human_stables.png",
	human_temple          : "./images/human_temple.png",
	orc_frame        : "./images/orc_frame_mapedit.png",
	orc_button       : "./images/orc_button.png",
	orc_button_s     : "./images/orc_button_small.png",
	orc_hand         : "./images/orc_hand.png",
	orc_peon         : "./images/orc_peon.png",
	orc_grunt        : "./images/orc_grunt.png",
	orc_archer       : "./images/orc_archer.png",
	orc_zeppelin     : "./images/orc_zeppelin.png",
	orc_hall              : "./images/orc_hall.png",
	orc_stronghold        : "./images/orc_stronghold.png",
	orc_fortress          : "./images/orc_fortress.png",
	orc_farm              : "./images/orc_farm.png",
	orc_barracks          : "./images/orc_barracks.png",
	orc_lumbermill        : "./images/orc_lumbermill.png",
	orc_smith             : "./images/orc_smith.png",
	orc_tower             : "./images/orc_tower.png",
	orc_tower_extra       : "./images/orc_tower_extra.png",
	orc_tower_cannon      : "./images/orc_tower_cannon.png",
	orc_alchemist         : "./images/orc_alchemist.png",
	orc_altar             : "./images/orc_altar.png",
	orc_foundry           : "./images/orc_foundry.png",
	orc_oilrig            : "./images/orc_oilrig.png",
	orc_refinery          : "./images/orc_refinery.png",
	orc_roost             : "./images/orc_roost.png",
	orc_shipyard          : "./images/orc_shipyard.png",
	orc_stables           : "./images/orc_stables.png",
	orc_temple            : "./images/orc_temple.png",
	goldmine         : "./images/goldmine.png",
	winter_tileset   : "./images/winter_tileset.png",
	grass_tileset    : "./images/grass_tileset.png",
	desert_tileset   : "./images/desert_tileset.png",
	ourmap           : "./images/map.png",
	icons            : "./images/icons.png",
	font             : "./images/font.png",
	font_big         : "./images/font_big.png"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

function preloadDone() {

    // human sprites
    g_sprites.human_peon         = new Sprite(g_images.human_peon);
    g_sprites.human_grunt        = new Sprite(g_images.human_grunt);
    g_sprites.human_archer       = new Sprite(g_images.human_archer);
    g_sprites.human_zeppelin     = new Sprite(g_images.human_zeppelin);
    g_sprites.human_zeppelin.vert = 2;
    g_sprites.human_hall            = new Sprite(g_images.human_hall);
    g_sprites.human_stronghold      = new Sprite(g_images.human_stronghold);
    g_sprites.human_fortress        = new Sprite(g_images.human_fortress);
    g_sprites.human_farm            = new Sprite(g_images.human_farm);
    g_sprites.human_barracks        = new Sprite(g_images.human_barracks);
    g_sprites.human_lumbermill      = new Sprite(g_images.human_lumbermill);
    g_sprites.human_smith           = new Sprite(g_images.human_smith);
    g_sprites.human_tower           = new Sprite(g_images.human_tower);
    g_sprites.human_tower_extra     = new Sprite(g_images.human_tower_extra);
    g_sprites.human_tower_cannon    = new Sprite(g_images.human_tower_cannon);
    g_sprites.human_alchemist       = new Sprite(g_images.human_alchemist);
    g_sprites.human_altar           = new Sprite(g_images.human_altar);
    g_sprites.human_foundry         = new Sprite(g_images.human_foundry);
    g_sprites.human_oilrig          = new Sprite(g_images.human_oilrig);
    g_sprites.human_refinery        = new Sprite(g_images.human_refinery);
    g_sprites.human_roost           = new Sprite(g_images.human_roost);
    g_sprites.human_shipyard        = new Sprite(g_images.human_shipyard);
    g_sprites.human_stables         = new Sprite(g_images.human_stables);
    g_sprites.human_temple          = new Sprite(g_images.human_temple);

    // orc sprites
    g_sprites.orc_frame        = new Sprite(g_images.orc_frame);
    g_sprites.orc_button       = new Sprite(g_images.orc_button);
    g_sprites.orc_button_s     = new Sprite(g_images.orc_button_s);
    g_sprites.orc_hand         = new Sprite(g_images.orc_hand);

    g_sprites.orc_peon         = new Sprite(g_images.orc_peon);
    g_sprites.orc_grunt        = new Sprite(g_images.orc_grunt);
    g_sprites.orc_archer       = new Sprite(g_images.orc_archer);
    g_sprites.orc_zeppelin     = new Sprite(g_images.orc_zeppelin);
    g_sprites.orc_zeppelin.vert = 1;
    g_sprites.orc_hall            = new Sprite(g_images.orc_hall);
    g_sprites.orc_stronghold      = new Sprite(g_images.orc_stronghold);
    g_sprites.orc_fortress        = new Sprite(g_images.orc_fortress);
    g_sprites.orc_farm            = new Sprite(g_images.orc_farm);
    g_sprites.orc_barracks        = new Sprite(g_images.orc_barracks);
    g_sprites.orc_lumbermill      = new Sprite(g_images.orc_lumbermill);
    g_sprites.orc_smith           = new Sprite(g_images.orc_smith);
    g_sprites.orc_tower           = new Sprite(g_images.orc_tower);
    g_sprites.orc_tower_extra     = new Sprite(g_images.orc_tower_extra);
    g_sprites.orc_tower_cannon    = new Sprite(g_images.orc_tower_cannon);
    g_sprites.orc_alchemist       = new Sprite(g_images.orc_alchemist);
    g_sprites.orc_altar           = new Sprite(g_images.orc_altar);
    g_sprites.orc_foundry         = new Sprite(g_images.orc_foundry);
    g_sprites.orc_oilrig          = new Sprite(g_images.orc_oilrig);
    g_sprites.orc_refinery        = new Sprite(g_images.orc_refinery);
    g_sprites.orc_roost           = new Sprite(g_images.orc_roost);
    g_sprites.orc_shipyard        = new Sprite(g_images.orc_shipyard);
    g_sprites.orc_stables         = new Sprite(g_images.orc_stables);
    g_sprites.orc_temple          = new Sprite(g_images.orc_temple);

    // neutral sprites
    g_sprites.goldmine    = new Sprite(g_images.goldmine);

    // general sprites
    g_sprites.winter_tileset = new Sprite(g_images.winter_tileset);
    g_sprites.grass_tileset  = new Sprite(g_images.grass_tileset);
    g_sprites.desert_tileset = new Sprite(g_images.desert_tileset);
    g_sprites.ourmap         = new Sprite(g_images.ourmap);
    g_sprites.icons          = new Sprite(g_images.icons);
    g_sprites.font           = new Sprite(g_images.font);
    g_sprites.font_big       = new Sprite(g_images.font_big);

    world.init();
    screenManager.init();
    startOrcGame();
    preloadEntityList();

    main.init();
    
    keys[LOAD_KEY] = true;
}

// Kick it off
requestPreloads();
