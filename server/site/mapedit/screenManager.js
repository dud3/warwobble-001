/*

screenManager.js

A module which handles screen-management for WarWobble.
This includes the start screen as well as the overlayed framework
that is visible throughout the game.


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops 
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/


var screenManager = {

buttons: [],
tsCanvasVisible: true,
icCanvasVisible: true,

minimap: {
    pressed: false
},

reVisibilize: function() {

  if (this.tsCanvasVisible) {
      g_tscanvas.style.display = "inline";
      g_iccanvas.style.left = "896px";
  } else {
      g_tscanvas.style.display = "none";
      g_iccanvas.style.left = "640px";
  }

  if (this.icCanvasVisible) {
      g_iccanvas.style.display = "inline";
  } else {
      g_iccanvas.style.display = "none";
  }

},

// this function contains everything that is common during the update
// phase for the human and orc frame
commonupdate: function(du) {
    if (mouse.pressDown) {
        if ((mouse.X > 23) && (mouse.Y > 25) &&
            (mouse.X < 152) && (mouse.Y < 154)) {
            this.minimap.pressed = true;
        }
    }

    if (mouse.pressed) {
        if (this.minimap.pressed &&
           (mouse.X > 23) && (mouse.Y > 25) &&
           (mouse.X < 152) && (mouse.Y < 154)) {
            world.camL = util.min(world.width - 14,
                         util.max(0,
                         Math.floor(world.width * (mouse.X - 24) / 127) - 7));
            world.camT = util.min(world.height - 14,
                         util.max(0,
                         Math.floor(world.height * (mouse.Y - 26) / 127) - 7));
            world.camR = world.camL + 14;
            world.camB = world.camT + 14;
        }
    }

    if (mouse.pressUp) {
        this.minimap.pressed = false;
    }

},

orcFrame: {
    visible : false,

    update: function(du) {
        screenManager.commonupdate(du);
    }
},

init: function() {
    this.orcFrame.sprite = g_sprites.orc_frame;
    
    this.buttons.push(new button({
        caption: "_H_elp",
        left: 24,
        top: 2,
        width: 128,
        height: 20,
        race: 0,
        preRendered: false
    }));

    this.buttons[this.buttons.length - 1].onClick = function() {
        MAPEDIT.showHelp();
    };
    
    this.buttons.push(new button({
        caption: "_L_oad Map",
        left: 24,
        top: 158,
        width: 128,
        height: 20,
        race: 0,
        preRendered: false
    }));

    this.buttons[this.buttons.length - 1].onClick = function() {
        world.loadMap();
    };
    
    this.buttons.push(new button({
        caption: "_S_ave Map",
        left: 24,
        top: 182,
        width: 128,
        height: 20,
        race: 0,
        preRendered: false
    }));

    this.buttons[this.buttons.length - 1].onClick = function() {
        world.saveMap();
    };
    
    this.buttons.push(new button({
        caption: "Toggle Arrows",
        left: 24,
        top: 206,
        width: 128,
        height: 20,
        race: 0,
        preRendered: false
    }));

    this.buttons[this.buttons.length - 1].onClick = function() {
        MAPEDIT.toggleKeyHook();
    };
    
    this.buttons.push(new button({
        caption: "Random Map",
        left: 24,
        top: 230,
        width: 128,
        height: 20,
        race: 0,
        preRendered: false
    }));

    this.buttons[this.buttons.length - 1].onClick = function() {
        MAPEDIT.randomizeMap();
    };
    
    this.buttons.push(new button({
        caption: "Change Dim.",
        left: 24,
        top: 254,
        width: 128,
        height: 20,
        race: 0,
        preRendered: false
    }));

    this.buttons[this.buttons.length - 1].onClick = function() {
        world.width += 32;
        
        if (world.width > 196) {
            world.width = 32;
        }
        
        world.reset(world.width, world.width);
    };
    
    this.buttons.push(new button({
        caption: "Change Env.",
        left: 24,
        top: 278,
        width: 128,
        height: 20,
        race: 0,
        preRendered: false
    }));

    this.buttons[this.buttons.length - 1].onClick = function() {
        world.isDesert += 1;
        
        if (world.isDesert > 2) {
            world.isDesert = 0;
        }
        
        if (world.isDesert === 0) {
            MAPEDIT.setGrass();
        } else if (world.isDesert === 1) {
            MAPEDIT.setWinter();
        } else {
            MAPEDIT.setDesert();
        }
    };
    
    this.buttons.push(new button({
        caption: "Toggle Tiles",
        left: 24,
        top: 302,
        width: 128,
        height: 20,
        race: 0,
        preRendered: false
    }));

    this.buttons[this.buttons.length - 1].onClick = function() {
        screenManager.tsCanvasVisible = !screenManager.tsCanvasVisible;
        screenManager.reVisibilize();
    };
    
    this.buttons.push(new button({
        caption: "Toggle Icons",
        left: 24,
        top: 326,
        width: 128,
        height: 20,
        race: 0,
        preRendered: false
    }));

    this.buttons[this.buttons.length - 1].onClick = function() {
        screenManager.icCanvasVisible = !screenManager.icCanvasVisible;
        screenManager.reVisibilize();
    };
},

update: function(du) {

    this.orcFrame.update(du);
    
    for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].update();
    }

},

render: function(ctx) {

    this.orcFrame.sprite.drawAt(ctx, 0, 0);
    
    for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].render(ctx);
    }
}

}
