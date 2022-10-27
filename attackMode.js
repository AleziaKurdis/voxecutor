"use strict";
//
//  attackMode.js
//
//  Created by Alezia Kurdis, October 1st, 2022.
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
            var no = parseInt(Entities.getEntityProperties(entityID,["description"]).description, 10);
            var message = {
                "action": "KILLED",
                "avatarID": MyAvatar.sessionUUID,
                "ghostNo": no,            
                "position": position
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
            oneTimeOnly = true;
        }        

    }; 

    
    
})
