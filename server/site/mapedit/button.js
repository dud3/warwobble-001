"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// =======
// BUTTONS
// =======
// 
// Buttons sure are rather important - important enough to
// become their own sorts of entities, keep track of their
// positions, states, etc.

function button(descr) {
    for (var property in descr) {
        this[property] = descr[property];
    }
    
    this.middle = this.left + (this.width / 2);
    this.right = this.left + this.width;
    this.bottom = this.top + this.height;

    this.clicked = false;

    this.alpha = 1;
    this.alphaOff = this.alphaOff || 0;
    
    this.preRendered = this.preRendered || false;
    
    this.setCaption(this.caption);
    
    this.bigFont = false;

    if (this.race === 0) {
        this.sprite = g_sprites.orc_button_s;

        if ((this.width === 224) && (this.height === 28)) {
            this.sprite = g_sprites.orc_button;
            this.bigFont = true;
        }
    } else {
        this.sprite = g_sprites.human_button_s;

        if ((this.width === 224) && (this.height === 28)) {
            this.sprite = g_sprites.human_button;
            this.bigFont = true;
        }
    }
}

button.prototype.setCaption = function(str) {
    this.caption = str;
    
    this.captionAllWhite = "_";

    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) !== '_') {
            this.captionAllWhite += str.charAt(i);
        }
    }
}

button.prototype.updateWithAlpha = function(intcounter) {
    this.alpha = Math.max(0, Math.min(1, intcounter * 0.02 - this.alphaOff));

    this.update();
}

button.prototype.update = function() {
    if (mouse.pressDown &&
       (mouse.X > this.left) && (mouse.X < this.right) &&
       (mouse.Y > this.top) && (mouse.Y < this.bottom)) {
        this.clicked = true;
    }

    if (mouse.pressUp) {
        if (this.clicked &&
           (mouse.X > this.left) && (mouse.X < this.right) &&
           (mouse.Y > this.top) && (mouse.Y < this.bottom) &&
           (this.alpha > 0)) {
            this.onClick();
        }
        
        this.clicked = false;
    }
}

button.prototype.renderWithAlpha = function(ctx, globalfade) {
    ctx.globalAlpha = this.alpha * globalfade;

    this.render(ctx);
}

button.prototype.render = function(ctx) {
    if (!this.preRendered) {
        this.sprite.drawAt(ctx, this.left, this.top);
    }

    var capChange = false;
    var cap = this.caption;

    if ((mouse.X > this.left) && (mouse.X < this.right) &&
        (mouse.Y > this.top) && (mouse.Y < this.bottom)) {
        if (this.clicked) {
            ctx.strokeStyle = "#ffff00";
            
            capChange = true;
            cap = this.captionAllWhite;
        } else {
            ctx.strokeStyle = "#828282";
        }

        ctx.strokeRect(this.left + 1.5, this.top + 1.5, this.width - 3, this.height - 3);
    }

    if ((!this.preRendered) || capChange) {
        if (this.bigFont) {
            g_sprites.writeCenteredExBig(ctx, cap, this.race, this.middle, this.top + 7);
        } else {
            g_sprites.writeCenteredEx(ctx, cap, this.race, this.middle, this.top + 4);
        }
    }
}