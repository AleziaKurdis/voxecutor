"use strict";
//
//  teleport.js
//
//  Created by Alezia Kurdis, October 11th, 2022.
//  Copyright 2022 Alezia Kurdis.
//
//  Voxecutor - teleporter script.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var TP_DISTANCE = 122.5;
    
    this.enterEntity = function(entityID) {
        var properties = Entities.getEntityProperties(entityID,["description", "position"]);
        var direction = properties.description;
        var entityPosition = properties.position;
        var avatarPosition = MyAvatar.position;
        var destination;
        if (direction === "MINUS") {
            destination = {"x": entityPosition.x , "y": avatarPosition.y, "z": entityPosition.z - TP_DISTANCE};
        } else {
            destination = {"x": entityPosition.x , "y": avatarPosition.y, "z": entityPosition.z + TP_DISTANCE };
        }

        MyAvatar.position = destination;
    }; 

})
