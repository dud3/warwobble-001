"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ======
// GATHER
// ======
// 
// This general gather routine allows to gather keyboard inputs for popping
// up a help dialogue, changing world characteristics for diagnostic purposes
// and changing singleplayer-mode options.
// The help dialogue offers the user (as well as the programmer) valuable
// insight into the keys that can be pressed and the associated actions
// at any moment.

var KEY_HELP = 'H'.charCodeAt(0),
    KEY_PASSABLE = 'X'.charCodeAt(0),
    KEY_SPEEDUP = 'G'.charCodeAt(0),
    KEY_FOG_RENDER = 'V'.charCodeAt(0),
    KEY_INTERPOLATION = 'N'.charCodeAt(0),
    KEY_SWITCHREQFRAME = 'A'.charCodeAt(0),
    KEY_SHOWSTATUS = 'M'.charCodeAt(0),
    KEY_ROUTEFINDING = 'F'.charCodeAt(0),
    KEY_ROUTEFINDINGOVERLAY = 'D'.charCodeAt(0),
    KEY_SOUND = 'S'.charCodeAt(0),
    KEY_REPLAY = 'E'.charCodeAt(0);

function gather() {
    if (eatKey(KEY_HELP)) {
        var arrowkeystr = "";
        
        if (!screenManager.startscreen.visible) {
            arrowkeystr = "[ LEFT ], [ RIGHT ], [ UP ], [ DOWN ] " +
                          "move the visible part of the screen\n" +
                          "[ CTRL ] when pressed, selection will be additive\n";
        }
        
        alert("Right now, you can use the following keys:\n\n" +
              arrowkeystr +
              "[ H ] display help\n\n" +
              "Debug stuff:\n\n" +
              "[ P ] toggle pause, [ O ] step ahead one step, [ C ] toggle clear,\n" +
              "[ B ] box, [ U ] undo box, [ F ] flipflop,\n" +
              "[ X ] toggle passability view, [ G ] toggle speedup,\n" +
              "[ V ] toggle fog rendering, [ N ] toggle render interpolation\n" +
              "[ A ] toggle between using request animation frame and interval for singleplayer,\n" +
              "[ M ] show current status, [ T ] show render stats display,\n" +
              "[ F ] toggle route finding, [ D ] toggle route finding overlay,\n" +
              "[ E ] replay what has happened so far in singleplayer mode,\n" +
              "[ S ] toggle sound, [ R ] toggle render, [ Q ] quit");
    }

    if (eatKey(KEY_PASSABLE)) {
        world.passabilityview = !world.passabilityview;
    }
    
    if (eatKey(KEY_SPEEDUP)) {
        world.minimap.speedThingsUp = !world.minimap.speedThingsUp;
    }
    
    if (eatKey(KEY_FOG_RENDER)) {
        world.fogRender = !world.fogRender;
    }
    
    if (eatKey(KEY_INTERPOLATION)) {
        diagnostics.renderInterpolation = !diagnostics.renderInterpolation;
    }
    
    if (eatKey(KEY_SWITCHREQFRAME)) {
        singleplayer.useReqAniFrame = !singleplayer.useReqAniFrame;
        singleplayer.switchReqAniFrame();
        world.renderInterpolation = !singleplayer.useReqAniFrame;
    }
    
    if (eatKey(KEY_ROUTEFINDINGOVERLAY)) {
        diagnostics.renderRoutefindingOverlay = !diagnostics.renderRoutefindingOverlay;
        
        if (diagnostics.renderRoutefindingOverlay) {
            diagnostics.doRoutefinding = true;
        }
    }
    
    if (eatKey(KEY_ROUTEFINDING)) {
        diagnostics.doRoutefinding = !diagnostics.doRoutefinding;

        if (!diagnostics.doRoutefinding) {
            diagnostics.renderRoutefindingOverlay = false;
        }
    }
    
    if (eatKey(KEY_SHOWSTATUS)) {
        diagnostics.visible = !diagnostics.visible;
    }
    
    if (eatKey(KEY_SOUND)) {
        SOUND.toggleMuted();
    }
    
    if (eatKey(KEY_REPLAY) && singleplayer.on) {
        var rS = singleplayer.replaySystem;

        rS.playing = !rS.playing;

        if (rS.playing) {
            singleplayer.replaySystem.restart();
        }
    }
}
