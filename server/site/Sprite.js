"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// =======================
// SPRITE-RELATED BUSINESS
// =======================
// 
// This file contains not only general sprite construction,
// but also the g_sprites object which is used throughout the
// entire program, offering access to all the loaded sprites
// as well as the output of text in the typical WarCraft II
// font.

// Construct a "sprite" from the given "image",
//
function Sprite(image) {
    this.image = image;

    this.width = image.width;
    this.height = image.height;
    
    // we assume that the sprite has 5 rows and 8 columns;
    // however, these values are only used for units,
    // not for buildings or other sprites
    this.vert = 5;
    this.horz = 8;
    
    this.isCorpse = false;
    
    // If this sprite belongs to a building, then there are two
    // possibilities: Either the building only has two shapes,
    // then grassland and desert are the same with only winter
    // being different, or the building has three shapes, so that
    // a desert version exists and is different from the grassland
    // version. To figure out which case we have (assuming that
    // we have a building, otherwise this will just be ignored),
    // we simply see whether or not the width of the image is
    // larger than the height; for sprites with only grassland
    // and summer, width and height should be identical.
    this.desertIsExtra = image.width > image.height;
}

Sprite.prototype.drawAt = function (ctx, x, y) {
    ctx.drawImage(this.image, x, y);
};

// the row is an integer from 0 upwards that tells us in which row
// of the sprite sheet we are in
Sprite.prototype.drawBuildingAt = function (ctx, x, y, w, h, row) {
    if (this.desertIsExtra) {
        ctx.drawImage(this.image, w * world.isDesert, h * row, w, h,
                      x + 176 - world.camL*32, y + 16 - world.camT*32, w, h);
    } else {
        ctx.drawImage(this.image, w * world.isWinter, h * row, w, h,
                      x + 176 - world.camL*32, y + 16 - world.camT*32, w, h);
    }
};

// mx : horizontal number of the pose that we want to draw
// my : vertical number of the pose that we want to draw
Sprite.prototype.drawCorpseAt = function (ctx, cx, cy, mx, my) {
    var w = this.width,
        h = this.height,
        wh = w/6,
        hh = h/2;

    ctx.drawImage(this.image,
                 mx * wh,
                 my * hh,
                 wh, hh,
                 cx + 176 - world.camL*32 - wh/2,
                 cy + 16 - world.camT*32 - hh/2,
                 wh, hh);
};

// mh : amount of poses horizontally on the sprite
// mv : amount of poses vertically on the sprite
// mn : number of pose we want to draw
Sprite.prototype.drawSpriteAt = function (ctx, cx, cy, mh, mv, mn) {
    var w = this.width,
        h = this.height,
        wh = w/mh,
        hh = h/mv;

    ctx.drawImage(this.image,
                 (mn % mh) * wh,
                 (Math.floor(mn / mh)) * hh,
                 wh, hh,
                 Math.floor(cx - wh/2),
                 Math.floor(cy - hh/2),
                 wh, hh);
};

// mn : number of pose we want to draw
Sprite.prototype.drawCharAt = function (ctx, cx, cy, mn) {
    var w = this.width,
        h = this.height,
        wh = w/this.horz,
        hh = h/this.vert;

    ctx.drawImage(this.image,
                 (mn % this.horz) * wh,
                 (Math.floor(mn / this.horz)) * hh,
                 wh, hh,
                 Math.floor(cx - wh/2) + 176 - world.camL*32,
                 Math.floor(cy - hh/2) + 16 - world.camT*32,
                 wh, hh);
};

Sprite.prototype.drawTileAt = function (ctx, cx, cy, tile) {
    ctx.drawImage(this.image, (tile % 8) * 32, (Math.floor(tile / 8)) * 32,
                  32, 32, cx, cy, 32, 32);
};


// =========
// G_SPRITES
// =========

var g_sprites = {

// Here come a few functions that are similar to the Sprite-functions.

drawGeneralTileAt : function (ctx, cx, cy, tile) {
    ctx.drawImage(g_sprites.general_tileset.image,
                  (tile % 8) * 32, (Math.floor(tile / 8)) * 32,
                  32, 32, cx, cy, 32, 32);
},

// We draw a construction site at center coordinates cx, cy,
// where highest sprite is either 1 (for a small construction site)
// or 2 (for a large one).
drawConstructionSiteAt : function (ctx, cx, cy, highestSprite) {

    // if highestSprite is 2, we want row 0, but if it is 1, we want row 1
    var row = 2 - highestSprite;

    ctx.drawImage(this.building.image, 64 * world.isWinter, 64 * row, 64, 64,
                  cx + 144 - world.camL*32, cy - 16 - world.camT*32, 64, 64);
},

// left, top: coordinates of left- and top-most point of the icon
// number: number of the icon that is to be drawn
// magic numbers:
// 10 .. amount of icons horizontally in the icons.png file
// 46 .. width of a single icon
// 38 .. height of a single icon
drawIcon : function (ctx, left, top, number, icons_img) {
    ctx.drawImage(icons_img.image,
                  (number % 10) * 46,
                  (Math.floor(number / 10)) * 38,
                  46, 38,
                  left, top,
                  46, 38);
},

// Now come private declarations.

_message : "",
_messageAlpha : 0,
_messageColor : 0,

_fontPos : {
    '0': 0,
    '1': 7,
    '2': 11,
    '3': 18,
    '4': 25,
    '5': 33,
    '6': 40,
    '7': 48,
    '8': 55,
    '9': 62,
    '/': 69,
    '-': 76,
    '+': 82,
    ':': 89,
    '(': 92,
    ')': 97,
    '%': 102,
    ' ': 110,
    'A': 117,
    'B': 126,
    'C': 135,
    'D': 143,
    'E': 152,
    'F': 160,
    'G': 168,
    'H': 176,
    'I': 185,
    'J': 190,
    'K': 198,
    'L': 209,
    'M': 217,
    'N': 228,
    'O': 237,
    'P': 245,
    'Q': 254,
    'R': 263,
    'S': 273,
    'T': 280,
    'U': 289,
    'V': 298,
    'W': 307,
    'X': 320,
    'Y': 329,
    'Z': 341,
    'a': 349,
    'b': 357,
    'c': 364,
    'd': 371,
    'e': 379,
    'f': 386,
    'g': 393,
    'h': 402,
    'i': 411,
    'j': 416,
    'k': 421,
    'l': 429,
    'm': 434,
    'n': 446,
    'o': 455,
    'p': 463,
    'q': 471,
    'r': 480,
    's': 487,
    't': 494,
    'u': 500,
    'v': 509,
    'w': 518,
    'x': 530,
    'y': 538,
    'z': 546, // !
    '.': 554,
    ',': 557
},

_fontWidth : {
    '0': 6,
    '1': 3,
    '2': 6,
    '3': 6,
    '4': 7,
    '5': 6,
    '6': 7,
    '7': 6,
    '8': 6,
    '9': 6,
    '/': 6,
    '-': 5,
    '+': 6,
    ':': 2,
    '(': 4,
    ')': 4,
    '%': 7,
    ' ': 6,
    'A': 8,
    'B': 8,
    'C': 7,
    'D': 8,
    'E': 7,
    'F': 7,
    'G': 7,
    'H': 8,
    'I': 4,
    'J': 7,
    'K': 10,
    'L': 7,
    'M': 10,
    'N': 8,
    'O': 7,
    'P': 8,
    'Q': 8,
    'R': 9,
    'S': 6,
    'T': 8,
    'U': 8,
    'V': 8,
    'W': 12,
    'X': 8,
    'Y': 11,
    'Z': 7,
    'a': 7,
    'b': 6,
    'c': 6,
    'd': 7,
    'e': 6,
    'f': 6,
    'g': 8,
    'h': 8,
    'i': 4,
    'j': 4,
    'k': 7,
    'l': 4,
    'm': 11,
    'n': 8,
    'o': 7,
    'p': 7,
    'q': 8,
    'r': 6,
    's': 6,
    't': 5,
    'u': 8,
    'v': 8,
    'w': 11,
    'x': 7,
    'y': 7,
    'z': 7, // !
    '.': 2,
    ',': 3,
    '_': -1 // negative one so that it doesn't influence textWidth()
},

_fontPosBig : {
    'A': 0,
    'B': 12,
    'C': 23,
    'D': 33,
    'E': 44,
    'F': 54,
    'G': 63,
    'H': 74,
    'I': 86,
    'J': 92,
    'K': 102,
    'L': 115,
    'M': 126,
    'N': 141,
    'O': 155,
    'P': 167,
    'Q': 179,
    'R': 191,
    'S': 204,
    'T': 215,
    'U': 227,
    'V': 240,
    'W': 255,
    'Y': 271,
    'a': 283,
    'b': 293,
    'c': 302,
    'd': 311,
    'e': 320,
    'f': 329,
    'g': 338,
    'h': 347,
    'i': 356,
    'j': 362,
    'k': 368,
    'l': 376,
    'm': 380,
    'n': 395,
    'o': 405,
    'p': 414,
    'q': 424,
    'r': 435,
    's': 444,
    't': 453,
    'u': 461,
    'v': 471,
    'w': 483,
    'x': 499,
    'y': 509,
    ' ': 519,
    '.': 528,
    ',': 532,
    '(': 536,
    '\\': 541,
    ')': 549
},

_fontWidthBig : {
    'A': 11,
    'B': 10,
    'C': 9,
    'D': 10,
    'E': 9,
    'F': 8,
    'G': 10,
    'H': 11,
    'I': 5,
    'J': 9,
    'K': 12,
    'L': 10,
    'M': 14,
    'N': 13,
    'O': 11,
    'P': 11,
    'Q': 11,
    'R': 12,
    'S': 10,
    'T': 11,
    'U': 12,
    'V': 14,
    'W': 15,
    'Y': 11,
    'a': 9,
    'b': 8,
    'c': 8,
    'd': 8,
    'e': 8,
    'f': 8,
    'g': 8,
    'h': 8,
    'i': 5,
    'j': 5,
    'k': 7,
    'l': 3,
    'm': 14,
    'n': 9,
    'o': 8,
    'p': 9,
    'q': 10,
    'r': 8,
    's': 8,
    't': 7,
    'u': 9,
    'v': 11,
    'w': 15,
    'x': 9,
    'y': 9,
    ' ': 8,
    '.': 3,
    ',': 3,
    '(': 4,
    '\\': 7,
    ')': 4,
    '_': -1 // negative one so that it doesn't influence textWidth()
},

// Color: 0 .. Orcish yellow
//        1 .. Humanly white
//        2 .. Emergency red
write : function(ctx, str, color, left, top) {
    for (var i = 0; i < str.length; i++) {
        var fw = this._fontWidth[str.charAt(i)];
        ctx.drawImage(this.font.image,
                      this._fontPos[str.charAt(i)],
                      color * 14,
                      fw, 14,
                      left, top,
                      fw, 14);
        left += fw + 1;
    }
},

// Here, a '_' can be put in front of any character to change the color from now on.
// So to get 'ABC' with A and C in yellow and B in white, write
// color = 0 and str = 'A_B_C'.
writeEx : function(ctx, str, color, left, top) {
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) === '_') {
            color = 1 - color;
        } else {
            var fw = this._fontWidth[str.charAt(i)];
            ctx.drawImage(this.font.image,
                          this._fontPos[str.charAt(i)],
                          color * 14,
                          fw, 14,
                          left, top,
                          fw, 14);
            left += fw + 1;
        }
    }
},

writeCentered : function(ctx, str, color, middle, top) {
    this.write(ctx, str, color, middle - Math.floor(this.textWidth(str)/2), top);
},

writeCenteredEx : function(ctx, str, color, middle, top) {
    this.writeEx(ctx, str, color, middle - Math.floor(this.textWidth(str)/2), top);
},

writeRight : function(ctx, str, color, right, top) {
    this.write(ctx, str, color, right - this.textWidth(str), top);
},

textWidth : function(str) {
    var width = 0;

    for (var i = 0; i < str.length; i++) {
        width += this._fontWidth[str.charAt(i)] + 1;
    }
    
    return width;
},

writeBig : function(ctx, str, color, left, top) {
    for (var i = 0; i < str.length; i++) {
        var fw = this._fontWidthBig[str.charAt(i)];
        ctx.drawImage(this.font_big.image,
                      this._fontPosBig[str.charAt(i)],
                      color * 17,
                      fw, 17,
                      left, top,
                      fw, 17);
        left += fw + 1;
    }
},

writeExBig : function(ctx, str, color, left, top) {
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) === '_') {
            color = 1 - color;
        } else {
            var fw = this._fontWidthBig[str.charAt(i)];
            ctx.drawImage(this.font_big.image,
                          this._fontPosBig[str.charAt(i)],
                          color * 17,
                          fw, 17,
                          left, top,
                          fw, 17);
            left += fw + 1;
        }
    }
},

writeCenteredBig : function(ctx, str, color, middle, top) {
    this.writeBig(ctx, str, color, middle - Math.floor(this.textWidthBig(str)/2), top);
},

writeCenteredExBig : function(ctx, str, color, middle, top) {
    this.writeExBig(ctx, str, color, middle - Math.floor(this.textWidthBig(str)/2), top);
},

writeRightBig : function(ctx, str, color, right, top) {
    this.writeBig(ctx, str, color, right - this.textWidthBig(str), top);
},

textWidthBig : function(str) {
    var width = 0;

    for (var i = 0; i < str.length; i++) {
        width += this._fontWidthBig[str.charAt(i)] + 1;
    }
    
    return width;
},

message : function(str, color) {
    this._message = str;
    this._messageAlpha = 4;
    this._messageColor = color;
},

init : function() {
    this._messageAlpha = 0;
},

update : function(du) {
    this._messageAlpha -= du / 50;
},

render : function(ctx) {
    if (this._messageAlpha > 0) {
        ctx.globalAlpha = util.min(1, this._messageAlpha);
        
        this.writeEx(ctx, this._message, this._messageColor, 183, 446);
        
        ctx.globalAlpha = 1;
    }
}

};
