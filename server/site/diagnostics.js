"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ===========
// DIAGNOSTICS
// ===========
// 
// Here a small window can be shown that tells the user which
// debug settings are currently used.

var diagnostics = {
    visible : false,
    
    doRoutefinding : true,
    renderRoutefindingOverlay: false,
    
    renderInterpolation : true, // true if we do render interpolation
                                // to account for the fact that our update
                                // logic happens on intervals of 100ms while
                                // we render based on animationframes, of
                                // which there should hopefully be more than
                                // 10 per second =)

    render : function(ctx) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(390, 355, 230, 100);
        
        ctx.fillStyle = "#ffffff";
        var y = 358;
        
        ctx.fillText("[ G ]", 400, y+10);
        if (world.speedThingsUp) {
            ctx.fillText("WORLD Minimap SpeedUp :: ON", 440, y+10);
        } else {
            ctx.fillText("WORLD Minimap SpeedUp :: OFF", 440, y+10);
        }

        ctx.fillText("[ V ]", 400, y+20);
        if (world.fogRender) {
            ctx.fillText("WORLD Render Fog :: ON", 440, y+20);
        } else {
            ctx.fillText("WORLD Render Fog :: OFF", 440, y+20);
        }

        ctx.fillText("[ X ]", 400, y+30);
        if (world.fogRender) {
            ctx.fillText("WORLD Passability View :: ON", 440, y+30);
        } else {
            ctx.fillText("WORLD Passability View :: OFF", 440, y+30);
        }

        ctx.fillText("[ N ]", 400, y+40);
        if (this.renderInterpolation) {
            ctx.fillText("UNIT Render Interpolation :: ON", 440, y+40);
        } else {
            ctx.fillText("UNIT Render Interpolation :: OFF", 440, y+40);
        }

        ctx.fillText("[ F ]", 400, y+50);
        if (diagnostics.doRoutefinding) {
            ctx.fillText("UNIT Route Finding :: ON", 440, y+50);
        } else {
            ctx.fillText("UNIT Route Finding :: OFF", 440, y+50);
        }

        ctx.fillText("[ D ]", 400, y+60);
        if (diagnostics.renderRoutefindingOverlay) {
            ctx.fillText("UNIT Route Overlay :: ON", 440, y+60);
        } else {
            ctx.fillText("UNIT Route Overlay :: OFF", 440, y+60);
        }

        ctx.fillText("[ A ]", 400, y+70);
        if (singleplayer.useReqAniFrame) {
            ctx.fillText("SINGLEPLAYER Use Interval :: OFF", 440, y+70);
        } else {
            ctx.fillText("SINGLEPLAYER Use Interval :: ON", 440, y+70);
        }

        ctx.fillText("[ S ]", 400, y+80);
        if (SOUND._muted) {
            ctx.fillText("SOUND :: OFF", 440, y+80);
        } else {
            ctx.fillText("SOUND :: ON", 440, y+80);
        }

        ctx.fillText("[ E ]", 400, y+90);
        if (singleplayer.on && singleplayer.replaySystem.playing) {
            ctx.fillText("REPLAY SYSTEM :: ON", 440, y+90);
        } else {
            ctx.fillText("REPLAY SYSTEM :: OFF", 440, y+90);
        }
    }
}
