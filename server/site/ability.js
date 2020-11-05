function train(entities, race, type, icon){
    var Trainer = player.p[entities[0].belongsTo];
    var ourlist = entityList.costs[race][type];

    var gold = ourlist[0];
    var lumber = ourlist[1];
    var oil = ourlist[2];
    var time = ourlist[3];
  
    if ((Trainer.food > Trainer.eaten) &&
        (Trainer.gold >= gold) &&
        (Trainer.lumber >= lumber) &&
        (Trainer.oil >= oil)){

        Trainer.gold = Trainer.gold - gold;
        Trainer.lumber = Trainer.lumber - lumber;
        Trainer.oil = Trainer.oil - oil;

        entities[0].generateUnit = {
            type : type,
            race : race,
            tileX : entities[0].tileX + 2,
            tileY : entities[0].tileY + 2
        };

        entities[0].generateUnitCounterMax = time;
        entities[0].generateUnitCounter = time;
        entities[0].generateUnitIcon = icon;
    } else {
        if (Trainer.food <= Trainer.eaten) {
            g_sprites.message("Not enough food... Build more farms!", 2);
        } else if (Trainer.gold < gold) {
            g_sprites.message("Not enough gold.", 2);
        } else if (Trainer.lumber < lumber) {
            g_sprites.message("Not enough lumber.", 2);
        } else {
            g_sprites.message("Not enough oil.", 2);
        }
      }
}

function Missile(unit, targetunit, type){
	var curEnt = entityManager.generateUnit({
            type : type,
            race : unit.race,
            tileX : unit.tileX,
            tileY : unit.tileY,
			aim : targetunit
        }, unit.belongsTo);
		
	curEnt.sendTargetedCommand('attack', 1);
}

function Summon(unit, summoned){
	var curEnt = entityManager.generateUnit({
            type : summoned.type,
            race : unit.race,
            tileX : unit.tileX,
            tileY : unit.tileY,
			aim : targetunit
        }, unit.belongsTo);
}