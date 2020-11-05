"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

// ==========
// EVERY UNIT
// ==========
// 
// This file includes the construction of any unit, that is
// any moving entity. There is another kind of entity which
// is not covered here: A building. Units and buildings are
// rather distinct, so that this approach makes sense.
// 
// Examples for the usage of the unit-function can be found
// in preloadEntityList.js.

// Usage:
// unit(descr,
//      [
//           main sprite,
//           corpse sprite,
//           attack sprite,
//           gold carrying sprite,
//           lumber carrying sprite,
//           oil carrying sprite
//      ],
//      ["name line one", "name line two"],
//      nr of the icon,
//      [maxhp, armor, damage_min, damage_max, range, sight, speed, magic],
//      g_sprite.icon_red or g_sprite.icon_blue,
//      [actions],
//      is flying
//      )
function unit(descr, image, names, icon, stats, color, ability, flying) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.sprite = image[0];
    this.sprite_normal = image[0];
    this.sprite_corpse = image[1];
    this.sprite_attack = image[2];
    this.sprite_gold = image[3];
    this.sprite_lumber = image[4];
    this.sprite_oil = image[5];
    this.names = names;
    this.icon = icon;
    this.maxhp = stats[0];
    this.armor = stats[1];
    this.damage_min = stats[2];
    this.damage_max = stats[3];
    if (stats[2] === stats[3]) {
        this.damage_str = "" + stats[2];
    } else {
        this.damage_str = stats[2] + "-" + stats[3];
    }
    this.range = stats[4];
    this.sight = stats[5];
    this.speed = stats[6];
    this.magic = stats[7];
    this.ics = color;
    this.isBuilding = false;
    this.isFlying = flying || false;
    this.width = 32 * entityList.sizes[this.race][this.type][0];
    this.height = 32 * entityList.sizes[this.race][this.type][1];
    this.needGold = entityList.costs[this.race][this.type][0];
    this.needLumber = entityList.costs[this.race][this.type][1];
    this.needOil = entityList.costs[this.race][this.type][2];
    this.needTime = entityList.costs[this.race][this.type][3];

    // These are the numbers of the icons of the unit's actions.
    this.action = ability;

    // Stuff from the common inherited setup logic that needs to be
    // executed later.
    this.setdown();
}

unit.prototype = new Entity();

// We should not have too high of a velocity / nor too low of an interval for
// the interval-powered game logic to depend upon, because such a combination
// would result in several tiles being passed during each logical interval;
// however, the code can only handle passing one tile at a time. Therefore,
// the interval needs to be short and the velocity needs to be low!
unit.prototype.normalizeVelocity = function() {
    return 0.075 * this.speed /
           Math.sqrt(this.velX*this.velX + this.velY*this.velY);
};

unit.prototype.stopMoving = function () {
    this.targetX = this.tileX * 32 + 16;
    this.targetY = this.tileY * 32 + 16;
    
    this.nexttileX = this.tileX;
    this.nexttileY = this.tileY;
    
    this.nextX = this.nexttileX * 32 + 16;
    this.nextY = this.nexttileY * 32 + 16;
    
    this.velX = 0;
    this.velY = 0;
};

unit.prototype.updateOrientation = function(velX, velY) {
    var dir = 2;

    if (Math.abs(velX) * 2 < Math.abs(velY)) {
        dir = 3;
    } else if (Math.abs(velY) * 2 < Math.abs(velX)) {
        dir = 1;
    }

    if (velY < 0) {
        if (velX < 0) {
            this.orientation = 5 + dir;

            if (this.orientation === 8) {
                this.orientation = 0;
            }
        } else {
            this.orientation = 3 - dir;
        }
    } else {
        if (velX < 0) {
            this.orientation = 7 - dir;
        } else {
            this.orientation = 1 + dir;
        }
    }
};

unit.prototype.nextTileFromOrientation = function () {
    if ((this.orientation === 7) ||
        (this.orientation < 2)) {
        this.nexttileY = this.tileY - 1;
        
        if (this.nexttileY < 0) {
            this.nexttileY = 0;
        }
    } else if ((this.orientation > 2) &&
               (this.orientation < 6)) {
        this.nexttileY = this.tileY + 1;
        
        if (this.nexttileY > world.height-1) {
            this.nexttileY -= 1;
        }
    }
    
    if ((this.orientation > 4) &&
        (this.orientation < 8)) {
        this.nexttileX = this.tileX - 1;
        
        if (this.nexttileX < 0) {
            this.nexttileX = 0;
        }
    } else if ((this.orientation > 0) &&
               (this.orientation < 4)) {
        this.nexttileX = this.tileX + 1;
        
        if (this.nexttileX > world.width-1) {
            this.nexttileX -= 1;
        }
    }
};

unit.prototype.moveAway = function () {
    if (!this.visible) return;

    if ((Math.abs(this.targetX - this.cx) < 2) &&
        (Math.abs(this.targetY - this.cy) < 2)) {

        var freeTile = world.findNearestFreeTile(this.tileX, this.tileY);
        
        if (!(freeTile === 0)) {
            this.targetX = freeTile.tileX * 32 + 16;
            this.targetY = freeTile.tileY * 32 + 16;
        }

    }

    if (this.targetX === this.cx) {
        this.velX = 0;
    } else {
        this.velX = (this.targetX - this.cx) / Math.abs(this.targetX - this.cx);
    }
    this.nexttileX = this.tileX + this.velX;
    this.nextX = this.nexttileX * 32 + 16;
    if (this.targetY === this.cy) {
        this.velY = 0;
    } else {
        this.velY = (this.targetY - this.cy) / Math.abs(this.targetY - this.cy);
    }
    this.nexttileY = this.tileY + this.velY;
    this.nextY = this.nexttileY * 32 + 16;

    this.updateOrientation(this.velX, this.velY);

    var norm = this.normalizeVelocity();

    this.velX *= norm;
    this.velY *= norm;
};

unit.prototype.findOurHall = function(tileX, tileY) {

    // We search the nearest town halls, strongholds and fortresses...

    var ourhall = entityManager.findNearestEntityOf(this.belongsTo, 100,
                                                    this.tileX, this.tileY);
    var ourstronghold = entityManager.findNearestEntityOf(this.belongsTo, 101,
                                                    this.tileX, this.tileY);
    var ourfortress = entityManager.findNearestEntityOf(this.belongsTo, 102,
                                                    this.tileX, this.tileY);

    // We might also be interested in lumber mills or refineries...

    var ourlumbermill = 0;

    if (this.harvestedLumber > 0) {
        ourlumbermill = entityManager.findNearestEntityOf(this.belongsTo, 105,
                                                    this.tileX, this.tileY);
    }
    
    var ourrefinery = 0;

    if (this.harvestedOil > 0) {
        ourrefinery = entityManager.findNearestEntityOf(this.belongsTo, 113,
                                                    this.tileX, this.tileY);
    }

    // And now which one of these might be the closest?

    return entityManager.getNearestEntityOf([ourhall, ourstronghold, ourfortress,
                                             ourlumbermill, ourrefinery],
                                             this.tileX, this.tileY);
};

unit.prototype.harvestreturn = function() {

    var ourhall = this.findOurHall(this.tileX, this.tileY);

    if (ourhall === 0) {
        // We don't seem to have an town halls right now.
        // So we stop and wait. =)
        this.curAction = 1;
        this.curSubAction = 0;
    } else {
        // We run somewhere into the middle of our home. =)
        // (Actually into the middle of the upper right of
        // the four middlemost tiles of our home...)
        this.targetX = ourhall.tileX * 32 + 48;
        this.targetY = ourhall.tileY * 32 + 48;
    
        this.nexttileX = this.tileX;
        this.nexttileY = this.tileY;
        
        this.nextX = this.nexttileX * 32 + 16;
        this.nextY = this.nexttileY * 32 + 16;

        this.velX = 0;
        this.velY = 0;
        
        this.home = ourhall;
    
        this.curAction = 4;
        this.curSubAction = 2; // let's move! =)
    }
};

unit.prototype.findEnemy = function () {
    this.curEnemy = entityManager.findNearestOpposingEntity(
                        this.belongsTo, this.tileX, this.tileY);

    if (!(this.curEnemy === 0)) {
        var cE = this.curEnemy,
            dist = (cE.tileX-this.tileX)*(cE.tileX-this.tileX) +
                   (cE.tileY-this.tileY)*(cE.tileY-this.tileY);
    }
 
    if ((this.curEnemy === 0) ||
        (dist > (this.sight + 1)*(this.sight + 1))) {
        this.curEnemy = 0;

        if ((this.curAction === 2) && (this.curSubAction < 2)) {
            if (player.p[this.belongsTo].aggressive) {
                this.curAction = 7;
                this.curSubAction = 0;
            } else {
                this.curAction = 1;
            }
            this.targetX = this.tileX * 32 + 16;
            this.targetY = this.tileY * 32 + 16;
        }
    } else {
        this.targetX = cE.tileX * 32 + 16;
        this.targetY = cE.tileY * 32 + 16;
        
        this.nextX = this.cx;
        this.nextY = this.cy;
        
        this.velX = 0;
        this.velY = 0;
        
        this.curAction = 2;
        this.curSubAction = 0;
    }
};

unit.prototype.attackIfEnemyInRange = function () {
    var result = !((this.curEnemy.tileX - this.tileX)*(this.curEnemy.tileX - this.tileX) +
                   (this.curEnemy.tileY - this.tileY)*(this.curEnemy.tileY - this.tileY) >
                   2*(this.range*this.range));

    if (result) {
        this.targetX = this.tileX * 32 + 16;
        this.targetY = this.tileY * 32 + 16;
        
        // do the actual attacking
        this.curSubAction = 1;
    }

    return result;
};

unit.prototype.moveToEnemy = function () {
    if (!this.attackIfEnemyInRange()) {
        // if we are standing still for an attack,
        // but our enemy moved away, follow him!
        
        this.targetX = this.curEnemy.tileX * 32 + 16;
        this.targetY = this.curEnemy.tileY * 32 + 16;
        
        this.nextX = this.cx;
        this.nextY = this.cy;
        this.velX = 0;
        this.velY = 0;
        
        this.curSubAction = 0;
        
        return true;
    }
    return false;
};

unit.prototype.findHarvestable = function () {
    var ournexttarget = this.goldmine;

    if ((ournexttarget === 0) || (ournexttarget._isDeadNow)) {
        ournexttarget = world.findNearestHarvestable(this.tileX, this.tileY);

        var dist = (ournexttarget.tileX-this.tileX)*(ournexttarget.tileX-this.tileX) +
                   (ournexttarget.tileY-this.tileY)*(ournexttarget.tileY-this.tileY);

        if (dist > (this.sight + 1)*(this.sight + 1)) {
            ournexttarget = 0;
        }
    }

    if (ournexttarget === 0) {
        this.curAction = 1; // stop - no tile can be found
    } else {
        this.targetX = ournexttarget.tileX * 32 + 16;
        this.targetY = ournexttarget.tileY * 32 + 16;
    }
};

unit.prototype.processOrderAsUnit = function(order) {
    if ((order.name === 'move') || (order.name === 'attack') || (order.name === 'harvest')) {
        console.log('processing ' + order.name + ' order to', order.targetX, order.targetY);
        this.targetX = order.targetX;
        this.targetY = order.targetY;

        this.nexttileX = this.tileX;
        this.nexttileY = this.tileY;
        
        this.nextX = this.nexttileX * 32 + 16;
        this.nextY = this.nexttileY * 32 + 16;

        this.velX = 0;
        this.velY = 0;
        
        if (order.name === 'attack') {
            this.curAction = 2;

            this.curEnemy = entityManager.findEntityInTile(
                                Math.floor(order.targetX / 32), Math.floor(order.targetY / 32));

            if ((this.curEnemy === 0) || (this.curEnemy._isDeadNow)) {
                this.curSubAction = 2; // here, 0 is the normal move-to-action,
                                       // but we want to take 2 instead as override-move-to,
                                       // as the normal move-to will revert to no movement
                                       // if there is no enemy specified
            } else {
                this.curSubAction = 0;
            }
        } else if (order.name === 'harvest') {
            this.curAction = 4;

            this.curSubAction = 0;
        } else {
            if ((this.curAction === 2) && (this.curSubAction === 1)) {
                this.ignoreEnemy = true;
            }

            this.curAction = 0;

            this.curSubAction = 0;
        }
    } else if (order.name === 'build') {
        // order.addInfo contains the action-number that corresponds to the building
        // we want to create
        console.log('processing ' + order.name + ' order to', order.targetX,
                    order.targetY, 'and with info', order.addInfo);

        this.targetX = order.targetX;
        this.targetY = order.targetY;

        this.nexttileX = this.tileX;
        this.nexttileY = this.tileY;
        
        this.nextX = this.nexttileX * 32 + 16;
        this.nextY = this.nexttileY * 32 + 16;

        this.velX = 0;
        this.velY = 0;

        this.curAction = order.addInfo;
        this.curSubAction = 1;
    } else if ((order.name === 'stop') || (order.name === 'preptobuild')) {
        console.log('processing ' + order.name + ' order');
        this.targetX = this.nexttileX * 32 + 16;
        this.targetY = this.nexttileY * 32 + 16;

        this.velX = 0;
        this.velY = 0;

        if (order.name === 'preptobuild') {
            this.curAction = order.addInfo;
            this.curSubAction = 2;
        } else {
            this.curAction = 1;
        }
    } else if (order.name === 'harvestreturn') {
        this.harvestreturn();
    } else if (order.name === 'inchp') { // used to heal and to attack
        // Attack back!
        // Though only if we don't have another enemy yet, or are not attacking that other one,
        // or cannot attack, or the order was actually healing, or we are under friendly fire.
        if (((this.curEnemy === 0) || (this.curEnemy._isDeadNow) || (this.curAction !== 2)) &&
            this.actions[2] && (order.hp < 0) && (order.origPlayer !== this.belongsTo) &&
            !this.ignoreEnemy) {

            var cE = entityManager.getEntityFromMID(order.origPlayer, order.origmid);
            
            if (cE !== 0) {
                this.curEnemy = cE;
                this.curAction = 2;
                this.moveToEnemy();
            }

            // var cE = entityManager.findNearestOpposingEntity(
            //                     this.belongsTo,
            //                     order.origtileX,
            //                     order.origtileY);
            // 
            // var visibleRange = (this.sight + 1)*(this.sight + 1);
            // var distance = (this.tileX - cE.tileX)*(this.tileX - cE.tileX) +
            //                (this.tileY - cE.tileY)*(this.tileY - cE.tileY);
            // 
            // if (visibleRange >= distance) {
            //     this.curEnemy = cE;
            //     this.curAction = 2;
            //     this.moveToEnemy();
            // }
        }
    } else if (order.name === 'standground') { // stand our ground / defend
        this.curAction = 7;
        this.curSubAction = 0;
        
        this.stopMoving();
    } else if (order.name === 'sheepmissile') {
        console.log('processing ' + order.name + ' order to', order.targetX, order.targetY);

        this.velX = 0;
        this.velY = 0;

        this.nexttileX = this.tileX;
        this.nexttileY = this.tileY;
        
        this.nextX = this.nexttileX * 32 + 16;
        this.nextY = this.nexttileY * 32 + 16;
        
        this.curAction = 2;

        this.curEnemy = entityManager.findEntityInTile(
                                Math.floor(order.targetX / 32), Math.floor(order.targetY / 32));

        if (!((this.curEnemy === 0) || (this.curEnemy._isDeadNow))) {
            Missile(this, curEnemy, 50);
        }
    }
};

unit.prototype.sendTargetedCommand = function (cmd, kindOfCross, addInfo) {

    // If we select an enemy unit - which we actually can do, and that is
    // intended to e.g. see how much HP the unit has left - and send that
    // unit a command, then it should not obey. ;)
    if (!(this.belongsTo === player.myID)) return;

    // these are guaranteed to be valid coordinates within the map;
    // sanity checking is already done in mouse.js
    var tX = mouse.tileX() * 32 + 16;
    var tY = mouse.tileY() * 32 + 16;

    var ourdetails = {
                         name: cmd,
                         targetX: tX,
                         targetY: tY
                     };

    if (addInfo) {
        ourdetails.addInfo = addInfo;
    }

    sendCommand(this.mid, ourdetails, this.belongsTo);
    
    cross.show(kindOfCross);

    entityManager.nextPressActionInNextFrame = -1;
    
    SOUND.playForAcknowledgingEntity(this.race, this.type);
};

unit.prototype.canBuildEntityAt = function(race, buildtype, mx, my) {

    var buildable = 2, // 2 .. great, 1 .. maybe, 0 .. no way
        buildsize = entityList.sizes[race][buildtype],
        up = Math.min(buildsize[0] + mx, world.width),
        dn = Math.min(buildsize[1] + my, world.height);

    for (var i = mx; i < up; i++) {
        for (var j = my; j < dn; j++) {
            if (world.tilesVisible[i+1][j+1] === 2) {
                if ((world.tilesFree[i][j] > 0) &&
                    !((this.tileX === i) && (this.tileY === j))) {
                    return 0;
                }
            } else if (buildable > 1) {
                buildable = 1;
            }
        }
    }
    
    return buildable;
};

// Get next best tile...
unit.prototype.getBestFromOpenList = function (openListNodes) {
    var bestNode = [],
        j = 0;

    two:
    for (var i = 0; i < world.width; i++) {
        for (var u = 0; u < world.height; u++) {
            // if there is a tile in the open list..
            if (openListNodes[i][u]) {
                // Make that node the current best node
                bestNode = openListNodes[i][u];
                
                j = i;

                break two;
            }
        }
    }

    // find the cost of the current best tile
    var tempCost = bestNode[4] + bestNode[5];

    for (; j < world.width; j++) {
        for (var k = 0; k < world.height; k++) {
            // if that cost is higher than the cost of tile being checked then...
            if (openListNodes[j][k] && ((openListNodes[j][k][4] + openListNodes[j][k][5]) < tempCost)) {
                // ... make the tile being checked the current best tile.
                bestNode = openListNodes[j][k];
                tempCost = bestNode[4] + bestNode[5];
            }
        }
    }

    return bestNode;
};

// ********** This text is old and kept for nostalgia's sake. =)
// ********** There's only Route Finding now (no "simple/stupid" pathfinding).

// By default, we don't do path finding, but we want to switch it off if we
// bump into something of importance.
// However, the "path finding" that we are talking about here is
// the minimal path finding - that is, go around tiles that suddenly
// appear in your path. The actual route finding happens earlier,
// and if it is activated then the following stuff shouldn't have
// much to do - except for the case in which we actually want to
// enter a blocked tile, such as going to harvest, etc.

// var doPathFinding = false;
// **********
// **********

			
var findingNewFinalTile = 0;
unit.prototype.addOneTile = function (nodeX, nodeY, ornodeX, ornodeY, finalX, finalY, closedLi, openLi, newG) {

	if (findingNewFinalTile === 0) {
		if (0 === world.tilesFreeReadSafe(nodeX, nodeY)) {

			// if tile is not in closed list... only then do we want to do anything at all.
			if (closedLi[nodeX][nodeY] === 0) {

				// if tile is not in open list... then add to openLi
				if (!openLi[nodeX][nodeY]) {

					// calculate heuristics
					var tilesAway = (Math.abs(nodeX - finalX) + Math.abs(nodeY - finalY))*10;

					// add tile to open list
					openLi[nodeX][nodeY] = [nodeX, nodeY, ornodeX, ornodeY, newG, tilesAway];
				}

				// if tile is in openLi check if route from nodeX, nodeY is better than from
				// previous parent tile. If yes then make nodeX, nodeY parents and recalc G.
				else if (newG < openLi[nodeX][nodeY][4]) {

					// calculate heuristics
					var tilesAway = Math.abs(nodeX - finalX) + Math.abs(nodeY - finalY)*10;

					// change parent of adjacent tile to this one (i.e. nodeX, nodeY).
					openLi[nodeX][nodeY] = [nodeX, nodeY, ornodeX, ornodeY, newG, tilesAway];
				}
			}
		}
	}
	else if (findingNewFinalTile === 1) {

		// if tile is not in closed list... only then do we want to do anything at all.
		if (closedLi[nodeX][nodeY] === 0) {

			// if tile is not in open list... then add to openLi
			if (!openLi[nodeX][nodeY]) {

				// calculate heuristics
				var tilesAway = (Math.abs(nodeX - finalX) + Math.abs(nodeY - finalY))*10;

				// add tile to open list
				openLi[nodeX][nodeY] = [nodeX, nodeY, ornodeX, ornodeY, newG, tilesAway];
			}

			// if tile is in openLi check if route from nodeX, nodeY is better than from
			// previous parent tile. If yes then make nodeX, nodeY parents and recalc G.
			else if (newG < openLi[nodeX][nodeY][4]) {

				// calculate heuristics
				var tilesAway = Math.abs(nodeX - finalX) + Math.abs(nodeY - finalY)*10;

				// change parent of adjacent tile to this one (i.e. nodeX, nodeY).
				openLi[nodeX][nodeY] = [nodeX, nodeY, ornodeX, ornodeY, newG, tilesAway];
			}
		}
	}
};

unit.prototype.RoutefindingAl = function() {
	var openL = [];
	var closedL = [];
	var finalX = Math.floor(this.targetX / 32);
	var finalY = Math.floor(this.targetY / 32);
	var firstTileX = this.tileX;
	var firstTileY = this.tileY;
	var currentTileX = firstTileX;  // the current best tileX on the path to the targetX tile
	var currentTileY = firstTileY;  // the current best tileY on the path to the targetY tile
	var currentFinalX = finalX;
	var currentFinalY = finalY;
	var openFinalL = [];
	var closedFinalL = [];
	var foundEnd = 0;
	var arrForSecondLast = [[finalX, finalY], [currentFinalX, currentFinalY]];
	

	for (var i=0; i < world.width; i++) {
		openL[i] = [];
		closedL[i] = [];
		openFinalL[i] = [];
		closedFinalL[i] = [];
		for (var u=0; u < world.height; u++) {
			closedL[i][u] = 0;
			closedFinalL[i][u] = 0;
		}
	}
	
	var tilesAway = (Math.abs(firstTileX - finalX) + Math.abs((firstTileY) - finalY))*10;
	
	// if finalX/Y is impassable.. find nearest passable tile and make that the final tile.
	// here....
	// Unless harvesting. Then find the nearest tile in harvestable resource and make that
	// the final tile.
	

	if (world.tilesFreeReadSafe(currentFinalX, currentFinalY) !== 0) {
		findingNewFinalTile = 1;
		openFinalL[finalX][finalY] = [finalX, finalY, finalX, finalY, 0, tilesAway];
		openFinalL = this.addToOpenList(finalX, finalY, firstTileX,
										firstTileY, closedFinalL, openFinalL);
		closedFinalL[finalX][finalY] = openFinalL[finalX][finalY];
		openFinalL[finalX][finalY] = undefined;
		
		while (world.tilesFreeReadSafe(currentFinalX, currentFinalY) !== 0) {
		
			if ((Math.abs(currentTileX-currentFinalX) < 2) && (Math.abs(currentTileY-currentFinalY) < 2)){
				foundEnd = 1;
				break;
			}
			
			var nextTile = this.getBestFromOpenList(openFinalL);   // step 3.5 -- finding next best tile
			currentFinalX = nextTile[0];
			currentFinalY = nextTile[1];
			
			arrForSecondLast.push([currentFinalX, currentFinalY]);
			
			// putting next best tile in the path into the closed list, and remove from open list
			closedFinalL[currentFinalX][currentFinalY] = openFinalL[currentFinalX][currentFinalY]; // step 4
			openFinalL[currentFinalX][currentFinalY] = undefined; // step 4
			
			// add the usable tiles around the next best tile to the open list
			openFinalL = this.addToOpenList(currentFinalX, currentFinalY,
											firstTileX, firstTileY,
											closedFinalL, openFinalL);
											// step 5 and 6

			world.openFinalL = openFinalL;
			world.closedFinalL = closedFinalL;
		}
		if (foundEnd === 0) {
			finalX = currentFinalX;
			finalY = currentFinalY;
		}
		else {
			finalX = this.tileX;
			finalY = this.tileY;
			if (this.curAction = 4) {
				var arrLen = arrForSecondLast.length-2;
				this.nexttileX = arrForSecondLast[arrLen][0];
				this.nexttileY = arrForSecondLast[arrLen][1];
				
				var ourmine = entityManager.findNearestEntityOf(player.neutralID, 200,
                                                    this.tileX, this.tileY);
				
				if ((this.nexttileX > ourmine.tileX - 1) &&  // it's just weird behaviour regarding harvesting
					(this.nexttileX < ourmine.tileX + 3) &&  // forest or mines. So this is just a little
					(this.nexttileY > ourmine.tileY - 1) &&  // ugly hack around that.
					(this.nexttileY < ourmine.tileY + 3)) {
					
					arrLen = arrForSecondLast.length-1;
					this.nexttileX = arrForSecondLast[arrLen][0];
					this.nexttileY = arrForSecondLast[arrLen][1];
				}
				
				finalX = this.nexttileX;
				finalY = this.nexttileY;
				arrForSecondLast = [[finalX, finalY], [currentFinalX, currentFinalY]];
			}
		}
		findingNewFinalTile = 0;
	}
	
	// our unit tile's: posX, posY, parentX, parentY, G, H (G = one tile move cost. H = heuristic)
	openL[firstTileX][firstTileY] = [firstTileX, firstTileY, firstTileX, firstTileY, 0, tilesAway];
	// ^step 1
	
	// add the tiles surrounding the first to the open list.
	openL = this.addToOpenList(firstTileX, firstTileY, finalX, finalY, closedL, openL);     // step 2
	
	// put the first tile on the closed list and remove from open list
	closedL[firstTileX][firstTileY] = openL[firstTileX][firstTileY];   // step 3
	openL[firstTileX][firstTileY] = undefined;                           // step 3

		// ----  Create loop to iterate calls to functions here.
		
	var doItOneMoreTimePlease = 10000;

	// while the current tile (that is the current best tile on the path to the target tile)
	// is not the final target tile we continue searching
	while (doItOneMoreTimePlease > 0) {
	
		doItOneMoreTimePlease--;
		if (doItOneMoreTimePlease === 0) {
			console.log("FAILURE TO CALCULATE PATH!");
			break;
		}
		if (!(this.curSubAction === 1)) {
			for (var i=0; i < world.width; i++) {
				for (var u=0; u < world.height; u++) {
					if (openL[i][u] && !(closedL[i][u] === 0)) {
						world.drawOverlay[i][u] = "#ffff00";
					} else if (openL[i][u]) {
						world.drawOverlay[i][u] = "#ff0000";
					} else if (!(closedL[i][u] === 0)) {
						world.drawOverlay[i][u] = "#00ff00";
					} else {
						world.drawOverlay[i][u] = "#ffffff";
					}
				}
			}
		}
		
		if ((Math.abs(this.tileX-finalX) < 2) && (Math.abs(this.tileY-finalY) < 2) && this.curAction === 4 && ((this.names == "Peon") || (this.names == "Peasant"))){
			this.nexttileX = finalX;
			this.nexttileY = finalY;
			// console.log("finalX: " + finalX + "  finalY: " + finalY + "  -- this.nexttileX: " + this.nexttileX + "  this.nexttileY: " + this.nexttileY);
			break;
		}
		else if ((Math.abs(this.tileX-finalX) < 2) && (Math.abs(this.tileY-finalY) < 2) && this.curAction === 4) {
			this.velX = 0;
			this.velY = 0;
			this.nexttileX = this.tileX;
			this.nexttileY = this.tileY;
			break
		}
		
		
		if ((Math.abs(currentTileX-firstTileX)*2 +
		Math.abs(currentTileY-firstTileY)*2) <
		(tilesAway/5)*2) {

			// The exit of the path-finding:
			// checks if final tile is in the closed list or no path possible and sets the unit moving
			// if there is a path or makes him still if there is none.
			var openListIsEmpty = 1;

			// see if there is something in the open list, then
			two:
			for (var i=0; i < world.width; i++) {
				for (var u=0; u < world.height; u++) {
					if (openL[i][u]) {
						openListIsEmpty = 0;
						break two;
					}
				}
			}

			// if final tile is in closed list:
			if (closedL[finalX][finalY] !== 0) {
				// the best path is now found. Deal with it.
				// We just want to move one tile at a time and then run the code again every tile.
				// so, cycle back to the first tile and make unit move to the best tile from there.
				var parentX = finalX;
				var parentY = finalY;

				while (!((closedL[parentX][parentY][2] === firstTileX) &&
						 (closedL[parentX][parentY][3] === firstTileY))) {
					var pX = closedL[parentX][parentY][2];
					parentY = closedL[parentX][parentY][3];
					parentX = pX;
				}
				this.nexttileX = parentX;
				this.nexttileY = parentY;
				this.velX = this.nexttileX - this.tileX;
				this.velY = this.nexttileY - this.tileY;

				break;
			}
			
			// if final tile is not in the closed list AND openLi is empty
			if (closedL[finalX][finalY] === 0 && openListIsEmpty === 1) {
				// means we've checked all tiles and no path is possible.. Set velX, velY to 0.
				this.velX = 0;
				this.velY = 0;
				this.nexttileX = this.tileX;
				this.nexttileY = this.tileY;
				break;
			}
			
			var nextTile = this.getBestFromOpenList(openL);   // step 3.5 -- finding next best tile

			currentTileX = nextTile[0];
			currentTileY = nextTile[1];
			
			// putting next best tile in the path into the closed list, and remove from open list
			closedL[currentTileX][currentTileY] = openL[currentTileX][currentTileY];  // step 4
			openL[currentTileX][currentTileY] = undefined;                                // step 4
			
			// add the usable tiles around the next best tile to the open list
			openL = this.addToOpenList(currentTileX, currentTileY, finalX, finalY, closedL, openL);    // step 5 and 6

			world.openL = openL;
			world.closedL = closedL;
		}
		else {
			console.log("set to not move cause can't reach tile");
			this.velX = 0;
			this.velY = 0;
			this.nexttileX = this.tileX;
			this.nexttileY = this.tileY;
			this.targetX = this.tileX*32+16;
			this.targetY = this.tileY*32+16;
			finalX = this.tileX;
			finalY = this.tileY;
			break;
		}
	}
	// end of loop
};

unit.prototype.addToOpenList = function (nodeX, nodeY, finalX, finalY, closedLi, openLi) {
    var ourOpenTile = openLi[nodeX][nodeY];

    if (!ourOpenTile) {
       ourOpenTile = closedLi[nodeX][nodeY];
    }

    this.addOneTile(nodeX    , nodeY - 1, nodeX, nodeY, finalX, finalY, closedLi, openLi, ourOpenTile[4] + 10);
    this.addOneTile(nodeX + 1, nodeY - 1, nodeX, nodeY, finalX, finalY, closedLi, openLi, ourOpenTile[4] + 14);
    this.addOneTile(nodeX + 1, nodeY    , nodeX, nodeY, finalX, finalY, closedLi, openLi, ourOpenTile[4] + 10);
    this.addOneTile(nodeX + 1, nodeY + 1, nodeX, nodeY, finalX, finalY, closedLi, openLi, ourOpenTile[4] + 14);
    this.addOneTile(nodeX    , nodeY + 1, nodeX, nodeY, finalX, finalY, closedLi, openLi, ourOpenTile[4] + 10);
    this.addOneTile(nodeX - 1, nodeY + 1, nodeX, nodeY, finalX, finalY, closedLi, openLi, ourOpenTile[4] + 14);
    this.addOneTile(nodeX - 1, nodeY    , nodeX, nodeY, finalX, finalY, closedLi, openLi, ourOpenTile[4] + 10);
    this.addOneTile(nodeX - 1, nodeY - 1, nodeX, nodeY, finalX, finalY, closedLi, openLi, ourOpenTile[4] + 14);
    
    return openLi;
};

/*
// Helps with debugging. If any trouble arises, uncomment and call in suspect places.
// Then check the console in the browser
unit.prototype.printOpenL = function(openL) {

    console.log("openL: ");

    for (var i=0; i<world.width; i++) {
        for (var u=0; u<world.height; u++) {
            if (openL[i][u]) {
                console.log(i + ", " + u);
            }
        }
    }
};
*/

unit.prototype.update = function (du) {
    if (this._isDeadNow || (this.hp <= 0)) {
        this.hp = 0; // just in case this is drawn somewhere as health bar,
                     // we don't want it to go on to the negative side =)

        SOUND.playForDeath(this.race, this.type);
        
        return entityManager.KILL_ME_NOW;
    }
	
	
    
    // This should be independent of the player who the entity belongs to!
    var me = player.p[this.belongsTo];

    // We reset the sprite to normal, assuming that nothing
    // of importance is going on. If it is, it will be set
    // to the according value later on.
    this.sprite = this.sprite_normal;

    // We are not interested in keeping the offsets, as right now we actually
    // are in the correct game-logic-step.
    this.renderOffX = 0;
    this.renderOffY = 0;
    this.renderOffcurPoseF = 0;
    this.renderTime = (new Date()).getTime();
    
    // Just some cleanup in case the previous action didn't end nicely
    // on subaction 0. This is important, because at subaction 1 our
    // animation continues to be drawn even without movement.
    if (this.curAction === 1) {
        this.curSubAction = 0;
    }

    if (this.visible) {

        // magic numbers: only do this inside the frame
        var isInScreen = (mouse.X > 176) && (mouse.X < 624) &&
                         (mouse.Y > 16) && (mouse.Y < 464);
        var wasInScreen = (mouse.dX > 176) && (mouse.dX < 624) &&
                          (mouse.dY > 16) && (mouse.dY < 464);
        var mousePressing = (mouse.pressRightInterval || (mouse.pressUpInterval &&
            wasInScreen)) && isInScreen && this.selected;
        var mousePressingRight = mouse.pressRightInterval && isInScreen && this.selected;
    
        // tell our entity to do *something*
        if (mousePressingRight && (entityManager.nextPressAction === -1)) {
            var sentCommand = false;

            if (this.actions[4]) { // harvesting
                if ((this.harvestedGold <= 0) &&
                    (this.harvestedLumber <= 0) &&
                    (this.harvestedOil <= 0)) {
    
                    var ourmine = entityManager.findNearestEntityOf(
                                      player.neutralID, 200,
                                      mouse.tileX(), mouse.tileY());
        
                    if (!(ourmine === 0)) {
                        if ((mouse.tileX() > ourmine.tileX - 1) &&
                            (mouse.tileX() < ourmine.tileX + 3) &&
                            (mouse.tileY() > ourmine.tileY - 1) &&
                            (mouse.tileY() < ourmine.tileY + 3)) {
                            this.sendTargetedCommand('harvest', 0);

                            sentCommand = true;
                        }
                    }
            
                    if (!sentCommand) {
                        if (world.isHarvestable(mouse.tileX(), mouse.tileY())) {
                            this.sendTargetedCommand('harvest', 0);
                        
                            sentCommand = true;
                        }
                    }
                } else {
                    var ourhall = this.findOurHall(mouse.tileX(), mouse.tileY());

                    if (!(ourhall === 0)) {
                        if ((mouse.tileX() > ourhall.tileX - 1) &&
                            (mouse.tileX() < ourhall.tileX + 4) &&
                            (mouse.tileY() > ourhall.tileY - 1) &&
                            (mouse.tileY() < ourhall.tileY + 4)) {

                            sendCommand(this.mid, {name: "harvestreturn"}, this.belongsTo);
                            sentCommand = true;

                            cross.show(0);
                        }
                    }
                }
            }
            
            if (this.actions[2] && !sentCommand) { // attacking, only if we cannot harvest the tile
                var findEnemy = entityManager.findEntityInTile(mouse.tileX(), mouse.tileY());
                
                if (!(findEnemy === 0)) {
                    if (!((findEnemy.belongsTo === player.myID) ||
                        (findEnemy.belongsTo === player.neutralID))) {
                        this.sendTargetedCommand('attack', 1);
            
                        sentCommand = true;
                    }
                }
            }

            if (!sentCommand) {
                this.sendTargetedCommand('move', 0);
            }
        }
    
        // tell our entity to move
        if (mousePressing && (entityManager.nextPressAction === 0)) {
            this.sendTargetedCommand('move', 0);
        }
    
        // tell our entity to attack
        if (mousePressing && (entityManager.nextPressAction === 2)) {
            this.sendTargetedCommand('attack', 1);
        }
    
        // tell our entity to harvest
        if (mousePressing && (entityManager.nextPressAction === 4)) {
            this.sendTargetedCommand('harvest', 0);
        }
        
        // Sheep missile
        if (mousePressing && (entityManager.nextPressAction === 34)) {
            this.sendTargetedCommand('sheepmissile', 0);
        }
        
        // if we want to find a nice place for building a basic structure,
        // then we should display the buildRect from world! =)
        if (isInScreen && this.selected &&
            (action.pageOne[entityManager.nextPressAction] ||
             action.pageTwo[entityManager.nextPressAction])) {

            world.buildRect.visible = true;

            var buildtype = action.actionToEntityType[entityManager.nextPressAction],
                buildsize = entityList.sizes[this.race][buildtype],
                mx = mouse.tileX(),
                my = mouse.tileY();

            var buildable = this.canBuildEntityAt(this.race, buildtype, mx, my);

            world.buildRect.width = buildsize[0] * 32;
            world.buildRect.height = buildsize[1] * 32;
            world.buildRect.left = mx * 32;
            world.buildRect.top = my * 32;

            var somecolors = ["#ff0000", "#ffff00", "#00ff00"];
            
            world.buildRect.color = somecolors[buildable];
            
            // tell our entity to build a basic structure
            if (mousePressing && (buildable > 0)) {
                this.sendTargetedCommand('build', 0, entityManager.nextPressAction);
            }
        }
    }

    // actually move, if we are not already at our target position
    if ((this.targetX === this.cx) && (this.targetY === this.cy)) {

        // we reset this one... we only wanted to ignore the enemies while
        // walking away from them, but now that we're at our target position,
        // we revert to the usual behavior
        this.ignoreEnemy = false;

        // TODO :: we want this to happen whenever in reach of the building to be built
        if ((action.pageOne[this.curAction] || action.pageTwo[this.curAction]) &&
            (this.curSubAction === 1)) {
            // we want to build something and we arrived at the location
            // where we want to build... so, let's build! =)

            var buildtype = action.actionToEntityType[this.curAction],
                ourcosts = entityList.costs[this.race][buildtype];
        
            // if all else fails, we stop - otherwise, we'll overwrite this one
            this.curAction = 1;
            
            if (this.selected) {
                entityManager.actionPage = 0;
            }

            if (player.p[this.belongsTo].gold < ourcosts[0]) {
                if (this.belongsTo === player.myID) {
                    g_sprites.message("Not enough gold.", 2);
                }
            } else if (player.p[this.belongsTo].lumber < ourcosts[1]) {
                if (this.belongsTo === player.myID) {
                    g_sprites.message("Not enough lumber.", 2);
                }
            } else if (player.p[this.belongsTo].oil < ourcosts[2]) {
                if (this.belongsTo === player.myID) {
                    g_sprites.message("Not enough oil.", 2);
                }
            } else {

                if (this.canBuildEntityAt(this.race, buildtype,
                    this.tileX, this.tileY) === 2) {

                    player.p[this.belongsTo].gold -= ourcosts[0];
                    player.p[this.belongsTo].lumber -= ourcosts[1];
                    player.p[this.belongsTo].oil -= ourcosts[2];

                    var curEnt = entityManager.generateUnit({
                        type : buildtype,
                        race : this.race,
                        tileX : this.tileX,
                        tileY : this.tileY
                    }, this.belongsTo);
                    
                    // we start low, alright?
                    curEnt.hp = 1;
                    curEnt.highestSprite = 1;

                    this.visible = false;
                    curEnt.peonsInside += 1;

                    this.curBuilding = curEnt;

                    this.tileX = curEnt.tileX + Math.floor(curEnt.tilewidth / 2);
                    this.tileY = curEnt.tileY + Math.floor(curEnt.tileheight / 2);
                    this.cx = this.tileX * 32 + 16;
                    this.cy = this.tileY * 32 + 16;
                    this.targetX = this.cx;
                    this.targetY = this.cy;

                    // do the actual building over time
                    this.curAction = 5;
                    this.curSubAction = 1;
                }
            }
        } else if ((this.curAction === 4) && (this.curSubAction < 2)) {
            this.findHarvestable();
        } else if (this.curAction === 2) {
            if ((this.curEnemy === 0) || (this.curEnemy._isDeadNow) ||
                ((this.curEnemy.id === this.id) && (this.curEnemy.belongsTo === this.belongsTo))) {
                this.findEnemy();
            } else {
                this.moveToEnemy();
            }
        } else if (this.curAction === 7) {
            this.findEnemy();
        } else if (this.curSubAction === 0) {
            this.curAction = 1; // simply stop; we arrived at the target,
                                // so the reason why we came here - e.g. attacking,
                                // resource harvesting etc. - seems to not exist anymore
        }

        this.velX = 0;
        this.velY = 0;
        
        if (!this.isFlying) {
            world.setTilesFree(this.tileX, this.tileY, 5);
        }
    } else {
        if ((Math.abs(this.targetX - this.cx) < 2) &&
            (Math.abs(this.targetY - this.cy) < 2)) {
            this.cx = this.targetX;
            this.cy = this.targetY;
            this.velX = 0;
            this.velY = 0;
        } else if (((Math.abs(this.nextX - this.cx) < 2) &&
                   (Math.abs(this.nextY - this.cy) < 2)) ||
                   ((this.velX === 0) && (this.velY === 0))) {
            // If we used the absence of a velocity to get in here,
            // then we should not reset cx and cy - otherwise we obtain
            // wonderful slipstream effects.
            if ((Math.abs(this.nextX - this.cx) < 2) &&
                (Math.abs(this.nextY - this.cy) < 2)) {
                this.cx = this.nextX;
                this.cy = this.nextY;
            }
			
			

            // we do route finding if route finding is activated,
            // otherwise we just use our "stupid approach"
            if (diagnostics.doRoutefinding) {
				
				if ((this.names == "Peon") || (this.names == "Peasant")) {
					if (this.curAction === 4) {
						if (this.curSubAction === 1) {}  // don't want the route finding active during the
														// actual harvesting. Mostly cause it messes up the
														// route finding overlay when other units move at same time.
						else this.RoutefindingAl();
					}
					else this.RoutefindingAl();
				}
				else this.RoutefindingAl();
				
			}
			else {
				// no pathfinding!
				this.velX = this.targetX - this.cx;
				this.velY = this.targetY - this.cy;
				}
            
            if (!((this.velX === 0) && (this.velY === 0))) {
                this.updateOrientation(this.velX, this.velY);
                this.nextTileFromOrientation();
            }
            
            // no need for pathfinding if every path is legitimate
            if (this.isFlying) {
				// diagnostics.doRoutefinding = false;   ??  Have this here?
            }

            if (world.tilesFree[this.nexttileX][this.nexttileY] > 0) {
                if (this.curAction === 2) { // attacking
                    if ((this.curSubAction === 0) || (this.curSubAction === 2)) {
                        if ((this.curEnemy === 0) || (this.curEnemy._isDeadNow)) {
                            this.findEnemy();
                        } else if (this.attackIfEnemyInRange()) {
							// diagnostics.doRoutefinding = false;   ??  Have this here?
                        }
                    }
                } else if (this.curAction === 4) { // harvesting
                    if (this.curSubAction === 0) {
                        var ourmine = entityManager.findNearestEntityOf(player.neutralID, 200,
                                                    this.tileX, this.tileY);

                        // we here want to check whether we should go gold mining
                        // magic number: 48 is the half-height and
                        // half-width of a gold mine in pixels

                        if ((!(ourmine === 0)) &&
                            (this.targetX > ourmine.cx - 48) &&
                            (this.targetX < ourmine.cx + 48) &&
                            (this.targetY > ourmine.cy - 48) &&
                            (this.targetY < ourmine.cy + 48) &&
                            (this.nexttileX > ourmine.tileX - 1) &&
                            (this.nexttileX < ourmine.tileX + 3) &&
                            (this.nexttileY > ourmine.tileY - 1) &&
                            (this.nexttileY < ourmine.tileY + 3)) {
                            // diagnostics.doRoutefinding = false;   ??  Have this here?

                            if (ourmine.goldLeft > 0) {
                            
                                this.visible = false;
                                ourmine.peonsInside += 1;
                             
                                this.goldmine = ourmine;

                                this.tileX = this.goldmine.tileX + 1;
                                this.tileY = this.goldmine.tileY + 1;
                                this.cx = this.tileX * 32 + 16;
                                this.cy = this.tileY * 32 + 16;
                                this.targetX = this.cx;
                                this.targetY = this.cy;
 
                                // do the actual harvesting
                                this.curSubAction = 1;
        
                            } else {
                                this.curAction = 1; // stop
                            }
                        } else if ((this.nexttileX * 32 + 16 === this.targetX) &&
                                   (this.nexttileY * 32 + 16 === this.targetY)) {
                            
                            this.goldmine = 0;
                            
                            this.targetX = this.tileX * 32 + 16;
                            this.targetY = this.tileY * 32 + 16;
        
                            // diagnostics.doRoutefinding = false;   ??  Have this here?

                            var wH = world.tilesHarvestable[this.nexttileX][this.nexttileY];
                            
                            if (world.isHarvestable(this.nexttileX, this.nexttileY)) {
                                // do the actual harvesting
                                this.curSubAction = 1;
                                
                                this.harvestAtX = this.nexttileX;
                                this.harvestAtY = this.nexttileY;
                            } else {
                                // We cannot harvest here, but maybe there is a place near
                                // us that works?
                                this.findHarvestable();
                            }
                        }
                    } else if ((this.curSubAction === 2) &&
                        (this.nexttileX * 32 + 16 - this.targetX > -48) &&
                        (this.nexttileX * 32 + 16 - this.targetX < 80) &&
                        (this.nexttileY * 32 + 16 - this.targetY > -48) &&
                        (this.nexttileY * 32 + 16 - this.targetY < 80)) {

                        // if the main hall that we were walking to has been destroyed while
                        // we were on our way, then we try to go to another main hall, or
                        // just stop if we cannot find any                        
                        if (this.home._isDeadNow) {
                            this.harvestreturn();
                        } else {
                            me.gold += Math.floor(this.harvestedGold + 0.5);
                            me.lumber += Math.floor(this.harvestedLumber + 0.5);
                            me.oil += Math.floor(this.harvestedOil + 0.5);
    
                            this.harvestedGold = 0;
                            this.harvestedLumber = 0;
                            this.harvestedOil = 0;
                            
                            var ournexttarget = 0;
                            
                            // diagnostics.doRoutefinding = false;   ??  Have this here?
    
                            if (this.goldmine === 0) {
                                ournexttarget = world.findNearestHarvestable(
                                                    this.harvestAtX, this.harvestAtY);
                            } else {
                                ournexttarget = entityManager.findNearestEntityOf(
                                                    player.neutralID, 200,
                                                    this.tileX, this.tileY);
                            }
                            
                            if (ournexttarget === 0) {
                                this.curAction = 1; // stop - no tile can be found
                            } else {
                                this.targetX = ournexttarget.tileX * 32 + 16;
                                this.targetY = ournexttarget.tileY * 32 + 16;
                                
                                this.nexttileX = this.tileX;
                                this.nexttileY = this.tileY;
                            }
    
                            // let's go back to the harvesting-place
                            this.curSubAction = 0;
                        }
                    }
                }
            }
			
            if ((world.tilesFree[this.nexttileX][this.nexttileY] === 0) || 
                (this.isFlying && (world.tilesFree[this.nexttileX][this.nexttileY] !== 6))) {
                // We base this on the actual pixel coordinates, as the user might have
                // initiated the movement from an invalid starting point between tiles!
                this.velX = this.nexttileX * 32 + 16 - this.cx;
                this.velY = this.nexttileY * 32 + 16 - this.cy;

                var norm = this.normalizeVelocity();

                this.velX *= norm;
                this.velY *= norm;
                
                if (!this.isFlying) {
                    world.setTilesFree(this.nexttileX, this.nexttileY, 4);
                    world.setTilesFree(this.tileX, this.tileY, 2);
                }
            } else {
                // We want to reset our own nexttile,
                // so that we don't request a tile that
                // we won't visit right now.
                this.nexttileX = this.tileX;
                this.nexttileY = this.tileY;
                world.setTilesFree(this.tileX, this.tileY, 3);
            }
            
            this.nextX = this.nexttileX * 32 + 16;
            this.nextY = this.nexttileY * 32 + 16;
        }
    }
    
    if (this.harvestedGold > 0) {
        this.sprite = this.sprite_gold;
    } else if (this.harvestedLumber > 0) {
        this.sprite = this.sprite_lumber;
    } else if (this.harvestedOil > 0) {
        this.sprite = this.sprite_oil;
    }
    
    if (this.curAction === 2) { // attack
        if ((this.curEnemy === 0) || (this.curEnemy._isDeadNow)) {
            // find the next enemy!
            this.findEnemy();
        }
        
        if (!(this.curEnemy === 0)) {
            this.attackIfEnemyInRange();
        }

        if ((this.curSubAction === 1) && !(this.curEnemy === 0)) {

            // only do this if we don't have to move
            // to the enemy because we're already there

            if (!this.moveToEnemy()) {

                // TODO :: this is a hack to now allow ground units
                // to attack flying units; however, it shouldn't be
                // based on the range and instead be based on another
                // attribute or something!
                if ((this.isFlying) ||
                   (!this.curEnemy.isFlying) ||
                   (this.range > 1)) {

                    this.sprite = this.sprite_attack;
    
                    this.updateOrientation(this.curEnemy.tileX - this.tileX,
                                           this.curEnemy.tileY - this.tileY);
        
                    // magic number: 0.03 defines how fast the attacking is happening
        
                    sendCommand(this.curEnemy.mid, {
                        name: 'inchp',
                        hp: - Math.max(
                                       0,
                                       util.randRange(this.damage_min, this.damage_max) - this.curEnemy.armor
                                      ) * du * 0.03,
                        origmid: this.mid,
                        origPlayer: this.belongsTo
                    }, this.curEnemy.belongsTo);

                } else {
                    this.curSubAction = 0;
                }
            }
        }
    } else if (this.curAction === 4) { // harvesting
        if (this.curSubAction === 1) {
            if (this.visible) { // true if we are mining a tile, e.g. a tree or a crystal
                this.sprite = this.sprite_attack;
    
                // check how much HP the tree still has, and slowly get it down
    
                var wH = world.tilesHarvestable[this.harvestAtX][this.harvestAtY],
                    tG = world.tilesGround[this.harvestAtX][this.harvestAtY],
                    // magic number: 0.001 defines how fast the harvesting is
                    dfu = du * 0.001;
    
                this.harvestedGold += me.harvestGold * Math.max(0, Math.min(dfu, wH.gold));
                wH.gold -= dfu;
    
                this.harvestedLumber += me.harvestLumber * Math.max(0, Math.min(dfu, wH.lumber));
                wH.lumber -= dfu;
    
                this.harvestedOil += me.harvestOil * Math.max(0, Math.min(dfu, wH.oil));
                wH.oil -= dfu;
    
                if ((wH.gold <= 0) && (wH.lumber <= 0) && (wH.oil <= 0)) {
                    if ((tG === 23) || (tG === 31)) {
                        world.tilesGround[this.harvestAtX][this.harvestAtY] = 15;
                    } else {
                        world.tilesGround[this.harvestAtX][this.harvestAtY] = 14;
                        world.recalculateTrees();
                    }
                    
                    world.tilesFree[this.harvestAtX][this.harvestAtY] = 0;
    
                    this.harvestreturn();
                }
            } else { // Gold mining! =)

                // magic number: 0.1 defines how fast the harvesting is
                var dfu = du * 0.1;
    
                this.harvestedGold += Math.max(0, Math.min(dfu, this.goldmine.goldLeft));
                this.goldmine.goldLeft -= dfu;

                // if we harvested more gold than we are allowed to,
                // or if there is no gold left in the mine,
                // or if the mine has been destroyed
                if ((this.harvestedGold >= me.harvestGold) ||
                    (this.goldmine.goldLeft <= 0) ||
                    (this.goldmine._isDeadNow)) {
                    this.visible = true;

                    this.harvestreturn();
                    
                    this.goldmine.peonsInside -= 1;
                    
                    this.tileX = this.nexttileX;
                    this.tileY = this.nexttileY;
                    this.cx = this.tileX * 32 + 16;
                    this.cy = this.tileY * 32 + 16;

                    // We want to be one pixel higher so that we get shuffled behind the
                    // gold mine when being rendered.
                    if (this.cy < this.goldmine.tileY * 32 + 49) {
                        this.cy -= 1;
                    }
                }
            }
        }
    } else if (this.curAction === 5) { // building
        if (this.curSubAction === 1) {

            var cuB = this.curBuilding;

            cuB.calculateBuildStep(du);

            // if we are done with the building,
            // or the building has been destroyed while we were working on it
            if ((cuB.hp >= cuB.maxhp) ||
                (cuB._isDeadNow)) {
                if (!cuB._isDeadNow) {
                    
                    if (this.belongsTo === player.myID) {
                        var ourname = cuB.names[0];

                        if (cuB.names.length > 1) {
                            ourname += " " + cuB.names[1];
                        }

                        g_sprites.message("A " + ourname + " was built.", player.me.race);
                        
                        SOUND.playForWorkCompleted(this.race, this.type);
                    }
                }

                this.visible = true;

                cuB.peonsInside -= 1;
                
                var nextFree = world.findNearestFreeTile(this.tileX, this.tileY);

                if (!(nextFree === 0)) {
                    this.tileX = nextFree.tileX;
                    this.tileY = nextFree.tileY;
                    
                    this.cx = this.tileX * 32 + 16;
                    this.cy = this.tileY * 32 + 16;
                    
                    this.stopMoving();
                }
                
                this.curAction = 1;
                this.curSubAction = 0;
            }
        }
    }

    // here is the animation, which only happens if we are moving (nonzero velocity) or
    // displaying a static animation (curSubStatus equal to 1)
    if ((this.velX !== 0) || (this.velY !== 0) || (this.curSubAction === 1)) {
        var prevX = this.cx,
            prevY = this.cy;
    
        // Do not overshoot!
        // 
        // This whole overshooting-block basically just abstracts the following
        // two lines of code:
        // 
        // this.cx += this.velX * du;
        // this.cy += this.velY * du;
        
        if (this.velX > 0) {
            this.cx = util.min(this.nextX, this.cx + this.velX * du);
        } else {
            this.cx = util.max(this.nextX, this.cx + this.velX * du);
        }
        if (this.velY > 0) {
            this.cy = util.min(this.nextY, this.cy + this.velY * du);
        } else {
            this.cy = util.max(this.nextY, this.cy + this.velY * du);
        }
        
        // WE DO NOT WALK INTO IMPASSABLE THINGS. PERIOD.
        // unless we already are on an impassable thing... then, well, whatever
        // or, alternatively, if we are flying... wooosh! =D
        if ((!this.isFlying) &&
            (world.tilesFreeReadSafe(Math.floor(this.cx / 32), Math.floor(this.cy / 32)) === 1) &&
            !(world.tilesFreeReadSafe(Math.floor(prevX / 32), Math.floor(prevY / 32), this) === 1)) {
            this.cx = prevX;
            this.cy = prevY;
        }
        
        // If an entity comes entangled in a state in which it wants
        // to move to its final position, but cannot since it only
        // has nonzero velocity in the wrong directions, then
        // we reset both velocities to 0 such that in the next logical
        // frame we get a re-evaluation of the velocities and the
        // local target (nextX, nextY).
        if ((this.curSubAction === 0) &&
            (((prevX === this.cx) || (this.velX === 0)) &&
            ((prevY === this.cy) || (this.velY === 0)))) {
            this.velX = 0;
            this.velY = 0;
            this.curPoseF = 1;
        }
        
        this.tileX = Math.floor(this.cx / 32);
        this.tileY = Math.floor(this.cy / 32);
    
        this.curPoseF += du / 8;
        this.curPose = Math.floor(this.curPoseF);
        
        var mP = this.sprite.vert < 5 ? this.sprite.vert : this.maxPose;
    
        if (this.curPose > mP) {
            this.curPoseF += 1 - mP;
            this.curPose = 1;
        }
    } else {
        this.curPose = 1;
        this.curPoseF = 1;
    }
};

unit.prototype.render = function (ctx) {

    if (diagnostics.renderInterpolation) {
        var justnow = (new Date()).getTime();
        // We here assume that we are in multiplayer mode, or that at least
        // the singleplayer interval and the multiplayer interval are the
        // same. This assumption is justified, as we usually wouldn't do any
        // interpolation at all in the singleplayer mode.
        // The following line should prevent overshooting - not local overshooting,
        // but temporal overshooting (over the bounds of one update, as we know that
        // the next update will not be faster anyway, so everything we run until then?
        // Just unnecessary!)
        // magic number 0.06 = 1 / 16.666 ms
        var du = Math.min(justnow - this.renderTime, multiplayer.interval) * 0.06;
        this.renderTime = justnow;
    
        // What now follows is for all intents and purposes a greatly simplified
        // mini-update; just enough to get over the gap of a few milliseconds until
        // we get the next opportunity for updates! However, it is NOT game logic,
        // as these guesses will be completely overwritten the next time someone
        // cares to update. OK, Patrick? =P
        if ((this.velX !== 0) || (this.velY !== 0)) {
            // Do not overshoot - not even when rendering offsets!
            if (this.velX > 0) {
                this.renderOffX = util.min(this.nextX - this.cx, this.renderOffX + this.velX * du);
            } else if (this.velX < 0) {
                this.renderOffX = util.max(this.nextX - this.cx, this.renderOffX + this.velX * du);
            }
            if (this.velY > 0) {
                this.renderOffY = util.min(this.nextY - this.cy, this.renderOffY + this.velY * du);
            } else if (this.velY < 0) {
                this.renderOffY = util.max(this.nextY - this.cy, this.renderOffY + this.velY * du);
            }

            this.renderOffcurPoseF += du / 8;
            this.curPose = Math.floor(this.curPoseF + this.renderOffcurPoseF);

            var mP = this.sprite.vert < 5 ? this.sprite.vert : this.maxPose;

            if (this.curPose > mP) {
                this.curPose = 1;
                this.renderOffcurPoseF += 1 - mP;
            }
        }
    }

    // we insert the first row after the third row if we have a typical
    // character sprite with 5 rows; if we have a special sprite with 4 poses,
    // then we don't =)
    this.curPoseA = this.curPose;
    if ((this.curPoseA > 3) && (this.sprite.vert === 5)) {
        this.curPoseA--;
        if (this.curPoseA === 3) {
            this.curPoseA = 1;
        }
    }

    // We only render the entity if it is directly visible or on a tile
    // that is next to a visible tile (entities are usually a little bit
    // bigger than one individual tile).
    if ((this.tileX > world.camL - 2) &&
        (this.tileX < world.camR + 2) &&
        (this.tileY > world.camT - 2) &&
        (this.tileY < world.camB + 2)) {
        // draw a rectangle around me if I am selected
        if (this.selected) {
            if (this.hp > this.maxhp * 2/3) {
                ctx.strokeStyle = "#00ff00";
            } else if (this.hp > this.maxhp / 3) {
                ctx.strokeStyle = "#ffff00";
            } else {
                ctx.strokeStyle = "#ff0000";
            }
            ctx.strokeRect(Math.floor(this.cx + this.renderOffX) - world.camL*32 + 160.5,
                           Math.floor(this.cy + this.renderOffY) - world.camT*32 + 0.5,
                           32, 32);
        }

        this.sprite.drawCharAt(
            ctx, this.cx + this.renderOffX, this.cy + this.renderOffY - 2,
            this.orientation + this.curPoseA*8 - 8
        );
    }
};

unit.prototype.renderCorpse = function (ctx) {

    var exOff = 0;

    if (this.corpseTime > 4000) {
        this.DELETED = true;
        exOff = 5;
    } else if (this.corpseTime > 3000) {
        exOff = 5;
    } else if (this.corpseTime > 1500) {
        exOff = 4;
    } else if (this.corpseTime > 500) {
        exOff = 3;
    } else if (this.corpseTime > 40) {
        exOff = 2;
    } else if (this.corpseTime > 20) {
        exOff = 1;
    }

    var oursprite = this.sprite_corpse;

    if (exOff > 2) {
        exOff -= 3;
        
        if (this.race === 0) {
            oursprite = g_sprites.orc_corpse;
        } else {
            oursprite = g_sprites.human_corpse;
        }
    }

    if (this.corpseSpriteX === 5) {
        exOff = -exOff;
    }

    oursprite.drawCorpseAt(
            ctx, this.cx, this.cy,
            this.corpseSpriteX + exOff, this.corpseSpriteY);
};
