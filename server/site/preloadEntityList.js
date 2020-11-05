"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ===========
// ENTITY LIST
// ===========
// 
// The entity list is an array of arrays which themselves
// contain constructors for each entity that is used in
// the game.

var entityList = {
    constructors: [], // two-dimensional array
                      // first dimension race: 0 orc, 1 human, 2 general
                      // contains functions that return new entities
    costs: [], // two-dimensional array
               // contains arrays (so actually it is three-dimensional)
               // where the innermost array is built up as:
               // 0 .. gold cost
               // 1 .. lumber cost
               // 2 .. oil cost
               // 3 .. time "cost" (time it takes for creation of this entity)
    sizes: []  // two-dimensional array
               // contains arrays (so actually it is three-dimensional)
               // where the innermost array is built up as:
               // 0 .. width in tiles
               // 1 .. height in tiles
};

function preloadEntityList(){
    var red = g_sprites.icons_red,
        blue = g_sprites.icons_blue;

    var Orc = [];
    entityList.costs[0] = [];
    entityList.sizes[0] = [];
    
    // ==============================
    //  ORC UNITS
    // ==============================

    //   0: Peon
    Orc[0] = function(descr) {
        return new unit(descr, [g_sprites.orc_peon, g_sprites.orc_peon_corpse,
                        g_sprites.orc_peon_attack,
                        g_sprites.orc_peon_gold, g_sprites.orc_peon_lumber],
                        ["Peon"], 1,
                        [30, 0, 1, 5, 1, 4, 10, 0], red,
                        [84, 167, 119, 85, 86, 87, 88, 90], false);
    };
    entityList.costs[0][0] = [400, 0, 0, 45];

    //   1: Grunt
    Orc[1] = function(descr) {
        return new unit(descr, [g_sprites.orc_grunt, g_sprites.orc_grunt_corpse,
                        g_sprites.orc_grunt_attack], ["Grunt"], 3,
                        [60, 2, 2, 9, 1, 4, 10, 0], red,
                        [84, 167, 119, 171, 173], false);
    };
    entityList.costs[0][1] = [600, 0, 0, 60];

    //   2: Troll Axethrower
    Orc[2] = function(descr) {
        return new unit(descr, [g_sprites.orc_archer, g_sprites.orc_archer_corpse,
                        g_sprites.orc_archer_attack], ["Troll", "Axethrower"], 5,
                        [40, 0, 3, 9, 4, 5, 10, 0], red,
                        [84, 167, 119, 171, 173], false);
    };
    entityList.costs[0][2] = [500, 50, 0, 70];

    //   3: Ogre
    //   4: Catapult
    //   5: Goblin Sappers
    //   6: Death Knight

    //   7: Goblin Zeppelin
    Orc[7] = function(descr) {
        return new unit(descr, [g_sprites.orc_zeppelin, g_sprites.orc_zeppelin_corpse,
                        g_sprites.orc_zeppelin], ["Goblin", "Zeppelin"], 29,
                        [150, 0, 0, 0, 1, 9, 17, 0], red,
                        [84, 167], true);
    };
    entityList.costs[0][7] = [500, 100, 0, 65];
    
    //   8: Dragon
    //   9: Oil Tanker
    //  10: Transport
    //  11: Troll Destroyer
    //  12: Ogre Juggernaut
    //  13: Giant Turtle

    
    // ==============================
    //  ORC BUILDINGS
    // ==============================

    // 100: Great Hall
    Orc[100] = function(descr) {
        return new building(descr, g_sprites.orc_hall, ["Great Hall"], 41,
                            [1200, 3, 0], red,
                            [1, 101]);
    };
    entityList.sizes[0][100] = [4, 4];
    entityList.costs[0][100] = [1200, 800, 0, 100];

    // 101: Stronghold
    Orc[101] = function(descr) {
        return new building(descr, g_sprites.orc_stronghold, ["Stronghold"], 67,
                            [1400, 3, 0], red,
                            [1, 102]);
    };
    entityList.sizes[0][101] = [4, 4];
    entityList.costs[0][101] = [2000, 1000, 200, 30];

    // 102: Fortress
    Orc[102] = function(descr) {
        return new building(descr, g_sprites.orc_fortress, ["Fortress"], 71,
                            [1600, 3, 0], red,
                            [1]);
    };
    entityList.sizes[0][102] = [4, 4];
    entityList.costs[0][102] = [2500, 1200, 500, 30];

    // 103: Pig Farm
    Orc[103] = function(descr) {
        return new building(descr, g_sprites.orc_farm, ["Pig Farm"], 39,
                            [400, 2, 4], red,
                            []);
    };
    entityList.sizes[0][103] = [2, 2];
    entityList.costs[0][103] = [500, 250, 0, 60];

    // 104: Barracks
    Orc[104] = function(descr) {
        return new building(descr, g_sprites.orc_barracks, ["Barracks"], 43,
                            [800, 2, 0], red,
                            [3, 5]);
    };
    entityList.sizes[0][104] = [3, 3];
    entityList.costs[0][104] = [700, 400, 0, 80];

    // 105: Troll Lumber Mill
    Orc[105] = function(descr) {
        return new building(descr, g_sprites.orc_lumbermill, ["Troll", "Lumber Mill"], 45,
                            [600, 2, 0], red,
                            []);
    };
    entityList.sizes[0][105] = [3, 3];
    entityList.costs[0][105] = [600, 450, 0, 70];

    // 106: Watch Tower
    Orc[106] = function(descr) {
        return new building(descr, g_sprites.orc_tower, ["Watch Tower"], 61,
                            [100, 9, 0], red,
                            [107, 108]);
    };
    entityList.sizes[0][106] = [2, 2];
    entityList.costs[0][106] = [550, 150, 0, 40];

    // 107: Guard Tower :: should shoot arrows, also at flying targets!
    Orc[107] = function(descr) {
        return new building(descr, g_sprites.orc_tower_extra, ["Guard Tower"], 77,
                            [100, 9, 0], red,
                            []);
    };
    entityList.sizes[0][107] = [2, 2];
    entityList.costs[0][107] = [550, 150, 0, 30];

    // 108: Cannon Tower :: should shoot cannon balls, but only at ground units!
    //                      (plus collateral damage)
    Orc[108] = function(descr) {
        return new building(descr, g_sprites.orc_tower_cannon, ["Cannon Tower"], 79,
                            [100, 9, 0], red,
                            []);
    };
    entityList.sizes[0][108] = [2, 2];
    entityList.costs[0][108] = [550, 150, 0, 30];

    // 109: Blacksmith
    Orc[109] = function(descr) {
        return new building(descr, g_sprites.orc_smith, ["Blacksmith"], 47,
                            [775, 2, 0], red,
                            []);
    };
    entityList.sizes[0][109] = [3, 3];
    entityList.costs[0][109] = [800, 450, 100, 75];

    // 110: Shipyard
    Orc[110] = function(descr) {
        return new building(descr, g_sprites.orc_shipyard, ["Shipyard"], 49,
                            [1100, 2, 0], red,
                            []);
    };
    entityList.sizes[0][110] = [3, 3];
    entityList.costs[0][110] = [800, 450, 0, 75];

    // 111: Oil Rig
    Orc[111] = function(descr) {
        return new building(descr, g_sprites.orc_oilrig, ["Oil Rig"], 55,
                            [650, 2, 0], red,
                            []);
    };
    entityList.sizes[0][111] = [3, 3];
    entityList.costs[0][111] = [700, 450, 0, 50];

    // 112: Foundry
    Orc[112] = function(descr) {
        return new building(descr, g_sprites.orc_foundry, ["Foundry"], 53,
                            [750, 2, 0], red,
                            []);
    };
    entityList.sizes[0][112] = [3, 3];
    entityList.costs[0][112] = [700, 400, 400, 65];
 
    // 113: Oil Refinery
    Orc[113] = function(descr) {
        return new building(descr, g_sprites.orc_refinery, ["Oil Refinery"], 51,
                            [600, 2, 0], red,
                            []);
    };
    entityList.sizes[0][113] = [3, 3];
    entityList.costs[0][113] = [800, 350, 200, 60];

    // 114: Ogre Mound
    Orc[114] = function(descr) {
        return new building(descr, g_sprites.orc_stables, ["Ogre Mound"], 57,
                            [500, 2, 0], red,
                            []);
    };
    entityList.sizes[0][114] = [3, 3];
    entityList.costs[0][114] = [1000, 300, 0, 65];

    // 115: Goblin Alchemist
    Orc[115] = function(descr) {
        return new building(descr, g_sprites.orc_alchemist, ["Goblin", "Alchemist"], 59,
                            [500, 2, 0], red,
                            [29]);
    };
    entityList.sizes[0][115] = [3, 3];
    entityList.costs[0][115] = [1000, 400, 0, 56];

    // 116: Dragon Roost
    Orc[116] = function(descr) {
        return new building(descr, g_sprites.orc_roost, ["Dragon Roost"], 73,
                            [500, 2, 0], red,
                            []);
    };
    entityList.sizes[0][116] = [3, 3];
    entityList.costs[0][116] = [1000, 400, 0, 70];

    // 117: Temple of the Damned
    Orc[117] = function(descr) {
        return new building(descr, g_sprites.orc_temple, ["Temple", "of the Damned"], 65,
                            [500, 2, 0], red,
                            []);
    };
    entityList.sizes[0][117] = [3, 3];
    entityList.costs[0][117] = [1000, 200, 0, 62];

    // 118: Altar of Storms
    Orc[118] = function(descr) {
        return new building(descr, g_sprites.orc_altar, ["Altar", "of Storms"], 63,
                            [700, 2, 0], red,
                            []);
    };
    entityList.sizes[0][118] = [3, 3];
    entityList.costs[0][118] = [900, 500, 0, 57];
    
    
    var Human = [];
    entityList.costs[1] = [];
    entityList.sizes[1] = [];

    // ==============================
    //  HUMAN UNITS
    // ==============================

    //   0: Peasant
    Human[0] = function(descr) {
        return new unit(descr, [g_sprites.human_peon, g_sprites.human_peon_corpse,
                        g_sprites.human_peon_attack,
                        g_sprites.human_peon_gold, g_sprites.human_peon_lumber],
                        ["Peasant"], 0,
                        [30, 0, 1, 5, 1, 4, 10, 0], blue,
                        [83, 164, 119, 85, 86, 87, 88, 89], false);
    };
    entityList.costs[1][0] = [400, 0, 0, 45];

    //   1: Footman
    Human[1] = function(descr) {
        return new unit(descr, [g_sprites.human_grunt, g_sprites.human_grunt_corpse,
                        g_sprites.human_grunt_attack], ["Footman"], 2,
                        [60, 2, 2, 9, 1, 4, 10, 0], blue,
                        [83, 164, 119, 170, 172], false);
    };
    entityList.costs[1][1] = [600, 0, 0, 60];

    //   2: Elven Archer
    Human[2] = function(descr) {
        return new unit(descr, [g_sprites.human_archer, g_sprites.human_archer_corpse,
                        g_sprites.human_archer_attack], ["Elven Archer"], 4,
                        [40, 0, 3, 9, 4, 5, 10, 0], red,
                        [84, 167, 119, 171, 173], false);
    };
    entityList.costs[1][2] = [500, 50, 0, 70];

    //   3: Knight
    //   4: Ballista
    //   5: Dwarven Demolition Squad
    //   6: Mage

    //   7: Gnomish Flying Machine
    Human[7] = function(descr) {
        return new unit(descr, [g_sprites.human_zeppelin, g_sprites.human_zeppelin_corpse,
                        g_sprites.human_zeppelin], ["Gnomish", "Flying Machine"], 28,
                        [150, 0, 0, 0, 1, 9, 17, 0], blue,
                        [84, 167], true);
    };
    entityList.costs[1][7] = [500, 100, 0, 65];

    //   8: Gryphon Rider
    //   9: Oil Tanker
    //  10: Transport
    //  11: Elven Destroyer
    //  12: Battleship
    //  13: Gnomish Submarine


    // 50: sheep missile
    Human[50] = function(descr) {
        return new unit(descr, [g_sprites.animal_sheep, g_sprites.animal_sheep,
                        g_sprites.animal_sheep], ["Sheep Missile"], 28,
                        [150, 0, 0, 0, 1, 9, 17, 0], blue,
                        [], true);
    };
	
    // ==============================
    //  HUMAN BUILDINGS
    // ==============================

    // 100: Town Hall
    Human[100] = function(descr) {
        return new building(descr, g_sprites.human_hall, ["Town Hall"], 40,
                            [1200, 3, 0], blue,
                            [0, 101]);
    };
    entityList.sizes[1][100] = [4, 4];
    entityList.costs[1][100] = [1200, 800, 0, 60];

    // 101: Keep
    Human[101] = function(descr) {
        return new building(descr, g_sprites.human_stronghold, ["Keep"], 66,
                            [1400, 3, 0], blue,
                            [0, 102]);
    };
    entityList.sizes[1][101] = [4, 4];
    entityList.costs[1][101] = [2000, 1000, 200, 30];

    // 102: Castle
    Human[102] = function(descr) {
        return new building(descr, g_sprites.human_fortress, ["Castle"], 70,
                            [1600, 3, 0], blue,
                            [0]);
    };
    entityList.sizes[1][102] = [4, 4];
    entityList.costs[1][102] = [2500, 1200, 500, 30];

    // 103: Chicken Farm
    Human[103] = function(descr) {
        return new building(descr, g_sprites.human_farm, ["Chicken Farm"], 38,
                            [400, 2, 4], blue,
                            []);
    };
    entityList.sizes[1][103] = [2, 2];
    entityList.costs[1][103] = [500, 250, 0, 45];

    // 104: Barracks
    Human[104] = function(descr) {
        return new building(descr, g_sprites.human_barracks, ["Barracks"], 42,
                            [800, 2, 0], blue,
                            [2, 4]);
    };
    entityList.sizes[1][104] = [3, 3];
    entityList.costs[1][104] = [700, 400, 0, 50];

    // 105: Elven Lumber Mill
    Human[105] = function(descr) {
        return new building(descr, g_sprites.human_lumbermill, ["Elven", "Lumber Mill"], 44,
                            [600, 2, 0], blue,
                            []);
    };
    entityList.sizes[1][105] = [3, 3];
    entityList.costs[1][105] = [600, 450, 0, 70];

    // 106: Scout Tower
    Human[106] = function(descr) {
        return new building(descr, g_sprites.human_tower, ["Scout Tower"], 60,
                            [100, 9, 0], blue,
                            [107, 108]);
    };
    entityList.sizes[1][106] = [2, 2];
    entityList.costs[1][106] = [550, 150, 0, 40];

    // 107: Guard Tower :: should shoot arrows, also at flying targets!
    Human[107] = function(descr) {
        return new building(descr, g_sprites.human_tower_extra, ["Guard Tower"], 76,
                            [100, 9, 0], red,
                            []);
    };
    entityList.sizes[1][107] = [2, 2];
    entityList.costs[1][107] = [550, 150, 0, 30];

    // 108: Cannon Tower :: should shoot cannon balls, but only at ground units!
    //                      (plus collateral damage)
    Human[108] = function(descr) {
        return new building(descr, g_sprites.human_tower_cannon, ["Cannon Tower"], 78,
                            [100, 9, 0], red,
                            []);
    };
    entityList.sizes[1][108] = [2, 2];
    entityList.costs[1][108] = [550, 150, 0, 30];

    // 109: Blacksmith
    Human[109] = function(descr) {
        return new building(descr, g_sprites.human_smith, ["Blacksmith"], 46,
                            [775, 2, 0], blue,
                            []);
    };
    entityList.sizes[1][109] = [3, 3];
    entityList.costs[1][109] = [800, 450, 100, 75];

    // 110: Shipyard
    Human[110] = function(descr) {
        return new building(descr, g_sprites.human_shipyard, ["Shipyard"], 48,
                            [1100, 2, 0], blue,
                            []);
    };
    entityList.sizes[1][110] = [3, 3];
    entityList.costs[1][110] = [800, 450, 0, 75];

    // 111: Oil Rig
    Human[111] = function(descr) {
        return new building(descr, g_sprites.human_oilrig, ["Oil Rig"], 54,
                            [650, 2, 0], blue,
                            []);
    };
    entityList.sizes[1][111] = [3, 3];
    entityList.costs[1][111] = [700, 450, 0, 50];

    // 112: Foundry
    Human[112] = function(descr) {
        return new building(descr, g_sprites.human_foundry, ["Foundry"], 52,
                            [750, 2, 0], blue,
                            []);
    };
    entityList.sizes[1][112] = [3, 3];
    entityList.costs[1][112] = [700, 400, 400, 65];

    // 113: Oil Refinery
    Human[113] = function(descr) {
        return new building(descr, g_sprites.human_refinery, ["Oil Refinery"], 50,
                            [600, 2, 0], blue,
                            []);
    };
    entityList.sizes[1][113] = [3, 3];
    entityList.costs[1][113] = [800, 350, 200, 60];

    // 114: Stables
    Human[114] = function(descr) {
        return new building(descr, g_sprites.human_stables, ["Stables"], 56,
                            [500, 2, 0], blue,
                            []);
    };
    entityList.sizes[1][114] = [3, 3];
    entityList.costs[1][114] = [1000, 300, 0, 65];

    // 115: Gnomish Inventor
    Human[115] = function(descr) {
        return new building(descr, g_sprites.human_alchemist, ["Gnomish", "Inventor"], 58,
                            [500, 2, 0], blue,
                            [28]);
    };
    entityList.sizes[1][115] = [3, 3];
    entityList.costs[1][115] = [1000, 400, 0, 56];

    // 116: Gryphon Aviary
    Human[116] = function(descr) {
        return new building(descr, g_sprites.human_roost, ["Gryphon Aviary"], 72,
                            [500, 2, 0], blue,
                            []);
    };
    entityList.sizes[1][116] = [3, 3];
    entityList.costs[1][116] = [1000, 400, 0, 70];

    // 117: Mage Tower
    Human[117] = function(descr) {
        return new building(descr, g_sprites.human_temple, ["Mage Tower"], 64,
                            [500, 2, 0], blue,
                            []);
    };
    entityList.sizes[1][117] = [3, 3];
    entityList.costs[1][117] = [1000, 200, 0, 62];

    // 118: Church
    Human[118] = function(descr) {
        return new building(descr, g_sprites.human_altar, ["Church"], 62,
                            [700, 2, 0], blue,
                            []);
    };
    entityList.sizes[1][118] = [3, 3];
    entityList.costs[1][118] = [900, 500, 0, 57];

	
	
	
    
    var General = [];
    entityList.costs[2] = [];
    entityList.sizes[2] = [];
    
    // ==============================
    //  GENERAL BUILDINGS
    // ==============================

    // 50: Sheep
    General[50] = function(descr) {
        return new unit(descr, [g_sprites.animal_sheep, g_sprites.animal_sheep,
                        g_sprites.animal_sheep], ["Sheep"], 2,
                        [10, 0, 0, 0, 0, 0, 8, 0], red,
                        [], false);
    };
    entityList.costs[2][50] = [600, 0, 0, 60];
	
    // 200: Goldmine
    General[200] = function(descr) {
        return new building(descr, g_sprites.goldmine, ["Gold Mine"], 74,
                            [25500, 3, 0, 0, 0, 0], red,
                            []);
    };
    entityList.sizes[2][200] = [3, 3];
    entityList.costs[2][200] = [0, 0, 0, 0];
    
    // all units have size 1x1
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 100; j++) {
            entityList.sizes[i][j] = [1, 1];
        }
    }
    
    entityList.constructors[0] = Orc;
    entityList.constructors[1] = Human;
    entityList.constructors[2] = General;
}