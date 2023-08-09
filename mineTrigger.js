//"use strict";
//
//  mineTrigger.js
//
//  Created by Alezia Kurdis, October 11th, 2022.
//  Copyright 2022 Alezia Kurdis.
//
//  Voxecutor - Ghost attacking script.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var channelComm = "ak.voxecutor.ac.communication"; 
    var oneTimeOnly = false;
    
    this.enterEntity = function(entityID) {
        if (oneTimeOnly === false) {        
            var position = MyAvatar.position;
            var message = {
                "action": "KILLED_BY_MINE",
                "avatarID": MyAvatar.sessionUUID,
                "mineID": entityID,
                "position": position
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
            oneTimeOnly = true;
        }        

    }; 

    
    
})
