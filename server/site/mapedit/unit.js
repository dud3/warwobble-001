"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ==========
// EVERY UNIT
// ==========
// 
// This file includes the construction of any unit, that is
// any moving entity. There is another kind of entity which
// is not covered here: A building. Units and buildings are
// rather distinct, so that this approach makes sense.
// 
// Examples for the usage of the unit-function can be found
// in preloadEntityList.js.

// Usage:
// unit(descr,
//      [
//           main sprite,
//           corpse sprite,
//           attack sprite,
//           gold carrying sprite,
//           lumber carrying sprite,
//           oil carrying sprite
//      ],
//      "name",
//      nr of the icon,
//      [maxhp, armor, damage_min, damage_max, range, sight, speed, magic],
//      g_sprite.icon_red or g_sprite.icon_blue,
//      [actions]
//      )
function unit(descr, image, name, icon, stats, color, ability){

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.sprite = image[0];
    this.sprite_normal = image[0];
    this.sprite_corpse = image[1];
    this.sprite_attack = image[2];
    this.sprite_gold = image[3];
    this.sprite_lumber = image[4];
    this.sprite_oil = image[5];
    this.name = name;
    this.icon = icon;
    this.maxhp = stats[0];
    this.armor = stats[1];
    this.damage_min = stats[2];
    this.damage_max = stats[3];
    if (stats[2] === stats[3]) {
        this.damage_str = "" + stats[2];
    } else {
        this.damage_str = stats[2] + "-" + stats[3];
    }
    this.range = stats[4];
    this.sight = stats[5];
    this.speed = stats[6];
    this.magic = stats[7];
    this.ics = color;
    this.isBuilding = false;
    this.width = 32 * entityList.sizes[this.race][this.type][0];
    this.height = 32 * entityList.sizes[this.race][this.type][1];
    this.needGold = entityList.costs[this.race][this.type][0];
    this.needLumber = entityList.costs[this.race][this.type][1];
    this.needOil = entityList.costs[this.race][this.type][2];
    this.needTime = entityList.costs[this.race][this.type][3];

    // These are the numbers of the icons of the unit's actions.
    this.action = ability;

    // Stuff from the common inherited setup logic that needs to be
    // executed later.
    this.setdown();
}

unit.prototype = new Entity();

unit.prototype.render = function (ctx) {
    // draw a rectangle around me if I am selected
    if (this.selected) {
        ctx.strokeStyle = "#00ff00";
        ctx.strokeRect(this.cx - world.camL*32 + 160.5,
                       this.cy - world.camT*32 + 0.5,
                       32, 32);
    }

    // pass my scale into the sprite for drawing
    this.sprite.scale = 1;

    this.sprite.drawCharAt(
        ctx, this.cx, this.cy - 2,
        this.orientation + this.curPoseA*8 - 8
    );
};
