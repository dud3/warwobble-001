"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// =========
// WARWOBBLE
// =========
// 
// A hopefully-soon-playable clone of the awesomest game ever: WarCraft II.
// 
// If you are searching for g_sprites, which has originally been in here,
// then please look for Sprite.js instead. There are arguments for keeping
// g_sprites here, as well as some good arguments for putting it into
// Sprite.js, and currently the arguments for putting it there seem to
// be the better ones.

var version = "1.00";


// ====================================
// JUMP TO THE NEXT SECTION OF THE GAME
// ====================================

function gotoStartScreen() {

    singleplayer.on = false;

    screenManager.startscreen.activate();
    
    // if some entities existed before,
    // then now is the time to drop them
    entityManager.dropAll();
    world.tileset = undefined;
    
    mouse.sprite = g_sprites.hand;
}

// This starts a game with the given players, which are
// put in as an array of integers. Each integer value
// stands for one player, which the integer itself
// representing that player's race (0 for orc, 1 for human).
function gotoGame(players, mapNo) {
    world.allowKeyboardGather = true;
    player.reset(players);
    screenManager.startGame();
    entityManager.initGame();
    // delete messages from the previous game
    g_sprites.init();

    if (player.me.race === 0) {
        mouse.sprite = g_sprites.orc_hand;
    } else {
        mouse.sprite = g_sprites.human_hand;
    }

    if (!singleplayer.on) {
        world.reset(mapNo, 2);
    } else if (player.me.race === 0) {
        world.reset(mapNo, 1);
    } else {
        world.reset(mapNo, 0);
    }
    
    entityManager.recountFood();

    for (var i = 0; i < player.amount; i++) {
        entityManager.recountProduction(i);
    }

    mouse.clear();
    world.choiceRect.visible = false;
}

function gotoSingleplayerGame(players, mapNo) {

    // initialize the replay system

    singleplayer.replaySystem.mapNo = mapNo;
    singleplayer.replaySystem.commands = [];
    singleplayer.replaySystem.playing = false;


    // array copies are fun! =)

    singleplayer.replaySystem.players = [];
    for (var i = 0; i < players.length; i++) {
        singleplayer.replaySystem.players[i] = players[i];
    }


    // do the actual gotoSingleplayerGame

    gotoSingleplayerGameDirectly(players, mapNo);
}

function gotoSingleplayerGameDirectly(players, mapNo) {
    singleplayer.updateID = 0;

    sendCommand = singleplayer.sendCommand;
    
    world.renderInterpolation = false;
    singleplayer.on = true;

    singleplayer.switchReqAniFrame();
    
    gotoGame(players, mapNo);
}

function gotoMultiplayerGame() {
    world.renderInterpolation = true;
    singleplayer.on = false;

    sendCommand = multiplayer.sendCommand;
    screenManager.startscreen.visible = false;

    // SP game can go directly to the game, but MP must use socket.io
    // events instead. See multiplayer.mpEventSetup.
    var socket = io.connect();
    multiplayer.mpSetup(socket);
}

// =============
// GATHER INPUTS
// =============

function gatherInputs() {
    if (world.allowKeyboardGather) {
        gather();
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

    if (screenManager.curFrame.visible) {

        if (singleplayer.on && singleplayer.useReqAniFrame) {
            singleplayer.update(du);
        }
        
        entityManager.update(du);
    
        world.update(du);
        
        screenManager.update(du);
    
        cross.update(du);
        
        // slowly unshow message
        g_sprites.update(du);
    
        // check if anyone won; and if so, react to that!
        player.update(du);
    
    } else {

        screenManager.update(du);

    }
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
 
    if (screenManager.curFrame.visible) {

        world.render(ctx);

        entityManager.render(ctx);

        world.choiceRect.render(ctx);

        world.renderOnTop(ctx);
    
        cross.render(ctx);
        
        // show messages
        g_sprites.render(ctx);

        screenManager.commonrender(ctx);

        world.minimap.render(ctx);

        entityManager.renderHUD(ctx);
    }
    
    if (screenManager.startscreen.visible) {

        screenManager.startscreen.render(ctx);
    }
    
    if (screenManager.victoryFrame.visible) {
        screenManager.victoryFrame.render(ctx);
		 multiplayer.endGame();
    }
    
    if (screenManager.defeatFrame.visible) {

        screenManager.defeatFrame.render(ctx);
		 multiplayer.endGame();
    }
 
    if (diagnostics.visible) {

        diagnostics.render(ctx);
    }
    
    mouse.render(ctx);
}


// =============
// PRELOAD STUFF
// =============

var g_images = {};

function requestPreloads() {

    var requiredImages = {
        human_frame           : "./images/human_frame.png",
        human_frame_t         : "./images/human_frame_top.png",
        human_frame_r         : "./images/human_frame_right.png",
        human_frame_b         : "./images/human_frame_bottom.png",
        human_button          : "./images/human_button.png",
        human_button_s        : "./images/human_button_small.png",
        human_hand            : "./images/human_hand.png",
        human_corpse          : "./images/human_corpse.png",
        human_peon            : "./images/human_peon.png",
        human_peon_gold       : "./images/human_peon_gold.png",
        human_peon_lumber     : "./images/human_peon_lumber.png",
        human_peon_attack     : "./images/human_peon_attack.png",
        human_peon_corpse     : "./images/human_peon_corpse.png",
        human_grunt           : "./images/human_grunt.png",
        human_grunt_attack    : "./images/human_grunt_attack.png",
        human_grunt_corpse    : "./images/human_grunt_corpse.png",
        human_archer          : "./images/human_archer.png",
        human_archer_attack   : "./images/human_archer_attack.png",
        human_archer_corpse   : "./images/human_archer_corpse.png",
        human_zeppelin        : "./images/human_zeppelin.png",
        human_zeppelin_corpse : "./images/human_zeppelin_corpse.png",
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
        orc_frame             : "./images/orc_frame.png",
        orc_frame_t           : "./images/orc_frame_top.png",
        orc_frame_r           : "./images/orc_frame_right.png",
        orc_frame_b           : "./images/orc_frame_bottom.png",
        orc_button            : "./images/orc_button.png",
        orc_button_s          : "./images/orc_button_small.png",
        orc_hand              : "./images/orc_hand.png",
        orc_corpse            : "./images/orc_corpse.png",
        orc_peon              : "./images/orc_peon.png",
        orc_peon_attack       : "./images/orc_peon_attack.png",
        orc_peon_gold         : "./images/orc_peon_gold.png",
        orc_peon_lumber       : "./images/orc_peon_lumber.png",
        orc_peon_corpse       : "./images/orc_peon_corpse.png",
        orc_grunt             : "./images/orc_grunt.png",
        orc_grunt_attack      : "./images/orc_grunt_attack.png",
        orc_grunt_corpse      : "./images/orc_grunt_corpse.png",
        orc_archer            : "./images/orc_archer.png",
        orc_archer_attack     : "./images/orc_archer_attack.png",
        orc_archer_corpse     : "./images/orc_archer_corpse.png",
        orc_zeppelin          : "./images/orc_zeppelin.png",
        orc_zeppelin_corpse   : "./images/orc_zeppelin_corpse.png",
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
        sheep                 : "./images/animals_sheep.png",
        goldmine              : "./images/goldmine.png",
        building              : "./images/building.png",
        bar                   : "./images/bar.png",
        hand                  : "./images/hand.png",
        hand_down             : "./images/hand_down.png",
        hand_left             : "./images/hand_left.png",
        hand_right            : "./images/hand_right.png",
        hand_up               : "./images/hand_up.png",
        attack_hand1          : "./images/attack_hand1.png",
        attack_hand2          : "./images/attack_hand2.png",
        attack_cross          : "./images/attack_cross.png",
        winter_tileset        : "./images/winter_tileset.png",
        grass_tileset         : "./images/grass_tileset.png",
        desert_tileset        : "./images/desert_tileset.png",
        general_tileset       : "./images/general_tileset.png",
        hud_pic               : "./images/hud_pic.png",
        hud_pici              : "./images/hud_pici.png",
        hud_top               : "./images/hud_top.png",
        cross                 : "./images/cross.png",
        icons_red             : "./images/icons_red.png",
        icons_blue            : "./images/icons_blue.png",
        font                  : "./images/font.png",
        font_big              : "./images/font_big.png",
        bg                    : "./images/bg.jpg",
        bgl                   : "./images/bgl.jpg",
        logo                  : "./images/logo.png",
        veail                 : "./images/veail.png",
        settlers_frame_l      : "./images/settlers_frame_left.png",
        settlers_frame_r      : "./images/settlers_frame_right.png",
        settlers_frame_t      : "./images/settlers_frame_top.png",
        settlers_frame_b      : "./images/settlers_frame_bottom.png",
        cost_gold             : "./images/cost_gold.png",
        cost_lumber           : "./images/cost_lumber.png",
        cost_oil              : "./images/cost_oil.png",
        cost_food             : "./images/cost_food.png",
        outcome_defeat        : "./images/outcome_defeat.jpg",
        outcome_victory       : "./images/outcome_victory.jpg",
        map_o1                : "./images/map_o1.png",
        map_o2                : "./images/map_o2.png",
        map_o3                : "./images/map_o3.png",
        map_o4                : "./images/map_o4.png",
        map_h1                : "./images/map_h1.png",
        map_h2                : "./images/map_h2.png",
        map_m1                : "./images/map_m1.png"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

function preloadDone() {

    // human sprites
    g_sprites.human_frame           = new Sprite(g_images.human_frame);
    g_sprites.human_frame_t         = new Sprite(g_images.human_frame_t);
    g_sprites.human_frame_r         = new Sprite(g_images.human_frame_r);
    g_sprites.human_frame_b         = new Sprite(g_images.human_frame_b);
    g_sprites.human_button          = new Sprite(g_images.human_button);
    g_sprites.human_button_s        = new Sprite(g_images.human_button_s);
    g_sprites.human_hand            = new Sprite(g_images.human_hand);
    g_sprites.human_corpse          = new Sprite(g_images.human_corpse);
    g_sprites.human_peon            = new Sprite(g_images.human_peon);
    g_sprites.human_peon_gold       = new Sprite(g_images.human_peon_gold);
    g_sprites.human_peon_lumber     = new Sprite(g_images.human_peon_lumber);
    g_sprites.human_peon_attack     = new Sprite(g_images.human_peon_attack);
    g_sprites.human_peon_corpse     = new Sprite(g_images.human_peon_corpse);
    g_sprites.human_grunt           = new Sprite(g_images.human_grunt);
    g_sprites.human_grunt_attack    = new Sprite(g_images.human_grunt_attack);
    g_sprites.human_grunt_attack.vert = 4;
    g_sprites.human_grunt_corpse    = new Sprite(g_images.human_grunt_corpse);
    g_sprites.human_archer          = new Sprite(g_images.human_archer);
    g_sprites.human_archer_attack   = new Sprite(g_images.human_archer_attack);
    g_sprites.human_archer_attack.vert = 3;
    g_sprites.human_archer_corpse   = new Sprite(g_images.human_archer_corpse);
    g_sprites.human_zeppelin        = new Sprite(g_images.human_zeppelin);
    g_sprites.human_zeppelin.vert   = 2;
    g_sprites.human_zeppelin_corpse = new Sprite(g_images.human_zeppelin_corpse);
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
    g_sprites.orc_frame           = new Sprite(g_images.orc_frame);
    g_sprites.orc_frame_t         = new Sprite(g_images.orc_frame_t);
    g_sprites.orc_frame_r         = new Sprite(g_images.orc_frame_r);
    g_sprites.orc_frame_b         = new Sprite(g_images.orc_frame_b);
    g_sprites.orc_button          = new Sprite(g_images.orc_button);
    g_sprites.orc_button_s        = new Sprite(g_images.orc_button_s);
    g_sprites.orc_hand            = new Sprite(g_images.orc_hand);
    g_sprites.orc_corpse          = new Sprite(g_images.orc_corpse);
    g_sprites.orc_peon            = new Sprite(g_images.orc_peon);
    g_sprites.orc_peon_gold       = new Sprite(g_images.orc_peon_gold);
    g_sprites.orc_peon_lumber     = new Sprite(g_images.orc_peon_lumber);
    g_sprites.orc_peon_attack     = new Sprite(g_images.orc_peon_attack);
    g_sprites.orc_peon_corpse     = new Sprite(g_images.orc_peon_corpse);
    g_sprites.orc_grunt           = new Sprite(g_images.orc_grunt);
    g_sprites.orc_grunt_attack    = new Sprite(g_images.orc_grunt_attack);
    g_sprites.orc_grunt_attack.vert = 4;
    g_sprites.orc_grunt_corpse    = new Sprite(g_images.orc_grunt_corpse);
    g_sprites.orc_archer          = new Sprite(g_images.orc_archer);
    g_sprites.orc_archer_attack   = new Sprite(g_images.orc_archer_attack);
    g_sprites.orc_archer_attack.vert = 4;
    g_sprites.orc_archer_corpse   = new Sprite(g_images.orc_archer_corpse);
    g_sprites.orc_zeppelin        = new Sprite(g_images.orc_zeppelin);
    g_sprites.orc_zeppelin.vert   = 1;
    g_sprites.orc_zeppelin_corpse = new Sprite(g_images.orc_zeppelin_corpse);
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

    // unaligned sprites
    g_sprites.goldmine    = new Sprite(g_images.goldmine);
    g_sprites.building    = new Sprite(g_images.building);

    // general sprites
    g_sprites.bar              = new Sprite(g_images.bar);
    g_sprites.hand             = new Sprite(g_images.hand);
    g_sprites.hand_down        = new Sprite(g_images.hand_down);
    g_sprites.hand_left        = new Sprite(g_images.hand_left);
    g_sprites.hand_right       = new Sprite(g_images.hand_right);
    g_sprites.hand_up          = new Sprite(g_images.hand_up);
    g_sprites.attack_hand1     = new Sprite(g_images.attack_hand1);
    g_sprites.attack_hand2     = new Sprite(g_images.attack_hand2);
    g_sprites.attack_cross     = new Sprite(g_images.attack_cross);
    g_sprites.winter_tileset   = new Sprite(g_images.winter_tileset);
    g_sprites.grass_tileset    = new Sprite(g_images.grass_tileset);
    g_sprites.desert_tileset   = new Sprite(g_images.desert_tileset);
    g_sprites.general_tileset  = new Sprite(g_images.general_tileset);
    g_sprites.hud_pic          = new Sprite(g_images.hud_pic);
    g_sprites.hud_pici         = new Sprite(g_images.hud_pici);
    g_sprites.hud_top          = new Sprite(g_images.hud_top);
    g_sprites.cross            = new Sprite(g_images.cross);
    g_sprites.icons_red        = new Sprite(g_images.icons_red);
    g_sprites.icons_blue       = new Sprite(g_images.icons_blue);
    g_sprites.font             = new Sprite(g_images.font);
    g_sprites.font_big         = new Sprite(g_images.font_big);
    g_sprites.bg               = new Sprite(g_images.bg);
    g_sprites.bgl              = new Sprite(g_images.bgl);
    g_sprites.logo             = new Sprite(g_images.logo);
    g_sprites.veail            = new Sprite(g_images.veail);
    g_sprites.settlers_frame_l = new Sprite(g_images.settlers_frame_l);
    g_sprites.settlers_frame_r = new Sprite(g_images.settlers_frame_r);
    g_sprites.settlers_frame_t = new Sprite(g_images.settlers_frame_t);
    g_sprites.settlers_frame_b = new Sprite(g_images.settlers_frame_b);
    g_sprites.cost_gold        = new Sprite(g_images.cost_gold);
    g_sprites.cost_lumber      = new Sprite(g_images.cost_lumber);
    g_sprites.cost_oil         = new Sprite(g_images.cost_oil);
    g_sprites.cost_food        = new Sprite(g_images.cost_food);
    g_sprites.outcome_defeat   = new Sprite(g_images.outcome_defeat);
    g_sprites.outcome_victory  = new Sprite(g_images.outcome_victory);

    // maps
    g_sprites.map_o1           = new Sprite(g_images.map_o1);
    g_sprites.map_o2           = new Sprite(g_images.map_o2);
    g_sprites.map_o3           = new Sprite(g_images.map_o3);
    g_sprites.map_o4           = new Sprite(g_images.map_o4);
    g_sprites.map_h1           = new Sprite(g_images.map_h1);
    g_sprites.map_h2           = new Sprite(g_images.map_h2);
    g_sprites.map_m1           = new Sprite(g_images.map_m1);
    
    g_sprites.multiMaps = [g_sprites.map_m1];
    g_sprites.orcMaps = [g_sprites.map_o1, g_sprites.map_o2, g_sprites.map_o3, g_sprites.map_o4];
    g_sprites.humanMaps = [g_sprites.map_h1, g_sprites.map_h2];

    // We reset the player, even though we don't want to play right
    // now. We do this so that we can dropAll() in the entityManager
    // when we call gotoStartScreen() without causing errors.
    player.reset([]);
    screenManager.init();
    preloadEntityList();
    gotoStartScreen();

    main.init();
}

// Kick it off
requestPreloads();
