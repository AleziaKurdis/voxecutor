"use strict";
//
//  startTrigger.js
//
//  Created by Alezia Kurdis, October 1st, 2022.
//  Copyright 2022 Alezia Kurdis.
//
//  Voxecutor - EnterGame Trigger.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var channelComm = "ak.voxecutor.ac.communication"; 

    this.enterEntity = function(entityID) {
        var position = MyAvatar.position;
        var no = parseInt(Entities.getEntityProperties(entityID,["description"]).description, 10);
        var message = {
            "action": "PLAYER_ENTERING",
            "avatarID": MyAvatar.sessionUUID,
            "name": MyAvatar.sessionDisplayName
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));

    }; 

    
    
})
