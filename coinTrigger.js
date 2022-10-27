"use strict";
//
//  coinTrigger.js
//
//  Created by Alezia Kurdis, October 7th, 2022.
//  Copyright 2022 Alezia Kurdis.
//
//  Voxecutor - Coin Trigger script.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var jsMainFileName = "coinTrigger.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];    
    var channelComm = "ak.voxecutor.ac.communication"; 
    var oneTimeOnly = false;
    var SOUND_COIN_COLLECT = SoundCache.getSound(ROOT + "sounds/coinsCollect.wav");
    
    this.enterEntity = function(entityID) {
        if (oneTimeOnly === false) {
            var amount = parseInt(Entities.getEntityProperties(entityID,["description"]).description, 10);            
            var message = {
                "action": "GET_COIN",
                "avatarID": MyAvatar.sessionUUID,
                "coinID": entityID,
                "coinAmount": amount
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
            
            var injectorOptions = {
                "position": MyAvatar.position,
                "volume": 0.3,
                "loop": false,
                "localOnly": true
            };
            var injector = Audio.playSound(SOUND_COIN_COLLECT, injectorOptions);            
            
            oneTimeOnly = true;
        }

    }; 

})
