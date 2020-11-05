// ==============
// MOUSE HANDLING
// ==============

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var mouse = {
    X: 0,
    Y: 0,
    tsX: 0,
    tsY: 0,
    icX: 0,
    icY: 0,
    pressed: false,
    _nextpressDown: false,
    pressDown: false,
    _nextpressUp: false,
    pressUp: false,
    _nextpressRight: false,
    pressRight: false,
    sprite: {},
    _button: 0,

    tileX: function() {
        return Math.max(0, Math.min(world.width - 1,
                        Math.floor((this.X - 176) / 32) + world.camL));
    },

    tileY: function() {
        return Math.max(0, Math.min(world.height - 1,
                        Math.floor((this.Y - 16) / 32) + world.camT));
    },

    wasPressed: function() {
        var oldpressed = this.pressed;
        this.pressed = false;
        return oldpressed;
    },
    
    clear: function() {
        this.pressed = false;
        this._nextpressDown = false;
        this.pressDown = false;
        this._nextpressUp = false;
        this.pressUp = false;
        this._nextpressRight = false;
        this.pressRight = false;
    },
    
    gather: function() {
        // We set the public values to the values collected throughout
        // the previous logical frame, so that the public values are guaranteed
        // to be constant throughout the next logical frame.

        this.pressDown = this._nextpressDown;
        this._nextpressDown = false;
        
        this.pressUp = this._nextpressUp;
        this._nextpressUp = false;
        
        this.pressRight = this._nextpressRight;
        this._nextpressRight = false;
    },
    
    bodyOffset: function(){
        if (!(window.pageYOffset === undefined)) {
            return [window.pageXOffset, window.pageYOffset];
        } else {
            var dE = document.documentElement;
            var dB = document.body;
            var offx = dE.scrollLeft || dB.scrollLeft || 0;
            var offy = dE.scrollTop || dB.scrollTop || 0;

            return [offx, offy];
        }
    },

    render: function(ctx) {
        this.sprite.drawAt(ctx, this.X - 2, this.Y);
    }
}

function handleMouseDown(evt) {
    if (mouse.icX > 0) {
        // magic numbers: 46x38 is the size of an icon, and there are 10 icons per row
        world.curEnt = 10 * Math.floor(mouse.icY / 38) + Math.floor(mouse.icX / 46);
        world.curCol = -1;
        
        if (entityList.iconToType[world.curEnt] === undefined) {
            world.curEnt = -1;
        }
    } else if (mouse.tsX > 0) {
        // magic numbers: 32x32 is the size of a tile, and there are 8 tiles per row
        world.curCol = 8 * Math.floor(mouse.tsY / 32) + Math.floor(mouse.tsX / 32);
        world.curEnt = -1;
    } else {
        mouse._button = evt.buttons === undefined ? evt.which : evt.buttons;
    
        if (mouse._button === 1) {
            mouse.pressed = true;
            mouse._nextpressDown = true;
        } else if (mouse._button > 1) {
            mouse._nextpressRight = true;
        }
    }
}

function handleMouseMove(evt) {
    var gS = mouse.bodyOffset();
    var mainX = evt.clientX + gS[0];
    var mainY = evt.clientY + gS[1];

    mouse.X = mainX;
    mouse.Y = mainY;

    mouse.tsX = mouse.X - 640;
    mouse.tsY = mouse.Y;
        
    if (screenManager.tsCanvasVisible) {
        mouse.icX = mouse.tsX - 256;
    } else {
        mouse.icX = mouse.X - 640;
    }
    mouse.icY = mouse.Y;
    
    if ((mouse.icX > 0) && mouse.pressed) {
        // magic numbers: 46x38 is the size of an icon, and there are 10 icons per row
        world.curEnt = 10 * Math.floor(mouse.icY / 38) + Math.floor(mouse.icX / 46);
        world.curCol = -1;
        
        if (entityList.iconToType[world.curEnt] === undefined) {
            world.curEnt = -1;
        }
    } else if ((mouse.tsX > 0) && mouse.pressed) {
        // magic numbers: 32x32 is the size of a tile, and there are 8 tiles per row
        world.curCol = 8 * Math.floor(mouse.tsY / 32) + Math.floor(mouse.tsX / 32);
        world.curEnt = -1;
    }
}

function handleMouseUp(evt) {
    if (mouse.pressed) {
        mouse._nextpressUp = true;
    }

    mouse.pressed = false;
}

window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mouseup", handleMouseUp);
