"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ==============
// EVERY BUILDING
// ==============
// 
// This file includes the construction of any building, that is
// any non-moving entity. There is another kind of entity which
// is not covered here: A unit. Units and buildings are
// rather distinct, so that this approach makes sense.
// 
// Examples for the usage of the building-function can be found
// in preloadEntityList.js.

// Usage:
// building(descr,
//          image,
//          "name",
//          nr of the icon,
//          [maxhp, sight, incfood],
//          g_sprite.icon_red or g_sprite.icon_blue,
//          [actions]
//         )
function building(descr, image, name, icon, stats, color, ability){
	
    // Common inherited setup logic from Entity
    this.setup(descr);

    this.sprite = image;
    this.name = name;
    this.icon = icon;
    this.maxhp = stats[0];
    this.armor = 0;
    this.sight = stats[1];
    this.incFood = stats[2];
    this.ics = color;
    this.isBuilding = true,
    this.width = 32 * entityList.sizes[this.race][this.type][0];
    this.height = 32 * entityList.sizes[this.race][this.type][1];
    this.needGold = entityList.costs[this.race][this.type][0];
    this.needLumber = entityList.costs[this.race][this.type][1];
    this.needOil = entityList.costs[this.race][this.type][2];
    this.needTime = entityList.costs[this.race][this.type][3];
    
    // this is the highest sprite that the building so far showed:
    // 1 .. small construction site
    // 2 .. big construction site
    // 3 .. own building sprite
    // 4 .. fully functional non-building sprite
    // therefore, whenever a building is created by a worker,
    // this value should after the creation be set to 1
    this.highestSprite = 4;
    
    // If there is no value given, assume 0.
    this.goldLeft = this.goldLeft || 0;

    // These are the numbers of the icons of the unit's actions.
    this.action = ability;
    
    // This could be a gold mine, or someone could be building it -
    // either way, a peon will be inside!
    this.peonsInside = 0;

    this.generateUnit = {};
    this.generateUnitCounterMax = 10;
    // How far in the creation have we come? (Start high, go then low.)
    this.generateUnitCounter = -1;
    this.generateUnitIcon = 0;

    // Stuff from the common inherited setup logic that needs to be
    // executed later.
    this.setdown();
}

building.prototype = new Entity();

building.prototype.update = function (du) {
    if (this._isDeadNow || (this.hp <= 0)) {
        this.hp = 0; // just in case this is drawn somewhere as health bar,
                     // we don't want it to go on to the negative side =)
        return entityManager.KILL_ME_NOW;
    }

    if (this.generateUnitCounter > 0) {
        this.generateUnitCounter -= du * 0.1;
        
        if (this.generateUnitCounter <= 0) {
            this.generateUnitCounter = -1;
            
            var curEnt = entityManager.generateUnit(
                              this.generateUnit, this.belongsTo);
        
            // if we are the great hall, then we want the new guys to
            // walk straight out the front door
            if ((this.type > 99) && (this.type < 104)) {
                curEnt.targetX = (curEnt.tileX + 2) * 32 + 16;
                curEnt.targetY = (curEnt.tileY + 2) * 32 + 16;
                curEnt.curAction = 0;
            }

            g_sprites.message("A " + curEnt.name + " was trained.",
                              screenManager.fontcolor);
        }
    };
};

building.prototype.render = function (ctx) {

    // draw a rectangle around me if I am selected
    if (this.selected) {
        if (this.hp > this.maxhp * 2/3) {
            ctx.strokeStyle = "#00ff00";
        } else if (this.hp > this.maxhp / 3) {
            ctx.strokeStyle = "#ffff00";
        } else {
            ctx.strokeStyle = "#ff0000";
        }
        ctx.strokeRect(Math.floor(this.cx) - world.camL*32 + 176.5 - this.width/2,
                       Math.floor(this.cy) - world.camT*32 + 16.5 - this.height/2,
                       this.width, this.height);
    }

    // if we are being built, and so small so far that we
    // really are nothing more than a construction site
    if (this.highestSprite < 3) {
        g_sprites.drawConstructionSiteAt(ctx, this.cx, this.cy, this.highestSprite);
    } else {
        var row = 0;
        
        // if we are a gold mine and someone is inside or
        // if we are being built and nearly finished
        if (((this.type === 200) && (this.peonsInside > 0)) ||
            (this.highestSprite === 3)) {
            row = 1;
        }
    
        this.sprite.drawBuildingAt(ctx, this.cx - this.width/2, this.cy - this.height/2,
                                   this.width, this.height, row);
    }
};

building.prototype.renderCorpse = function (ctx) {
    // nothing yet, but that'll change =)
};
