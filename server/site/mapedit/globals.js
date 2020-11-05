// =======
// GLOBALS
// =======
/*

Evil, ugly (but "necessary") globals, which everyone can use.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_tscanvas = document.getElementById("tilesetCanvas");
var g_iccanvas = document.getElementById("iconCanvas");
var g_ctx = g_canvas.getContext("2d");
var g_tsctx = g_tscanvas.getContext("2d");
var g_icctx = g_iccanvas.getContext("2d");

g_canvas.oncontextmenu = function() {
     return false;  
} 

// The "nominal interval" is the one that all of our time-based units are
// calibrated to e.g. a velocity unit is "pixels per nominal interval"
//
var NOMINAL_UPDATE_INTERVAL = 16.666;

// Multiply by this to convert seconds into "nominals"
var SECS_TO_NOMINALS = 1000 / NOMINAL_UPDATE_INTERVAL;
