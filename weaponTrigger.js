"use strict";
//
//  weaponTrigger.js
//
//  Created by Alezia Kurdis, October 8th, 2022.
//  Copyright 2022 Alezia Kurdis.
//
//  Voxecutor - Weapon Trigger script.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var channelComm = "ak.voxecutor.ac.communication"; 
    var oneTimeOnly = false;
    
    this.enterEntity = function(entityID) {
        if (oneTimeOnly === false) {        
            var message = {
                "action": "REVERSE",
                "weaponID": entityID
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
            oneTimeOnly = true;
        }

    }; 

})
