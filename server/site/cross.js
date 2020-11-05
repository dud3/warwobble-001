"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// =====
// CROSS
// =====
// 
// This is the little green X that is seen when someone sends units to
// a new location.

var cross = {

    X : 0,
    Y : 0,
    alpha : 0,
    kind : 0, // 0 .. neutral green walk-to cross
              // 1 .. aggressive red attack cross from WarWind
    
    show : function(kindOfCross) {
        this.X = mouse.X + world.camL*32 - 16;
        this.Y = mouse.Y + world.camT*32 - 16;
        this.alpha = 1.5;
        this.kind = kindOfCross;
    },
    
    update : function(du) {
        this.alpha -= du / 20;
    },
    
    render : function(ctx) {
        if (this.alpha > 0) {
            ctx.globalAlpha = util.min(1, this.alpha);
            
            if (this.kind === 0) {
                g_sprites.cross.drawAt(ctx,
                                       this.X - world.camL*32,
                                       this.Y - world.camT*32);
            } else {
                g_sprites.attack_cross.drawSpriteAt(ctx,
                                                  this.X + 16 - world.camL*32,
                                                  this.Y + 16 - world.camT*32,
                                                  1,
                                                  8,
                                                  Math.floor(8 - (this.alpha * 4)));
            }
            
            ctx.globalAlpha = 1;
        }
    }

};