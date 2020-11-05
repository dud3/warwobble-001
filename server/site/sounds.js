//========
// Sounds
//========

var SOUND = {

    _muted: false,
    
    Files : [

        // +++++
        //  ORC 
        // +++++

        //-------------
        // # Basic ORC
        //-------------
        // -- ACK-- //
        // => 0 - 3 
        'sounds/Horde/Basic/acknowledge1.wav', 
        'sounds/Horde/Basic/acknowledge2.wav', 
        'sounds/Horde/Basic/acknowledge3.wav', 
        'sounds/Horde/Basic/acknowledge4.wav',
        
        // -- ANN -- //
        // => 4 - 10 
        'sounds/Horde/Basic/annoyed1.wav',
        'sounds/Horde/Basic/annoyed2.wav',
        'sounds/Horde/Basic/annoyed3.wav',
        'sounds/Horde/Basic/annoyed4.wav',
        'sounds/Horde/Basic/annoyed5.wav',
        'sounds/Horde/Basic/annoyed6.wav',
        'sounds/Horde/Basic/annoyed7.wav',

        // -- SEL --//
        // => 11 - 16
        'sounds/Horde/Basic/selected1.wav',
        'sounds/Horde/Basic/selected2.wav',
        'sounds/Horde/Basic/selected3.wav',
        'sounds/Horde/Basic/selected4.wav',
        'sounds/Horde/Basic/selected5.wav',
        'sounds/Horde/Basic/selected6.wav',

        //----------------
        // # Death Knight
        //----------------
        // => 17 - 25
        'sounds/Horde/DeathKnight/acknowledge1.wav',
        'sounds/Horde/DeathKnight/acknowledge2.wav',
        'sounds/Horde/DeathKnight/acknowledge3.wav',
        'sounds/Horde/DeathKnight/annoyed1.wav',
        'sounds/Horde/DeathKnight/annoyed2.wav',
        'sounds/Horde/DeathKnight/annoyed3.wav',
        'sounds/Horde/DeathKnight/selected1.wav',
        'sounds/Horde/DeathKnight/selected2.wav',
        'sounds/Horde/DeathKnight/ready.wav',

        //----------
        // # Dragon
        //----------
        // => 26 - 29
        'sounds/Horde/Dragon/acknowledge1.wav',
        'sounds/Horde/Dragon/acknowledge2.wav',
        'sounds/Horde/Dragon/selected1.wav',
        'sounds/Horde/Dragon/ready.wav',

        //-----------------
        // # Goblin Sapper
        //-----------------
        // => 30 - 41
        'sounds/Horde/GoblinSappers/acknowledge1.wav',
        'sounds/Horde/GoblinSappers/acknowledge2.wav',
        'sounds/Horde/GoblinSappers/acknowledge3.wav',
        'sounds/Horde/GoblinSappers/acknowledge4.wav',
        'sounds/Horde/GoblinSappers/annoyed1.wav',
        'sounds/Horde/GoblinSappers/annoyed2.wav',
        'sounds/Horde/GoblinSappers/annoyed3.wav',
        'sounds/Horde/GoblinSappers/selected1.wav',
        'sounds/Horde/GoblinSappers/selected2.wav',
        'sounds/Horde/GoblinSappers/selected3.wav',
        'sounds/Horde/GoblinSappers/selected4.wav',
        'sounds/Horde/GoblinSappers/ready.wav',

        //-------------
        // # Buildings
        //-------------
        // => 42 - 46
        'sounds/Horde/Buildings/altar-of-storms.wav',
        'sounds/Horde/Buildings/goblin-alchemist.wav',
        'sounds/Horde/Buildings/temple-of-the-damned.wav',
        'sounds/Horde/Buildings/dragon-roast.wav',
        'sounds/Horde/Buildings/ogre-mound.wav',

        // +++++++
        //  HUMAN
        // +++++++
        // Same as above
        // => 47 - 50
        'sounds/Alliance/Basic/acknowledge1.wav',
        'sounds/Alliance/Basic/acknowledge2.wav',
        'sounds/Alliance/Basic/acknowledge3.wav',
        'sounds/Alliance/Basic/acknowledge4.wav',
        // => 51 - 57
        'sounds/Alliance/Basic/annoyed1.wav',
        'sounds/Alliance/Basic/annoyed2.wav',
        'sounds/Alliance/Basic/annoyed3.wav',
        'sounds/Alliance/Basic/annoyed4.wav',
        'sounds/Alliance/Basic/annoyed5.wav',
        'sounds/Alliance/Basic/annoyed6.wav',
        'sounds/Alliance/Basic/annoyed7.wav',
        // => 58 - 63
        'sounds/Alliance/Basic/selected1.wav',
        'sounds/Alliance/Basic/selected2.wav',
        'sounds/Alliance/Basic/selected3.wav',
        'sounds/Alliance/Basic/selected4.wav',
        'sounds/Alliance/Basic/selected5.wav',
        'sounds/Alliance/Basic/selected6.wav'

    ],

    // Array to push all the files as an object
    Audio : [],

    // Stuff that doesnt have to be random
    Orc_death : new Audio('sounds/Horde/Basic/death.wav'),
    Orc_ready : new Audio('sounds/Horde/Basic/ready.wav'),
    Orc_underAttack : new Audio('sounds/Horde/Basic/help1.wav'),
    Orc_townUnderAttack : new Audio('sounds/Horde/Basic/help2.wav'),
    Orc_workCompleted : new Audio('sounds/Horde/Basic/work-completed.wav'),
    Human_death : new Audio('sounds/Alliance/Basic/death.wav'),
    Human_ready : new Audio('sounds/Alliance/Basic/ready.wav'),
    Human_underAttack : new Audio('sounds/Alliance/Basic/help1.wav'),
    Human_townUnderAttack : new Audio('sounds/Alliance/Basic/help2.wav'),
    Human_workCompleted : new Audio('sounds/Alliance/Basic/work-completed.wav'),

    CreateAudio : function() {
        for (var i = 0; i < this.Files.length; i++) {
            this.Audio.push(new Audio(this.Files[i]));
        }
    },

    PlayRandomAudio : function(min, max) {
        if (!this._muted) {
            var random = util.randRangeInt(min, max);

            if (!this.Audio[random]) {
                alert("Audio[" + random + "] is undefined!");
                return;
            }

            this.Audio[random].play();
        }
    },
   
    mute : function () {
        this._muted = true;
    },

    unmute : function() {
        this._muted = false;
    },

    toggleMuted : function() {
        this._muted = !this._muted;
    },

    playForSelectedEntity : function(race, type) {
        // magic number: 47, the index of the first human sound
        race *= 47;

        if (type <= 1) {
            this.PlayRandomAudio(11 + race, 16 + race);
        }
    },
    
    playForAcknowledgingEntity : function(race, type) {
        // magic number: 47, the index of the first human sound
        race *= 47;

        if (type <= 1) {
            this.PlayRandomAudio(0 + race, 3 + race);
        }
    },
    
    playForBeingReady : function(race, type) {
        if (!this._muted) {
            var file = this.Orc_ready;

            if (race === 1) {
                file = this.Human_ready;
            }

            file.play();
        }
    },
    
    playForWorkCompleted : function(race, type) {
        if (!this._muted) {
            var file = this.Orc_workCompleted;

            if (race === 1) {
                file = this.Human_workCompleted;
            }

            file.play();
        }
    },
    
    playForDeath : function(race, type) {
        if (!this._muted) {
            var file = this.Orc_death;

            if (race === 1) {
                file = this.Human_death;
            }

            file.play();
        }
    }
};

SOUND.CreateAudio();
