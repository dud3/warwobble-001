"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// =============
// SCREENMANAGER
// =============
// 
// This module handles screen-management for WarWobble.
// It includes the start screen as well as the overlayed framework
// that is visible throughout the game.

var screenManager = {

// PUBLIC DATA

fontcolor : 0,
curFrame : {},
buttons : [], // these are the buttons shown in-game and in the in-game
              // menu; the buttons on the startscreen have their own
              // array inside the startscreen object and are handled
              // independently by the startscreen - however, both button
              // types use the underlying button.js file for all commonalities

minimap: {
    pressed: false
},

victoryFrame: {
    visible: false,
    
    render: function(ctx) {
        g_sprites.outcome_victory.drawAt(ctx, 0, 0);
        
        screenManager.renderButtons(ctx);
    },
    
    show: function() {
        screenManager.unShowAll();

        this.visible = true;

        screenManager.buttons = [];
        
        screenManager.buttons.push(new button({
            caption: "Continue",
            left: 399,
            top: 434,
            width: 224,
            height: 28,
            race: 0
        }));
        
        screenManager.buttons[screenManager.buttons.length - 1].onClick = function() {
            // before going back to the start screen, clearing some timers would be nice
            if (singleplayer.on && !singleplayer.useReqAniFrame) {
                singleplayer.clearInterval(singleplayer.intervalID);
            }
    
            gotoStartScreen();
        };
    }
},

defeatFrame: {
    visible: false,
    
    render: function(ctx) {
        g_sprites.outcome_defeat.drawAt(ctx, 0, 0);
        
        screenManager.renderButtons(ctx);
    },
    
    show: function() {
        screenManager.unShowAll();

        this.visible = true;

        screenManager.buttons = [];
        
        screenManager.buttons.push(new button({
            caption: "Continue",
            left: 18,
            top: 434,
            width: 224,
            height: 28,
            race: 0
        }));
        
        screenManager.buttons[screenManager.buttons.length - 1].onClick = function() {
            // before going back to the start screen, clearing some timers would be nice
            if (singleplayer.on && !singleplayer.useReqAniFrame) {
                singleplayer.clearInterval(singleplayer.intervalID);
            }
    
            gotoStartScreen();
        };
    }
},

humanFrame: {
    visible : false
},

orcFrame: {
    visible : false
},

// PUBLIC METHODS

startscreen: {
    visible : false,
    intcounter : 0,
    bgalpha : 0,
    logoalpha : 0,
    settlersalpha : 0,
    fadealpha : 1,
    fadecounter : 0,
    globalfade: 1,
    deactivating: false,
    buttons : [],
    
    loadOrcMissions: function() {

        this.buttons = [];
        
        this.buttons.push(new button({
            caption: "First Mission",
            left: 208,
            top: 240,
            width: 224,
            height: 28,
            alpha: 0,
            alphaOff: this.intcounter * 0.02 + 0.3,
            race: 0
        }));
        
        this.buttons[this.buttons.length - 1].onClick = function() {
            gotoSingleplayerGame([0, 1], 1);
        };
        
        this.buttons.push(new button({
            caption: "Second Mission",
            left: 208,
            top: 276,
            width: 224,
            height: 28,
            alpha: 0,
            alphaOff: this.intcounter * 0.02 + 0.6,
            race: 0
        }));
        
        this.buttons[this.buttons.length - 1].onClick = function() {
            gotoSingleplayerGame([0, 1], 2);
        };
        
        this.buttons.push(new button({
            caption: "Third Mission",
            left: 208,
            top: 312,
            width: 224,
            height: 28,
            alpha: 0,
            alphaOff: this.intcounter * 0.02 + 0.9,
            race: 0
        }));
        
        this.buttons[this.buttons.length - 1].onClick = function() {
            gotoSingleplayerGame([0, 1], 3);
        };
        
        this.buttons.push(new button({
            caption: "Test Mission",
            left: 208,
            top: 348,
            width: 224,
            height: 28,
            alpha: 0,
            alphaOff: this.intcounter * 0.02 + 1.2,
            race: 0
        }));
        
        this.buttons[this.buttons.length - 1].onClick = function() {
            gotoSingleplayerGame([0, 1], 4);
        };
        
        this.buttons.push(new button({
            caption: "Back",
            left: 208,
            top: 384,
            width: 224,
            height: 28,
            alpha: 0,
            alphaOff: this.intcounter * 0.02 + 1.5,
            race: 0
        }));
        
        this.buttons[this.buttons.length - 1].onClick = function() {
            screenManager.startscreen.loadStartScreen();
        };
    },
    
    loadHumanMissions: function() {

        this.buttons = [];
        
        this.buttons.push(new button({
            caption: "First Mission",
            left: 208,
            top: 240,
            width: 224,
            height: 28,
            alpha: 0,
            alphaOff: this.intcounter * 0.02 + 0.3,
            race: 0
        }));
        
        this.buttons[this.buttons.length - 1].onClick = function() {
            gotoSingleplayerGame([1, 0], 1);
        };
        
        this.buttons.push(new button({
            caption: "Second Mission",
            left: 208,
            top: 276,
            width: 224,
            height: 28,
            alpha: 0,
            alphaOff: this.intcounter * 0.02 + 0.6,
            race: 0
        }));
        
        this.buttons[this.buttons.length - 1].onClick = function() {
            gotoSingleplayerGame([1, 0], 2);
        };
        
        this.buttons.push(new button({
            caption: "Back",
            left: 208,
            top: 384,
            width: 224,
            height: 28,
            alpha: 0,
            alphaOff: this.intcounter * 0.02 + 0.9,
            race: 0
        }));
        
        this.buttons[this.buttons.length - 1].onClick = function() {
            screenManager.startscreen.loadStartScreen();
        };
    },
    
    activate: function() {
        this.intcounter = 0;
        this.bgalpha = 0;
        this.logoalpha = 0;
        this.settlersalpha = 0;
        this.fadealpha = 1;
        this.fadecounter = 0;
        this.globalfade = 1;
        this.deactivating = false;

        this.loadStartScreen();
        
        screenManager.unShowAll();
        this.visible = true;
    },
    
    loadStartScreen: function () {        
        this.buttons = [];
        
        this.buttons.push(new button({
            caption: "_O_rc Campaign",
            left: 208,
            top: 240,
            width: 224,
            height: 28,
            alpha: 0,
            alphaOff: 1.3,
            race: 0
        }));
        
        this.buttons[this.buttons.length - 1].onClick = function() {
            screenManager.startscreen.loadOrcMissions();
            
            return true;
        };

        this.buttons.push(new button({
            caption: "_H_uman Campaign",
            left: 208,
            top: 276,
            width: 224,
            height: 28,
            alpha: 0,
            alphaOff: 1.6,
            race: 0
        }));

        this.buttons[this.buttons.length - 1].onClick = function() {
            screenManager.startscreen.loadHumanMissions();
            
            return true;
        };

        this.buttons.push(new button({
            caption: "_M_ulti Player Game",
            left: 208,
            top: 312,
            width: 224,
            height: 28,
            alpha: 0,
            alphaOff: 1.9,
            race: 0
        }));

        this.buttons[this.buttons.length - 1].onClick = function() {
            screenManager.startscreen.fadeout(function () {
                gotoMultiplayerGame();
            });
        };

        this.buttons.push(new button({
            caption: "Show _C_redits",
            left: 208,
            top: 348,
            width: 224,
            height: 28,
            alpha: 0,
            alphaOff: 2.2,
            race: 0
        }));

        this.buttons[this.buttons.length - 1].onClick = function() {
            alert("WarWobble\n\n" +
                  "Dren Kajmakci\n" +
                  "Gestur Hvannberg\n" +
                  "Jeffrey Robert Hair\n" +
                  "Sigurgeir Orri Alexandersson\n" +
                  "Tom Willy Schiller\n\n" +
                  "Version " + version + ", " +
                  "28th of October to 21st of November, 2013\n\n" + 
                  "Based on WarCraft II by Blizzard");
        };

        this.buttons.push(new button({
            caption: "E_x_it Program",
            left: 208,
            top: 384,
            width: 224,
            height: 28,
            alpha: 0,
            alphaOff: 2.5,
            race: 0
        }));

        this.buttons[this.buttons.length - 1].onClick = function() {
            screenManager.startscreen.fadeout(function () {
                window.location.href = "https://www.google.com/search?" +
                    "q=exit&newwindow=1&source=lnms&tbm=isch&sa=X&" +
                    "ei=wexuUufkI4SShQfH8IH4DQ&ved=0CAcQ_AUoAQ&biw=1179&bih=629";
            });
        };
    },
    
    deactivate: function() {
        this.deactivating = true;
        
        this.globalfade = 1;
    },
    
    fadeout: function(callAfterwards) {
        this.fadecounter = this.intcounter;

        this.callAfterFadeOut = callAfterwards;
    },
    
    update: function(du) {

        this.intcounter += du;
        
        this.bgalpha = Math.min(1, this.intcounter * 0.02);
        this.logoalpha = Math.max(0, Math.min(1, this.intcounter * 0.02 - 1));
        this.settlersalpha = Math.max(0, Math.min(1, this.intcounter * 0.005 - 1));

        if (this.fadecounter > 0) {
            this.fadealpha = 1 - Math.max(0, Math.min(1, (this.intcounter - this.fadecounter) * 0.025));
            
            if (this.fadealpha === 0) {
                this.callAfterFadeOut();
                this.fadecounter = 0;
            }
        }
        
        if (this.deactivating) {
            this.globalfade -= du * 0.02;
            
            if (this.globalfade < 0) {
                this.globalfade = 0;
                this.visible = false;
                this.buttons = [];
                this.deactivating = false;
            }
        } else {
            for (var i = 0; i < this.buttons.length; i++) {
                if (this.buttons[i].updateWithAlpha(this.intcounter)) {
                    break;
                }
            }
        }
    },

    render: function(ctx) {
        if (this.fadealpha < 1) {
            ctx.globalAlpha = this.globalfade;

            g_sprites.bgl.drawAt(ctx, 0, 0);
            
            ctx.globalAlpha = this.fadealpha * this.globalfade;
        } else {
            ctx.globalAlpha = this.bgalpha * this.globalfade;
        }

        g_sprites.bg.drawAt(ctx, 0, 0);

        if (ctx.globalAlpha === 1) {
            this.weDrewTheBgBefore = true;
        }

        g_sprites.writeCentered(ctx, "WarWobble v" + version, 1, 320, 450);

        ctx.globalAlpha = this.logoalpha * this.globalfade;

        g_sprites.logo.drawAt(ctx, 50, 32);

        g_sprites.veail.drawAt(ctx, 540, 395);

        for (var i = 0; i < this.buttons.length; i++) {
            this.buttons[i].renderWithAlpha(ctx, this.globalfade);
        }

        ctx.globalAlpha = this.settlersalpha * this.globalfade;
        
        g_sprites.settlers_frame_l.drawAt(ctx, 0, 0);
        g_sprites.settlers_frame_r.drawAt(ctx, 590, 0);
        g_sprites.settlers_frame_t.drawAt(ctx, 46, 0);
        g_sprites.settlers_frame_b.drawAt(ctx, 46, 460);

        ctx.globalAlpha = 1;
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

    this.updateButtons(du);
},

updateButtons : function(du) {
    for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].update();
    }
},

commonrender : function(ctx) {
    this.drawFrame(ctx, this.curFrame);
        
    this.renderResources(ctx, this.fontcolor);

    this.renderButtons(ctx);
    
    if (singleplayer.on && singleplayer.replaySystem.playing) {
        var curH = 478 * singleplayer.updateID / singleplayer.replaySystem.maxID;
        ctx.fillStyle = "rgba(255,255,0,0.2)";
        ctx.fillRect(625, 479 - curH, 15, curH);
        ctx.fillStyle = "rgba(255,255,0,0.2)";
        ctx.fillRect(627, 481 - curH, 11, curH - 4);
        ctx.fillStyle = "rgba(255,255,0,0.2)";
        ctx.fillRect(629, 483 - curH, 7, curH - 8);
    }
},

renderButtons : function(ctx) {
    for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].render(ctx);
    }
},

init: function() {
    this.humanFrame.sprite = g_sprites.human_frame;
    this.humanFrame.sprite_t = g_sprites.human_frame_t;
    this.humanFrame.sprite_r = g_sprites.human_frame_r;
    this.humanFrame.sprite_b = g_sprites.human_frame_b;
    this.orcFrame.sprite = g_sprites.orc_frame;
    this.orcFrame.sprite_t = g_sprites.orc_frame_t;
    this.orcFrame.sprite_r = g_sprites.orc_frame_r;
    this.orcFrame.sprite_b = g_sprites.orc_frame_b;
},

renderResources: function(ctx, color) {
    g_sprites.write(ctx, "" + player.me.gold, color, 230, 2);
    g_sprites.write(ctx, "" + player.me.lumber, color, 303, 2);
    g_sprites.write(ctx, "" + player.me.oil, color, 376, 2);

    if (player.me.eaten > player.me.food) {
        g_sprites.write(ctx, "" + player.me.eaten, 2, 449, 2);
        g_sprites.write(ctx, "/" + player.me.food, color,
                        449 + g_sprites.textWidth("" + player.me.eaten), 2);
    } else {
        g_sprites.write(ctx, player.me.eaten + "/" + player.me.food, color, 449, 2);
    }
},

drawFrame: function(ctx, frame) {
    frame.sprite.drawAt(ctx, 0, 0);
    frame.sprite_t.drawAt(ctx, 176, 0);
    frame.sprite_r.drawAt(ctx, 624, 0);
    frame.sprite_b.drawAt(ctx, 176, 464);
},

startGame: function() {
    this.startscreen.deactivate();
    this.defeatFrame.visible = false;
    this.victoryFrame.visible = false;

    this.fontcolor = player.me.race;
    
    if (player.me.race === 0) {
        this.curFrame = this.orcFrame;
    } else {
        this.curFrame = this.humanFrame;
    }
    
    this.curFrame.visible = true;
    
    this.buttons = [];
    
    this.buttons.push(new button({
        caption: "Menu",
        left: 24,
        top: 2,
        width: 128,
        height: 20,
        race: player.me.race,
        preRendered: true
    }));

    this.buttons[this.buttons.length - 1].onClick = function() {
        // The user pressed the Menu button.
        // As we don't have a nice and shiny in-game-menu yet,
        // we just fall back to the start screen.

        // before going back to the start screen, clearing some timers would be nice
        if (singleplayer.on && !singleplayer.useReqAniFrame) {
            singleplayer.clearInterval(singleplayer.intervalID);
        }

        gotoStartScreen();
    };

},

update: function(du) {

    if (this.curFrame.visible) {
        this.commonupdate(du);
    }
    
    if (this.startscreen.visible) {
        this.startscreen.update(du);
    }
    
    if (this.defeatFrame.visible || this.victoryFrame.visible) {
        this.updateButtons(du);
    }

}

}

screenManager.unShowAll = function() {
    screenManager.startscreen.visible = false;
    screenManager.humanFrame.visible = false;
    screenManager.orcFrame.visible = false;
    screenManager.defeatFrame.visible = false;
    screenManager.victoryFrame.visible = false;
};
