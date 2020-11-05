"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ==============================
// ACTIONS OF UNITS AND BUILDINGS
// ==============================
// 
// In here, the actions, their names as well as the locations
// of their icons are specified.

var action = {

onClickBuildAction : function(entities, actionNo) {
    var ourcosts = entityList.costs[entities[0].race][this.actionToEntityType[actionNo]];
    
    if (player.me.gold < ourcosts[0]) {
        g_sprites.message("Not enough gold.", 2);
    } else if (player.me.gold < ourcosts[1]) {
        g_sprites.message("Not enough lumber.", 2);
    } else if (player.me.gold < ourcosts[2]) {
        g_sprites.message("Not enough oil.", 2);
    } else {
        entityManager.nextPressAction = actionNo;
        entityManager.nextPressActionInNextFrame = actionNo;
    
        for (var i = 0; i < entities.length; i++) {
            sendCommand(entities[i].id, {
                name: 'preptobuild',
                addInfo: actionNo
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
            sendCommand(entities[i].id, {
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
            sendCommand(entities[i].id, {
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
            sendCommand(entities[i].id, {
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
                  action.traingrunt];

// an array containing true for each action that is
// on page one
// trailing false values should be left out, as the array
// is only checked until its length anyway
action.pageOne = [false,false,false,false,false,
                  false,false,false,false,false,
                  false,true, true, true, false,
                  false,false,true];

action.actionToEntityType = [];
action.actionToEntityType[11] = 103;
action.actionToEntityType[12] = 104;
action.actionToEntityType[13] = 100;
action.actionToEntityType[14] = 105;
action.actionToEntityType[15] = 109;
action.actionToEntityType[16] = 106;

action.fromIcon = [];
action.fromIcon[0] = 8;
action.fromIcon[1] = 8;
action.fromIcon[2] = 18;
action.fromIcon[3] = 18;
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
action.fromIcon[60] = 16;
action.fromIcon[61] = 16;
action.fromIcon[83] = 0;
action.fromIcon[84] = 0;
action.fromIcon[85] = 3;
action.fromIcon[86] = 4;
action.fromIcon[87] = 5;
action.fromIcon[89] = 10;
action.fromIcon[90] = 10;
action.fromIcon[91] = 9;
action.fromIcon[164] = 1;
action.fromIcon[167] = 1;
action.fromIcon[119] = 2;
action.fromIcon[170] = 6;
action.fromIcon[171] = 6;
action.fromIcon[172] = 7;
action.fromIcon[173] = 7;

// magic number - amount of actions ;)
action.amount = 19;
