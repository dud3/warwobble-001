"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// =================
// KEYBOARD HANDLING
// =================
// 
// Here we keep track of the current state of the keyboard.
// However, the state of the system keys is, a bit counter-
// intuitively, steered by the mouse movement in mouse.js.

// 0 .. shift
// 1 .. alt
// 2 .. ctrl
// 3 .. cmd
var keys = [false, false, false, false];

function handleKeydown(evt) {
    keys[evt.keyCode] = true;
}

function handleKeyup(evt) {
    keys[evt.keyCode] = false;
}

// Inspects, and then clears, a key's state
//
// This allows a keypress to be "one-shot" e.g. for toggles
// ..until the auto-repeat kicks in, that is.
//
function eatKey(keyCode) {
    var isDown = keys[keyCode];
    keys[keyCode] = false;
    return isDown;
}

// A tiny little convenience function
function keyCode(keyChar) {
    return keyChar.charCodeAt(0);
}

window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);
