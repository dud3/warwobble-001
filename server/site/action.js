"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ==============================
// ACTIONS OF UNITS AND BUILDINGS
// ==============================
// 
// In here, the actions, their names as well as the locations
// of their icons are specified.

var action = {

onClickBuildCosts : function(entities, actionNo) {
    return entityList.costs[entities[0].race][this.actionToEntityType[actionNo]];
},

onClickBuildAction : function(entities, actionNo) {
    var ourcosts = this.onClickBuildCosts(entities, actionNo);
    
    if (player.me.gold < ourcosts[0]) {
        g_sprites.message("Not enough gold.", 2);
    } else if (player.me.lumber < ourcosts[1]) {
        g_sprites.message("Not enough lumber.", 2);
    } else if (player.me.oil < ourcosts[2]) {
        g_sprites.message("Not enough oil.", 2);
    } else {
        entityManager.nextPressAction = actionNo;
        entityManager.nextPressActionInNextFrame = actionNo;
    
        for (var i = 0; i < entities.length; i++) {
            sendCommand(entities[i].mid, {
                name: 'preptobuild',
                addInfo: actionNo
            }, entities[i].belongsTo);
        }
    }
},

onClickUpgradeAction : function(entities, actionNo) {
    var ourcosts = entityList.costs[entities[0].race][this.actionToEntityType[actionNo]];
    
    if (player.me.gold < ourcosts[0]) {
        g_sprites.message("Not enough gold.", 2);
    } else if (player.me.lumber < ourcosts[1]) {
        g_sprites.message("Not enough lumber.", 2);
    } else if (player.me.oil < ourcosts[2]) {
        g_sprites.message("Not enough oil.", 2);
    } else {
        for (var i = 0; i < entities.length; i++) {
            sendCommand(entities[i].mid, {
                name: 'upgrade',
                upgradeTo: this.actionToEntityType[actionNo]
            }, entities[i].belongsTo);
        }
    }
},

// the value -1 stands for "standard action" - that is,
// use the right mouse button to attack enemies, harvest
// lumber, walk to empty spaces, etc...

// magic numbers for X : 5, 61, 117
// magic numbers for Y : 336, 383, 430

move : { // 0
    iconX : 5,
    iconY : 336,
    name : "_M_OVE",
    onClick : function(entities) {
        entityManager.nextPressAction = 0;
        entityManager.nextPressActionInNextFrame = 0;
    },
    visible : function(entities) {
        return true;
    }
},

stop : { // 1
    iconX : 61,
    iconY : 336,
    name : "_S_TOP",
    onClick : function(entities) {
        for (var i = 0; i < entities.length; i++) {
            sendCommand(entities[i].mid, {
	        name: 'stop'
	    }, entities[i].belongsTo);
        }
    },
    visible : function(entities) {
        return true;
    }
},

attack : { // 2
    iconX : 117,
    iconY : 336,
    name : "_A_TTACK",
    onClick : function(entities) {
        entityManager.nextPressAction = 2;
        entityManager.nextPressActionInNextFrame = 2;
    },
    visible : function(entities) {
        return true;
    }
},

repair : { // 3
    iconX : 5,
    iconY : 383,
    name : "_R_EPAIR",
    onClick : function(entities) {
        g_sprites.message("Sorry: this action does not work yet.", 2);
    },
    visible : function(entities) {
        return true;
    }
},

harvest : { // 4
    iconX : 61,
    iconY : 383,
    name : "_H_ARVEST LUMBER/MINE GOLD",
    onClick : function(entities) {
        entityManager.nextPressAction = 4;
        entityManager.nextPressActionInNextFrame = 4;
    },
    // if some entities already have resources, then send
    // the goods back before harvesting some more
    visible : function(entities) {
        for (var i = 0; i < entities.length; i++) {
            if ((entities[i].harvestedGold > 0) ||
                (entities[i].harvestedLumber > 0) ||
                (entities[i].harvestedOil > 0)) {
                return false;
            }
        }
        
        return true;
    }
},

buildbasic : { // 5
    iconX : 5,
    iconY : 430,
    name : "BUILD _B_ASIC STRUCTURE",
    onClick : function(entities) {
        entityManager.actionPage = 1;
    },
    visible : function(entities) {
        // only visible if there is just one entity selected
        // later on we might let it pick out the closest
        // entity to do the building! =)
        return entities.length < 2;
    }
},

patrol : { // 6
    iconX : 5,
    iconY : 383,
    name : "_P_ATROL",
    onClick : function(entities) {
        g_sprites.message("Sorry: this action does not work yet.", 2);
    },
    visible : function(entities) {
        return true;
    }
},

defend : { // 7
    iconX : 61,
    iconY : 383,
    name : "S_T_AND GROUND",
    onClick : function(entities) {
        for (var i = 0; i < entities.length; i++) {
            sendCommand(entities[i].mid, {
	        name: 'standground'
	    }, entities[i].belongsTo);
        }
    },
    visible : function(entities) {
        return true;
    }
},

trainpeon : { // 8
    iconX : 5,
    iconY : 336,
    nameo : "TRAIN _P_EON",
    nameh : "TRAIN _P_EASANT",
    onClick : function(entities) {
        train(entities, entities[0].race, 0, 1 - entities[0].race);
    },
    visible : function(entities) {
        return true;
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 8);
    }
},

cancel : { // 9
    iconX : 117,
    iconY : 430,
    name : "_C_ANCEL",
    onClick : function(entities) {
        entityManager.nextPressAction = -1;
        entityManager.nextPressActionInNextFrame = -1;

        if ((entityManager._selarr.length > 0) &&
            (entityManager._selarr[0].isBuilding)) {
            entityManager._selarr[0].generateUnitCounter = -1;
        }
    },
    visible : function(entities) {
        return true;
    }
},

harvestreturn : { // 10
    iconX : 117,
    iconY : 383,
    name : "RETURN WITH _G_OODS",
    onClick : function(entities) {
        for (var i = 0; i < entities.length; i++) {
            sendCommand(entities[i].mid, {
	        name: 'harvestreturn'
	    }, player.myID);
        }
    },
    // only allow if all units have some resources to bring back
    visible : function(entities) {
        for (var i = 0; i < entities.length; i++) {
            if ((entities[i].harvestedGold === 0) &&
                (entities[i].harvestedLumber === 0) &&
                (entities[i].harvestedOil === 0)) {
                return false;
            }
        }
        
        return true;
    }
},

buildfarm : { // 11
    iconX : 5,
    iconY : 336,
    name : "BUILD _F_ARM",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 11);
    },
    visible : function(entities) {
        return true;
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 11);
    }
},

buildbarracks : { // 12
    iconX : 61,
    iconY : 336,
    name : "BUILD _B_ARRACKS",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 12);
    },
    visible : function(entities) {
        return true;
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 12);
    }
},

buildhall : { // 13
    iconX : 117,
    iconY : 336,
    name : "BUILD A GREAT _H_ALL",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 13);
    },
    visible : function(entities) {
        return true;
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 13);
    }
},

buildmill : { // 14
    iconX : 5,
    iconY : 383,
    name : "BUILD _L_UMBER MILL",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 14);
    },
    visible : function(entities) {
        return true;
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 14);
    }
},

buildsmith : { // 15
    iconX : 61,
    iconY : 383,
    name : "BUILD BLACK_S_MITH",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 15);
    },
    visible : function(entities) {
        return true;
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 15);
    }
},

buildtower : { // 16
    iconX : 5,
    iconY : 430,
    name : "BUILD _T_OWER",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 16);
    },
    visible : function(entities) {
        return true;
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 16);
    }
},

cancelbasicbuild : { // 17
    iconX : 117,
    iconY : 430,
    name : "_C_ANCEL",
    onClick : function(entities) {
        entityManager.actionPage = 0;
    },
    visible : function(entities) {
        return true;
    }
},

traingrunt : { // 18
    iconX : 5,
    iconY : 336,
    nameo : "TRAIN _G_RUNT",
    nameh : "TRAIN _F_OOTMAN",
    onClick : function(entities) {
        train(entities, entities[0].race, 1, 3 - entities[0].race);
    },
    visible : function(entities) {
        return true;
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 18);
    }
},

trainarcher : { // 19
    iconX : 61,
    iconY : 336,
    nameo : "TRAIN TROLL AXETHROWER",
    nameh : "TRAIN ELVEN ARCHER",
    onClick : function(entities) {
        train(entities, entities[0].race, 2, 5 - entities[0].race);
    },
    visible : function(entities) {
        return entityManager.playerHasEntityOfType(entities[0].belongsTo, 105);
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 19);
    }
},

buildshipyard : { // 20
    iconX : 5,
    iconY : 336,
    name : "BUILD SHIPYARD",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 20);
    },
    visible : function(entities) {
        return entityManager.playerHasEntityOfType(entities[0].belongsTo, 105);
    },
    getCosts : function(entities) {
        return false; // TODO :: the whole water stuff doesn't really work yet,
                      // and building on water etc.,
                      // so no shipyards! BÄM!
        return action.onClickBuildCosts(entities, 20);
    }
},

buildrefinery : { // 21
    iconX : 61,
    iconY : 336,
    name : "BUILD OIL REFINERY",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 21);
    },
    visible : function(entities) {
        return entityManager.playerHasEntityOfType(entities[0].belongsTo, 110);
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 21);
    }
},

buildfoundry : { // 22
    iconX : 117,
    iconY : 336,
    name : "BUILD FOUNDRY",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 22);
    },
    visible : function(entities) {
        return entityManager.playerHasEntityOfType(entities[0].belongsTo, 110);
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 22);
    }
},

buildstables : { // 23
    iconX : 5,
    iconY : 383,
    nameo : "BUILD OGRE MOUND",
    nameh : "BUILD STABLES",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 23);
    },
    visible : function(entities) {
        return entityManager.playerHasEntityOfType(entities[0].belongsTo, 101) ||
               entityManager.playerHasEntityOfType(entities[0].belongsTo, 102);
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 23);
    }
},

buildalchemist : { // 24
    iconX : 61,
    iconY : 383,
    nameo : "BUILD GOBLIN ALCHEMIST",
    nameh : "BUILD GNOMISH INVENTOR",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 24);
    },
    visible : function(entities) {
        return entityManager.playerHasEntityOfType(entities[0].belongsTo, 101) ||
               entityManager.playerHasEntityOfType(entities[0].belongsTo, 102);
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 24);
    }
},

buildroost : { // 25
    iconX : 117,
    iconY : 383,
    nameo : "BUILD DRAGON ROOST",
    nameh : "BUILD GRYPHON AVIARY",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 25);
    },
    visible : function(entities) {
        return entityManager.playerHasEntityOfType(entities[0].belongsTo, 102);
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 25);
    }
},

buildaltar : { // 26
    iconX : 5,
    iconY : 430,
    nameo : "BUILD ALTAR",
    nameh : "BUILD CHURCH",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 26);
    },
    visible : function(entities) {
        return entityManager.playerHasEntityOfType(entities[0].belongsTo, 102);
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 26);
    }
},

buildmagetower : { // 27
    iconX : 61,
    iconY : 430,
    nameo : "BUILD TEMPLE",
    nameh : "BUILD MAGE TOWER",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 27);
    },
    visible : function(entities) {
        return entityManager.playerHasEntityOfType(entities[0].belongsTo, 102);
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 27);
    }
},

upgradetostronghold : { // 28
    iconX : 5,
    iconY : 430,
    nameo : "UPGRADE TO STRONGHOLD",
    nameh : "UPGRADE TO KEEP",
    onClick : function(entities) {
        action.onClickUpgradeAction(entities, 28);
    },
    visible : function(entities) {
        return entityManager.playerHasEntityOfType(entities[0].belongsTo, 104); // barracks
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 28);
    }
},

upgradetofortress : { // 29
    iconX : 5,
    iconY : 430,
    nameo : "UPGRADE TO FORTRESS",
    nameh : "UPGRADE TO CASTLE",
    onClick : function(entities) {
        action.onClickUpgradeAction(entities, 29);
    },
    visible : function(entities) {
        return entityManager.playerHasEntityOfType(entities[0].belongsTo, 105) && // lumber mill
               entityManager.playerHasEntityOfType(entities[0].belongsTo, 109) && // ogre mound
               entityManager.playerHasEntityOfType(entities[0].belongsTo, 114); // blacksmith
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 29);
    }
},

upgradetoguardtower : { // 30
    iconX : 5,
    iconY : 430,
    name : "UPGRADE TO GUARD TOWER",
    onClick : function(entities) {
        action.onClickUpgradeAction(entities, 30);
    },
    visible : function(entities) {
        return entityManager.playerHasEntityOfType(entities[0].belongsTo, 105); // lumber mill
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 30);
    }
},

upgradetocannontower : { // 31
    iconX : 61,
    iconY : 430,
    name : "UPGRADE TO CANNON TOWER",
    onClick : function(entities) {
        action.onClickUpgradeAction(entities, 31);
    },
    visible : function(entities) {
        return entityManager.playerHasEntityOfType(entities[0].belongsTo, 109); // ogre mound
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 31);
    }
},

buildadvanced : { // 32
    iconX : 61,
    iconY : 430,
    name : "BUILD ADVANCED STRUCTURE",
    onClick : function(entities) {
        entityManager.actionPage = 2;
    },
    visible : function(entities) {
        return (entities.length < 2) &&
               (action.buildshipyard.visible(entities) ||
                action.buildrefinery.visible(entities) ||
                action.buildfoundry.visible(entities) ||
                action.buildstables.visible(entities) ||
                action.buildalchemist.visible(entities) ||
                action.buildroost.visible(entities) ||
                action.buildaltar.visible(entities) ||
                action.buildmagetower.visible(entities));
    }
},

buildoilrig : { // 33
    iconX : 5,
    iconY : 430,
    name  : "BUILD OIL RIG",
    onClick : function(entities) {
        action.onClickBuildAction(entities, 33);
    },
    visible : function(entities) {
        return true;
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 33);
    }
},

sheepmissile : { // 34 
    iconX : 117,
    iconY : 336,
    name : "_S_HEEP MISSILE",
    onClick : function(entities) {
        entityManager.nextPressAction = 34;
        entityManager.nextPressActionInNextFrame = 34;
    },
    visible : function(entities) {
        return true;
    }
},

trainzeppelin : { // 35
    iconX : 5,
    iconY : 336,
    nameo : "TRAIN GOBLIN ZEPPELIN PILOT",
    nameh : "TRAIN GNOMISH FLYING MACHINE PILOT",
    onClick : function(entities) {
        train(entities, entities[0].race, 7, 29 - entities[0].race);
    },
    visible : function(entities) {
        return true;
    },
    getCosts : function(entities) {
        return action.onClickBuildCosts(entities, 35);
    }
}

};
// an array of all the actions ordered by their index
action.fromNum = [action.move,
                  action.stop,
                  action.attack,
                  action.repair,
                  action.harvest,
                  action.buildbasic,
                  action.patrol,
                  action.defend,
                  action.trainpeon,
                  action.cancel,
                  action.harvestreturn,
                  action.buildfarm,
                  action.buildbarracks,
                  action.buildhall,
                  action.buildmill,
                  action.buildsmith,
                  action.buildtower,
                  action.cancelbasicbuild,
                  action.traingrunt,
                  action.trainarcher,
                  action.buildshipyard,
                  action.buildrefinery,
                  action.buildfoundry,
                  action.buildstables,
                  action.buildalchemist,
                  action.buildroost,
                  action.buildaltar,
                  action.buildmagetower,
                  action.upgradetostronghold,
                  action.upgradetofortress,
                  action.upgradetoguardtower,
                  action.upgradetocannontower,
                  action.buildadvanced,
                  action.buildoilrig,
                  action.sheepmissile,
                  action.trainzeppelin];

// an array containing true for each action that is
// on page one
// trailing false values should be left out, as the array
// is only checked until its length anyway
action.pageOne = [false,false,false,false,false,
                  false,false,false,false,false,
                  false,true, true, true, true,
                  true, true, true];

action.pageTwo = [false,false,false,false,false,
                  false,false,false,false,false,
                  false,false,false,false,false,
                  false,false, true,false,false,
                  true, true, true, true, true,
                  true, true, true];

action.actionToEntityType = [];
action.actionToEntityType[8] = 0;
action.actionToEntityType[11] = 103;
action.actionToEntityType[12] = 104;
action.actionToEntityType[13] = 100;
action.actionToEntityType[14] = 105;
action.actionToEntityType[15] = 109;
action.actionToEntityType[16] = 106;
action.actionToEntityType[18] = 1;
action.actionToEntityType[19] = 2;
action.actionToEntityType[20] = 110;
action.actionToEntityType[21] = 113;
action.actionToEntityType[22] = 112;
action.actionToEntityType[23] = 114;
action.actionToEntityType[24] = 115;
action.actionToEntityType[25] = 116;
action.actionToEntityType[26] = 118;
action.actionToEntityType[27] = 117;
action.actionToEntityType[28] = 101;
action.actionToEntityType[29] = 102;
action.actionToEntityType[30] = 107;
action.actionToEntityType[31] = 108;
action.actionToEntityType[33] = 111;

action.fromIcon = [];
action.fromIcon[0] = 8;
action.fromIcon[1] = 8;
action.fromIcon[2] = 18;
action.fromIcon[3] = 18;
action.fromIcon[4] = 19;
action.fromIcon[5] = 19;
action.fromIcon[28] = 35;
action.fromIcon[29] = 35;
action.fromIcon[38] = 11;
action.fromIcon[39] = 11;
action.fromIcon[40] = 13;
action.fromIcon[41] = 13;
action.fromIcon[42] = 12;
action.fromIcon[43] = 12;
action.fromIcon[44] = 14;
action.fromIcon[45] = 14;
action.fromIcon[46] = 15;
action.fromIcon[47] = 15;
action.fromIcon[48] = 20;
action.fromIcon[49] = 20;
action.fromIcon[50] = 21;
action.fromIcon[51] = 21;
action.fromIcon[52] = 22;
action.fromIcon[53] = 22;
action.fromIcon[54] = 33;
action.fromIcon[55] = 33;
action.fromIcon[56] = 23;
action.fromIcon[57] = 23;
action.fromIcon[58] = 24;
action.fromIcon[59] = 24;
action.fromIcon[60] = 16;
action.fromIcon[61] = 16;
action.fromIcon[62] = 26;
action.fromIcon[63] = 26;
action.fromIcon[64] = 27;
action.fromIcon[65] = 27;
action.fromIcon[66] = 28;
action.fromIcon[67] = 28;
action.fromIcon[70] = 29;
action.fromIcon[71] = 29;
action.fromIcon[72] = 25;
action.fromIcon[73] = 25;
action.fromIcon[76] = 30;
action.fromIcon[77] = 30;
action.fromIcon[78] = 31;
action.fromIcon[79] = 31;
action.fromIcon[83] = 0;
action.fromIcon[84] = 0;
action.fromIcon[85] = 3;
action.fromIcon[86] = 4;
action.fromIcon[87] = 5;
action.fromIcon[88] = 32;
action.fromIcon[89] = 10;
action.fromIcon[90] = 10;
action.fromIcon[91] = 9;
action.fromIcon[101] = 28;
action.fromIcon[102] = 29;
action.fromIcon[107] = 30;
action.fromIcon[108] = 31;
action.fromIcon[164] = 1;
action.fromIcon[167] = 1;
action.fromIcon[119] = 2;
action.fromIcon[170] = 6;
action.fromIcon[171] = 6;
action.fromIcon[172] = 7;
action.fromIcon[173] = 7;

// magic number - amount of actions ;)
action.amount = 36;
