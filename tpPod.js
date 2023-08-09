//"use strict";
//
//  tpPod.js
//
//  Created by Alezia Kurdis, October 11th, 2022.
//  Copyright 2022 Alezia Kurdis.
//
//  local tp pod script.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var fxID = Uuid.NULL;
    var jsMainFileName = "tpPod.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

    this.preload = function(entityID) {
        var thisRenderWithZones = Entities.getEntityProperties(entityID,["renderWithZones"]).renderWithZones;
        
        fxID = Entities.addEntity({
            "type": "ParticleEffect",
            "name": "TP-POD-FX",
            "dimensions": {
                "x": 5.505000591278076,
                "y": 5.505000591278076,
                "z": 5.505000591278076
            },
            "parentID": entityID,
            "localPosition": {
                "x": 0,
                "y": -1.4,
                "z": 0
            },
            "renderWithZones": thisRenderWithZones,
            "grab": {
                "grabbable": false
            },
            "shapeType": "ellipsoid",
            "color": {
                "red": 232,
                "green": 255,
                "blue": 105
            },
            "textures": ROOT + "bubble.png",
            "maxParticles": 600,
            "emitRate": 200,
            "emitSpeed": 0,
            "speedSpread": 0,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.30000001192092896,
                "y": 0,
                "z": 0.30000001192092896
            },
            "emitRadiusStart": 0,
            "polarFinish": 3.1415927410125732,
            "emitAcceleration": {
                "x": 0,
                "y": 0.5,
                "z": 0
            },
            "particleRadius": 0.029999999329447746,
            "radiusStart": 0,
            "radiusFinish": 0.029999999329447746,
            "colorStart": {
                "red": 255,
                "green": 255,
                "blue": 255
            },
            "colorFinish": {
                "red": 200,
                "green": 255,
                "blue": 0
            },
            "alphaSpread": 0.10000000149011612,
            "alphaStart": 0.699999988079071,
            "alphaFinish": 0,
            "emitterShouldTrail": true,
            "spinStart": -1.5700000524520874,
            "spinFinish": 1.5700000524520874
        }, "local");
    };
 
    this.enterEntity = function(entityID) {
        var properties = Entities.getEntityProperties(entityID,["userData"]);
        var hifiurl = properties.userData;
        if (hifiurl === "BACK") {
            if (location.canGoBack()) {
                location.goBack();
            }            
        } else {
            Window.location = hifiurl;
        }
    }; 

    this.unload = function(entityID) {
        if (fxID !== Uuid.NULL) {
            Entities.deleteEntity(fxID);
            fxID = Uuid.NULL;
        }
        
    };

    Script.scriptEnding.connect(function () {
        //do nothing
    });  
})
