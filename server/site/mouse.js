"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ==============
// MOUSE HANDLING
// ==============
// 
// The mouse object keeps track of the mouse actions throughout
// an entire frame, and then offers the data that was collected
// throughout the following frame.
// In doing so, the mouse object actually hooks up to two different
// frame systems: Both the animation-frame-system for the actual
// animation on the client's machine, as well as the interval-based
// logic frames.
// Also, it is safe to assume that in a game like WarWobble there
// will almost always be mouse movement going on. Therefore, the
// current state of the system keys is also read out here, and
// publicly offered to the rest of the program.

var mouse = {
    X: 0, // current X
    Y: 0, // current Y
    dX: -1, // X when left mousebutton was last pressed down
    dY: -1, // Y when left mousebutton was last pressed down
    pressed: false,
    _nextpressDown: false,
    pressDown: false,
    _nextpressUp: false,
    pressUp: false,
    _nextpressRight: false,
    pressRight: false,
    pressedInterval: false,
    _nextpressDownInterval: false,
    pressDownInterval: false,
    _nextpressUpInterval: false,
    pressUpInterval: false,
    _nextpressRightInterval: false,
    pressRightInterval: false,
    sprite: {},
    _button: 0,

    // We do a few sanity checks to see whether the new click is
    // actually in the playfield - if not, we use the coordinates
    // mostly closely resembling the requested ones.
    // Actually, we should always have valid targets, but there
    // might be some smallish off-by-1-errors or other nastiness,
    // so let's just check it anyway.

    tileX: function() {
        return Math.max(0, Math.min(world.width - 1,
                        Math.floor((this.X - 176) / 32) + world.camL));
    },

    tileY: function() {
        return Math.max(0, Math.min(world.height - 1,
                        Math.floor((this.Y - 16) / 32) + world.camT));
    },
    
    mapPixelX: function() {
        return this.X + world.camL * 32 - 176;
    },

    mapPixelY: function() {
        return this.Y + world.camT * 32 - 16;
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
        this.pressedInterval = false;
        this._nextpressDownInterval = false;
        this.pressDownInterval = false;
        this._nextpressUpInterval = false;
        this.pressUpInterval = false;
        this._nextpressRightInterval = false;
        this.pressRightInterval = false;
        this.dX = -1;
        this.dY = -1;
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
    
    gatherInterval: function() {
        // We set the public values to the values collected throughout
        // the previous logical frame, so that the public values are guaranteed
        // to be constant throughout the next logical frame.

        this.pressDownInterval = this._nextpressDownInterval;
        this._nextpressDownInterval = false;
        
        this.pressUpInterval = this._nextpressUpInterval;
        this._nextpressUpInterval = false;
        
        this.pressRightInterval = this._nextpressRightInterval;
        this._nextpressRightInterval = false;
    },
    
    render: function(ctx) {
        this.sprite.drawAt(ctx, this.X - 2, this.Y);
    }
}

function handleMouseDown(evt) {
    mouse._button = evt.buttons === undefined ? evt.which : evt.buttons;

    if (mouse._button === 1) {
        mouse.pressed = true;
        mouse._nextpressDown = true;
        mouse.pressedInterval = true;
        mouse._nextpressDownInterval = true;

        mouse.dX = evt.clientX - g_canvas.offsetLeft;
        mouse.dY = evt.clientY - g_canvas.offsetTop;
    } else if (mouse._button > 1) {
        mouse._nextpressRight = true;
        mouse._nextpressRightInterval = true;
    }
}

function handleMouseMove(evt) {
    mouse.X = evt.clientX - g_canvas.offsetLeft;
    mouse.Y = evt.clientY - g_canvas.offsetTop;
    
    // mouse moves happen all the time, so we can
    // here happily read out the states of the special
    // system keys that otherwise wouldn't be accessible
    if (!evt) evt = window.event;
    keys[0] = evt.shiftKey;
    keys[1] = evt.altKey;
    keys[2] = evt.ctrlKey;
    keys[3] = evt.metaKey;
}

function handleMouseUp(evt) {
    if (mouse.pressed) {
        mouse._nextpressUp = true;
        mouse._nextpressUpInterval = true;
    }

    mouse.pressed = false;
    mouse.pressedInterval = false;
}

window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mouseup", handleMouseUp);
