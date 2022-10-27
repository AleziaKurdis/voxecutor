"use strict";
//
//  statKiosk.js
//
//  Created by Alezia Kurdis on October 22nd, 2022
//  Copyright 2022 Alezia Kurdis.
//
//  Voxecutor game - Stat displayer kiosk script.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function(){
    var channelComm = "ak.voxecutor.ac.communication"; 

    var jsMainFileName = "statKiosk.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

    var thisEntityID = Uuid.NULL;
    var thisRenderWithZones;
    
    var webOneID = Uuid.NULL;
    var webTwoID = Uuid.NULL;
    var webThreeID = Uuid.NULL;
    
    var DPI = 25;
    
    var urlOne = ROOT + "web/stat.html?view=LAST";
    var urlTwo = ROOT + "web/stat.html?view=HALL";
    var urlThree = ROOT + "web/stat.html?view=CATEGORIES";
    
    this.preload = function(entityID) {

        thisEntityID = entityID;
        //Add Start Game Trigger
        var properties = Entities.getEntityProperties(entityID,["renderWithZones", "position"]);
        thisRenderWithZones = properties.renderWithZones;

        var today = new Date();
        var t = today.getTime();
        
        webOneID = Entities.addEntity({
            "type": "Web",
            "parentID": thisEntityID,
            "name": "webLastPlayedGames",
            "localPosition": {
                "x": -0.00048828125,
                "y": 0.21728515625,
                "z": 0.471680223941803
            },
            "dimensions": {
                "x": 1.029686689376831,
                "y": 1.7886714935302734,
                "z": 0.009999999776482582
            },
            "localRotation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "renderWithZones": thisRenderWithZones,
            "grab": {
                "grabbable": false
            },
            "sourceUrl": urlOne + "&t=" + (t + 1),
            "dpi": DPI,
            "maxFPS": 1
        }, "local");
        
        webTwoID = Entities.addEntity({
            "type": "Web",
            "parentID": thisEntityID,
            "name": "webHallOfFame",
            "localPosition": {
                "x": 0.29345703125,
                "y": 0.216796875,
                "z": -0.032235026359558105
            },
            "dimensions": {
                "x": 1.029686689376831,
                "y": 1.7886714935302734,
                "z": 0.009999999776482582
            },
            "localRotation": {
                "x": -0.0000152587890625,
                "y": -0.8660868406295776,
                "z": -0.0000457763671875,
                "w": -0.49993133544921875
            },
            "renderWithZones": thisRenderWithZones,
            "grab": {
                "grabbable": false
            },
            "sourceUrl": urlTwo + "&t=" + (t + 2),
            "dpi": DPI,
            "maxFPS": 1
        }, "local");

        webThreeID = Entities.addEntity({
            "type": "Web",
            "parentID": thisEntityID,
            "name": "webTopSpMp",
            "localPosition": {
                "x": -0.29248046875,
                "y": 0.22216796875,
                "z": -0.025869324803352356
            },
            "dimensions": {
                "x": 1.029686689376831,
                "y": 1.7886714935302734,
                "z": 0.009999999776482582
            },
            "localRotation": {
                "x": -0.0000152587890625,
                "y": -0.8674906492233276,
                "z": -0.0000457763671875,
                "w": 0.49745941162109375
            },
            "renderWithZones": thisRenderWithZones,
            "grab": {
                "grabbable": false
            },
            "sourceUrl": urlThree + "&t=" + (t + 3),
            "dpi": DPI,
            "maxFPS": 1
        }, "local");


        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
    }
    

    
    function onMessageReceived(channel, message, sender, localOnly) {
        var displayText = "";
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "GAME_END") {
                Script.setTimeout(function () {
                    var today = new Date();
                    var t = today.getTime();                    
                    Entities.editEntity(webOneID, {"sourceUrl": urlOne + "&t=" + (t + 1)});
                    Entities.editEntity(webTwoID, {"sourceUrl": urlTwo + "&t=" + (t + 2)});
                    Entities.editEntity(webThreeID, {"sourceUrl": urlThree + "&t=" + (t + 3)});                 
                }, 5000); // 5 sec.
            }
        }
    }

    this.unload = function(entityID) {
        if (webOneID !== Uuid.NULL) {
            Entities.deleteEntity(webOneID);
            webOneID = Uuid.NULL;
        }

        if (webTwoID !== Uuid.NULL) {
            Entities.deleteEntity(webTwoID);
            webTwoID = Uuid.NULL;
        }
        
        if (webThreeID !== Uuid.NULL) {
            Entities.deleteEntity(webThreeID);
            webThreeID = Uuid.NULL;
        }
    
        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelComm);
    };

    Script.scriptEnding.connect(function () {
        //do nothing
    });    

})
