"use strict";
//
//  userManager.js
//
//  Created by Alezia Kurdis on October 3rd, 2022
//  Copyright 2022 Alezia Kurdis.
//
//  Voxecutor game - User manager script.
//  Manage gravity, teleport on requested message, set atmospheric and day cycle
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function(){
    var channelComm = "ak.voxecutor.ac.communication"; 
    var startTriggerId = Uuid.NULL;
    
    var jsMainFileName = "userManager.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

    var life = 0;
    var userStat = [];
    var gameStatus = "NOT STARTED";
    var gameTime = 0;
    var attackMode = "USER_HUNTED";
    var lightMatID = Uuid.NULL;
    var entranceFxID = Uuid.NULL;
    var spannerFxID = Uuid.NULL;    
    
    var COLOR_CYCLE_DURATION = 3600; //sec. (1h)
    
    var displayBoards = [];
   
    var processTimer = 0;
    var TIMER_INTERVAL = 1000;
    var thisEntityID = Uuid.NULL;
    var thisRenderWithZones;

    var tpOneID = Uuid.NULL;
    var tpTwoID = Uuid.NULL;

    var warTimeinjector = Uuid.NULL;
    var SOUND_WAR_TIME;
    var thisPosition;
    
    var countDownInjector = Uuid.NULL;
    var SOUND_COUNTDOWN;
    
    var logoOverteOneID = Uuid.NULL;
    var logoOverteTwoID = Uuid.NULL;
    
    var ambientSoundInjector = Uuid.NULL;
    var SOUND_AMBIENCE_PLAYING;
    var SOUND_AMBIENCE_ENTRACT;
    var ambientSoundStatus = "ENTRACT";
    
    var doorMessageTextID = Uuid.NULL;
    
    this.preload = function(entityID) {
        SOUND_AMBIENCE_ENTRACT = SoundCache.getSound(ROOT + "sounds/entractAmbience.mp3");
        SOUND_AMBIENCE_PLAYING = SoundCache.getSound(ROOT + "sounds/trame.mp3");         
        SOUND_WAR_TIME = SoundCache.getSound(ROOT + "sounds/warTime.mp3");
        SOUND_COUNTDOWN =  SoundCache.getSound(ROOT + "sounds/countDown30sec.mp3");    
        
        thisEntityID = entityID;
        //Add Start Game Trigger
        var properties = Entities.getEntityProperties(entityID,["renderWithZones", "position"]);
        thisRenderWithZones = properties.renderWithZones;
        thisPosition = properties.position;
        
        startTriggerId = Entities.addEntity({
            "parentID": entityID,
            "type": "Shape",
            "shape": "Cylinder",
            "dimensions": {
                "x": 2,
                "y": 3.5,
                "z": 2
            },
            "renderWithZones": thisRenderWithZones,
            "localPosition": {
                "x": 8.5,
                "y": 16,
                "z": 0
            },
            "visible": false,
            "canCastShadow": false,
            "collisionless": true,
            "script": ROOT + "startTrigger.js",
            "name": "START-TRIGGER"
            },"local");
        
            //Add particle effect.
        
        
        tpOneID = Entities.addEntity({
            "parentID": entityID,
            "type": "Shape",
            "shape": "Cube",
            "dimensions": {
                "x": 3,
                "y": 4,
                "z": 6
            },
            "renderWithZones": thisRenderWithZones,
            "localPosition": {
                "x": 0,
                "y": -2,
                "z": 63
            },
            "visible": false,
            "canCastShadow": false,
            "collisionless": true,
            "script": ROOT + "teleport.js",
            "name": "TELEPORTER_1",
            "description": "MINUS"
        },"local");

        tpTwoID = Entities.addEntity({
            "parentID": entityID,
            "type": "Shape",
            "shape": "Cube",
            "dimensions": {
                "x": 3,
                "y": 4,
                "z": 6
            },
            "renderWithZones": thisRenderWithZones,
            "localPosition": {
                "x": 0,
                "y": -2,
                "z": -63
            },
            "visible": false,
            "canCastShadow": false,
            "collisionless": true,
            "script": ROOT + "teleport.js",
            "name": "TELEPORTER_2",
            "description": "PLUS"
        },"local");

        logoOverteOneID = Entities.addEntity({
            "type": "Model",
            "name": "logo 1",
            "dimensions": {
                "x": 32.1741828918457,
                "y": 8.46186637878418,
                "z": 1.1852983236312866
            },
            "rotation": {
                "x": 0,
                "y": 0,
                "z": 0,
                "w": 1
            },
            "localPosition": {
                "x": 50.2612,
                "y": 38.9668,
                "z": -91.2397
            },
            "renderWithZones": thisRenderWithZones,
            "parentID": entityID,
            "grab": {
                "grabbable": false
            },
            "shapeType": "none",
            "modelURL": ROOT + "logo_overte_white-color-emissive.fst",
        },"local");

        logoOverteTwoID = Entities.addEntity({
            "type": "Model",
            "name": "logo 2",
            "dimensions": {
                "x": 32.1741828918457,
                "y": 8.46186637878418,
                "z": 1.1852983236312866
            },
            "rotation": {
                "x": 0,
                "y": 1,
                "z": 0,
                "w": 0
            },
            "localPosition": {
                "x": -50.2612,
                "y": 38.9668,
                "z": 91.2397
            },
            "renderWithZones": thisRenderWithZones,
            "parentID": entityID,
            "grab": {
                "grabbable": false
            },
            "shapeType": "none",
            "modelURL": ROOT + "logo_overte_white-color-emissive.fst",
        },"local");

        doorMessageTextID = Entities.addEntity({
            "type": "Text",
            "name": "DOOR-MESSAGE",
            "dimensions": {
                "x": 1.545506477355957,
                "y": 0.7868150472640991,
                "z": 0.009999999776482582
            },
            "rotation": {
                "x": -0.5000228881835938,
                "y": -0.5000228881835938,
                "z": -0.5000228881835938,
                "w": 0.49996185302734375
            },
            "localPosition": {
                "x": 6.7666,
                "y": 14.3320,
                "z": 0
            },
            "renderWithZones": thisRenderWithZones,
            "parentID": entityID,
            "grab": {
                "grabbable": false
            },
            "collisionless": true,
            "ignoreForCollisions": true,
            "text": "ENTER THE GAME\n TO START IT.",
            "lineHeight": 0.2,
            "textColor": {
                "red": 0,
                "green": 255,
                "blue": 0
            },
            "backgroundAlpha": 0,
            "unlit": true,
            "alignment": "center"            
        }, "local");

        
        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
        Script.update.connect(myTimer);
        displayInfo("", "center");
        if (SOUND_AMBIENCE_ENTRACT.downloaded) {
            manageAmbientSound();
        } else {
            SOUND_AMBIENCE_ENTRACT.ready.connect(onSoundReady);
        }        
    }
    
    function onSoundReady() {
        SOUND_AMBIENCE_ENTRACT.ready.disconnect(onSoundReady);
        manageAmbientSound();
    }
    
    function onMessageReceived(channel, message, sender, localOnly) {
        var displayText = "";
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "TELEPORT_USER" && data.avatarID === MyAvatar.sessionUUID) {
                MyAvatar.position = data.position;
                MyAvatar.orientation = data.orientation;
            } else if (data.action === "JOINING_COUNTDOWN") {
                if (data.second > -1) {
                    displayText = "GAME STARTS IN " + data.second + " sec.\n PLEASE, JOIN NOW.";
                }
                if (data.second === 0) {
                    userStat = [];
                    life = 0;
                    var today = new Date();
                    gameTime = today.getTime();
                    gameStatus = "PLAYING";
                }
                displayInfo(displayText, "center");
                Entities.editEntity(doorMessageTextID, {"text": "THE GAME STARTS SOON\n PLEASE, JOIN NOW.", "textColor": { "red": 255, "green": 255, "blue": 0 }});
            } else if (data.action === "TRIGGER_COUNTDOWN_SOUND") {
                if (Vec3.distance(thisPosition, MyAvatar.position) < 500) {
                    var countDownInjectorOptions = {
                        "volume": 0.2,
                        "loop": false,
                        "localOnly": true
                    };
                    countDownInjector = Audio.playSound(SOUND_COUNTDOWN, countDownInjectorOptions);
                }
            } else if (data.action === "LIFE_COUNT_UPDATE") {
                life = data.life;
                if (ambientSoundStatus !== "PLAYING") {
                    ambientSoundStatus = "PLAYING";
                    manageAmbientSound();
                }
                Entities.editEntity(doorMessageTextID, {"text": "ONGOING GAME\n PLEASE, WAIT.", "textColor": { "red": 255, "green": 0, "blue": 0 }});
            } else if (data.action === "PLAYERS_DATA") {
                userStat = data.players;
            } else if (data.action === "REVERSE") {
                if (Vec3.distance(thisPosition, MyAvatar.position) < 500) {
                    var injectorOptions = {
                        "volume": 0.7,
                        "loop": false,
                        "localOnly": true
                    };
                    warTimeinjector = Audio.playSound(SOUND_WAR_TIME, injectorOptions);
                }
                attackMode = "USER_ATTACKING";
            } else if (data.action === "END_REVERSE") {
                attackMode = "USER_HUNTED";
            } else if (data.action === "GAME_END") {
                if (warTimeinjector !== Uuid.NULL) {
                    if (warTimeinjector.isPlaying()) {
                        warTimeinjector.stop();
                    }
                    warTimeinjector = Uuid.NULL;
                } 
                life = 0;
                updateGameDisplay();
                Entities.editEntity(doorMessageTextID, {"text": "ENTER THE GAME\n TO START IT.", "textColor": { "red": 0, "green": 255, "blue": 0 }});
                gameStatus = "NOT STARTED";
                if (ambientSoundStatus !== "ENTRACT") {
                    ambientSoundStatus = "ENTRACT";
                    manageAmbientSound();
                }
            } else if (data.action === "I_DIED"  && data.avatarID === MyAvatar.sessionUUID) {
                var deathID = Entities.addEntity({
                    "type": "ParticleEffect",
                    "name": "DEATH",
                    "dimensions": {
                        "x": 2.9000000953674316,
                        "y": 2.9000000953674316,
                        "z": 2.9000000953674316
                    },
                    "parentID": MyAvatar.sessionUUID,
                    "localPosition": {
                        "x": 0,
                        "y": 1,
                        "z": 0
                    },
                    "grab": {
                        "grabbable": false
                    },
                    "shapeType": "ellipsoid",
                    "color": {
                        "red": 255,
                        "green": 0,
                        "blue": 0
                    },
                    "alpha": 0,
                    "textures": ROOT + "skull.png",
                    "maxParticles": 240,
                    "lifespan": 2,
                    "emitRate": 80,
                    "emitSpeed": 0,
                    "speedSpread": 0,
                    "emitOrientation": {
                        "x": -0.0000152587890625,
                        "y": -0.0000152587890625,
                        "z": -0.0000152587890625,
                        "w": 1
                    },
                    "emitDimensions": {
                        "x": 2,
                        "y": 2,
                        "z": 2
                    },
                    "polarFinish": 3.1415927410125732,
                    "emitAcceleration": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "particleRadius": 0.3499999940395355,
                    "radiusSpread": 0.10000000149011612,
                    "radiusStart": 0,
                    "radiusFinish": null,
                    "colorStart": {
                        "red": 255,
                        "green": 166,
                        "blue": 166
                    },
                    "colorFinish": {
                        "red": null,
                        "green": null,
                        "blue": null
                    },
                    "alphaStart": 1,
                    "alphaFinish": 0,
                    "emitterShouldTrail": true,
                    "spinStart": null,
                    "spinFinish": null,
                    "rotateWithEntity": true,
                    "lifetime": 4
                },"local");
            }
        }
    }

    function addLeadingZeros(num, totalLength) {
        var str = "" + num;
        while (str.length < totalLength) {
            str = "0" + str;
        }
        return str;
    }

    function normalizeString(str, totalLength) {
        var strResult = str;
        if (strResult.length > totalLength) {
            strResult = strResult.substr(0, totalLength);
        }
        while (strResult.length < totalLength) {
            strResult = strResult + " ";
        }        
        return strResult;
    }

    function displayInfo(displayText, alignment) {
        var lineHeight = 1.5;
        if (displayBoards.length === 0) {
            displayBoards[0] = Entities.addEntity({
                "type": "Text",
                "parentID": thisEntityID,
                "renderWithZones": thisRenderWithZones,
                "localPosition": {"x": 0 , "y": 20.2, "z": 74.2},
                "dimensions": {"x": 32 , "y": 15, "z": 0.01},
                "rotation": Quat.fromVec3Degrees({"x": 0 , "y": 180, "z": 0}),
                "text": displayText,
                "lineHeight": lineHeight,
                "alignment": alignment,
                "textColor": {"red": 255 , "green": 128, "blue": 0},
                "leftMargin": 0.2,
                "rightMargin": 0.2,
                "topMargin": 0.2,
                "bottomMargin": 0.2,
                "unlit": true                
            }, "local");
            displayBoards[1] = Entities.addEntity({
                "type": "Text",
                "parentID": thisEntityID,
                "renderWithZones": thisRenderWithZones,
                "localPosition": {"x": 0 , "y": 20.2, "z": -74.2},
                "dimensions": {"x": 32 , "y": 15, "z": 0.01},
                "rotation": Quat.fromVec3Degrees({"x": 0 , "y": 0, "z": 0}),
                "text": displayText,
                "lineHeight": lineHeight,
                "alignment": alignment,                
                "textColor": {"red": 0 , "green": 255, "blue": 0},
                "leftMargin": 0.2,
                "rightMargin": 0.2,
                "topMargin": 0.2,
                "bottomMargin": 0.2,
                "unlit": true                
            }, "local");
            displayBoards[2] = Entities.addEntity({
                "type": "Text",
                "parentID": thisEntityID,
                "renderWithZones": thisRenderWithZones,
                "localPosition": {"x": 74.2 , "y": 20.2, "z": 0},
                "dimensions": {"x": 32 , "y": 15, "z": 0.01},
                "rotation": Quat.fromVec3Degrees({"x": 0 , "y": 270, "z": 0}),
                "text": displayText,
                "lineHeight": lineHeight,
                "alignment": alignment,                
                "textColor": {"red": 255 , "green": 0, "blue": 255},
                "leftMargin": 0.2,
                "rightMargin": 0.2,
                "topMargin": 0.2,
                "bottomMargin": 0.2,
                "unlit": true                
            }, "local");
            displayBoards[3] = Entities.addEntity({
                "type": "Text",
                "parentID": thisEntityID,
                "renderWithZones": thisRenderWithZones,
                "localPosition": {"x": -74.2 , "y": 20.2, "z": 0},
                "dimensions": {"x": 32 , "y": 15, "z": 0.01},
                "rotation": Quat.fromVec3Degrees({"x": 0 , "y": 90, "z": 0}),
                "text": displayText,
                "lineHeight": lineHeight,
                "alignment": alignment,                
                "textColor": {"red": 0 , "green": 128, "blue": 255},
                "leftMargin": 0.2,
                "rightMargin": 0.2,
                "topMargin": 0.2,
                "bottomMargin": 0.2,
                "unlit": true                
            }, "local");
            displayBoards[4] = Entities.addEntity({
                "type": "Text",
                "parentID": thisEntityID,
                "renderWithZones": thisRenderWithZones,
                "localPosition": {"x": 28.03 , "y": -1, "z": 0},
                "dimensions": {"x": 7.7 , "y": 1, "z": 0.01},
                "rotation": Quat.fromVec3Degrees({"x": 0 , "y": 90, "z": 0}),
                "text": displayText,
                "lineHeight": (lineHeight/2),
                "alignment": "center",
                "backgroundAlpha": 0,                
                "textColor": {"red": 255 , "green": 255, "blue": 255},
                "leftMargin": 0.05,
                "rightMargin": 0.05,
                "topMargin": 0.05,
                "bottomMargin": 0.05,
                "unlit": true                
            }, "local");
            displayBoards[5] = Entities.addEntity({
                "type": "Text",
                "parentID": thisEntityID,
                "renderWithZones": thisRenderWithZones,
                "localPosition": {"x": -28.03 , "y": -1, "z": 0},
                "dimensions": {"x": 7.7 , "y": 1, "z": 0.01},
                "rotation": Quat.fromVec3Degrees({"x": 0 , "y": -90, "z": 0}),
                "text": displayText,
                "lineHeight": (lineHeight/2),
                "alignment": "center",
                "backgroundAlpha": 0,               
                "textColor": {"red": 255 , "green": 255, "blue": 255},
                "leftMargin": 0.05,
                "rightMargin": 0.05,
                "topMargin": 0.05,
                "bottomMargin": 0.05,
                "unlit": true                
            }, "local");            
        } else {
            for (var i = 0; i < displayBoards.length; i++) {
                if (i === 4 || i === 5) {
                    Entities.editEntity(displayBoards[i], {"text": displayText, "lineHeight": (lineHeight / 2), "alignment": "center"});
                } else {
                    Entities.editEntity(displayBoards[i], {"text": displayText, "lineHeight": lineHeight, "alignment": alignment});
                }
            }
        }
    }

    function updateGameDisplay(){
        //format the Life for the running game data 
        var today = new Date();    
        var nbrSec = Math.floor((today.getTime() - gameTime)/1000);
        var sec = addLeadingZeros(nbrSec % 60, 2);
        var min = addLeadingZeros(Math.floor(nbrSec/60), 2);
        var infoText = min + ":" + sec + "                  LIFE: " + life + "\n";
        var lastScore = 0;
        var playersScores = "";
        for (var i = 0; i < userStat.length; i++) {
            var dead = " ";
            if (userStat[i].state === "DEAD") {
                dead = "X";
            }
            if (userStat[i].score > lastScore) {
                playersScores = normalizeString(userStat[i].name, 30) + "  " + dead + "  " + userStat[i].score + "\n" + playersScores; 
                lastScore = userStat[i].score;
            } else {
                playersScores = playersScores + normalizeString(userStat[i].name, 30) + "  " + dead + "  " + userStat[i].score + "\n";
            }
        }
        infoText = infoText + playersScores;
        displayInfo(infoText, "left");
    }

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > TIMER_INTERVAL) {
            
            manageLightMaterial();
            manageFx();
            if (gameStatus === "PLAYING") {
                updateGameDisplay();
            }
            
            today = new Date();
            processTimer = today.getTime();
        }
    }

    function manageAmbientSound() {
        var ambientSoundInjectorOptions;
        if (ambientSoundInjector !== Uuid.NULL) {
            ambientSoundInjector.stop();
        }
        if (Vec3.distance(thisPosition, MyAvatar.position) < 1000) {
            if (ambientSoundStatus === "ENTRACT") {
                ambientSoundInjectorOptions = {
                    "volume": 0.12,
                    "loop": true,
                    "localOnly": true
                };
                ambientSoundInjector = Audio.playSound(SOUND_AMBIENCE_ENTRACT, ambientSoundInjectorOptions);
            } else {
                ambientSoundInjectorOptions = {
                    "volume": 0.22,
                    "loop": true,
                    "localOnly": true
                };
                ambientSoundInjector = Audio.playSound(SOUND_AMBIENCE_PLAYING, ambientSoundInjectorOptions);            
            } 
        }
    }

    function manageFx() {
        var hue = GetCurrentCycleValue(1, COLOR_CYCLE_DURATION);
        
        var colorStart = hslToRgb(hue, 1, 0.9);
        var color = hslToRgb(hue, 1, 0.75);
        var colorFinish = hslToRgb(hue, 1, 0.5);
        
        if (entranceFxID === Uuid.NULL) {
            entranceFxID = Entities.addEntity({
                "type": "ParticleEffect",
                "parentID": thisEntityID, 
                "name": "ENTRANCE FX",
                "dimensions": {
                    "x": 7.762499809265137,
                    "y": 7.762499809265137,
                    "z": 7.762499809265137
                },
                "rotation": {
                    "x": -0.0000152587890625,
                    "y": -0.0000152587890625,
                    "z": -0.0000152587890625,
                    "w": 1
                },
                "renderWithZones": thisRenderWithZones,
                "grab": {
                    "grabbable": false
                },
                "localPosition": {
                    "x": 8.4644,
                    "y": 14.3750,
                    "z": 0
                },
                "shapeType": "cylinder-y",
                "color": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                },
                "textures": ROOT + "bubble.png",
                "maxParticles": 1800,
                "lifespan": 2.5,
                "emitRate": 600,
                "emitSpeed": 0,
                "speedSpread": 0,
                "emitOrientation": {
                    "x": -0.0000152587890625,
                    "y": -0.0000152587890625,
                    "z": -0.0000152587890625,
                    "w": 1
                },
                "emitDimensions": {
                    "x": 1.5,
                    "y": 0.10000000149011612,
                    "z": 1.5
                },
                "emitRadiusStart": 0,
                "polarFinish": 3.1415927410125732,
                "emitAcceleration": {
                    "x": 0,
                    "y": 1,
                    "z": 0
                },
                "particleRadius": 0.04,
                "radiusSpread": 0.01,
                "radiusStart": 0,
                "radiusFinish": 0.02,
                "colorStart": {
                    "red": colorStart[0],
                    "green": colorStart[1],
                    "blue": colorStart[2]
                },
                "colorFinish": {
                    "red": colorFinish[0],
                    "green": colorFinish[1],
                    "blue": colorFinish[2]
                },
                "alphaStart": 1,
                "alphaFinish": 1,
                "emitterShouldTrail": true,              
            },"local");
        } else {
            Entities.editEntity(entranceFxID, {
                "color": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                },                
                "colorStart": {
                    "red": colorStart[0],
                    "green": colorStart[1],
                    "blue": colorStart[2]
                },
                "colorFinish": {
                    "red": colorFinish[0],
                    "green": colorFinish[1],
                    "blue": colorFinish[2]
                }
            });
        }

        if (spannerFxID === Uuid.NULL) {
            spannerFxID = Entities.addEntity({
                "type": "ParticleEffect",
                "parentID": thisEntityID,
                "name": "SPANNER-FX",
                "dimensions": {
                    "x": 16.639999389648438,
                    "y": 16.639999389648438,
                    "z": 16.639999389648438
                },
                "rotation": {
                    "x": -0.0000152587890625,
                    "y": -0.0000152587890625,
                    "z": -0.0000152587890625,
                    "w": 1
                },
                "renderWithZones": thisRenderWithZones,
                "grab": {
                    "grabbable": false
                },
                "localPosition": {
                    "x": 0,
                    "y": 3.38,
                    "z": 0
                },
                "shapeType": "ellipsoid",
                "alpha": 0.20000000298023224,
                "textures": ROOT + "spanner-fx.png",
                "maxParticles": 500,
                "lifespan": 2,
                "emitRate": 200,
                "emitSpeed": 0.20,
                "speedSpread": 0.40,
                "emitOrientation": {
                    "x": -0.0000152587890625,
                    "y": -0.0000152587890625,
                    "z": -0.0000152587890625,
                    "w": 1
                },
                "emitDimensions": {
                    "x": 5,
                    "y": 5,
                    "z": 5
                },
                "emitRadiusStart": 0,
                "polarFinish": 3.1415927410125732,
                "emitAcceleration": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "particleRadius": 2,
                "radiusSpread": 0.5,
                "radiusStart": 1,
                "radiusFinish": 4,
                "color": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                },                
                "colorStart": {
                    "red": colorStart[0],
                    "green": colorStart[1],
                    "blue": colorStart[2]
                },
                "colorFinish": {
                    "red": colorFinish[0],
                    "green": colorFinish[1],
                    "blue": colorFinish[2]
                },
                "alphaStart": 0,
                "alphaFinish": 0                
            },"local");            
        } else {
            Entities.editEntity(spannerFxID, {
                "color": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                },                
                "colorStart": {
                    "red": colorStart[0],
                    "green": colorStart[1],
                    "blue": colorStart[2]
                },
                "colorFinish": {
                    "red": colorFinish[0],
                    "green": colorFinish[1],
                    "blue": colorFinish[2]
                }                
            });
        }        
    }

    function manageLightMaterial() {
        var color;
        if ( attackMode === "USER_ATTACKING") {
            color = [255,255,255];
        } else {
            color = hslToRgb(GetCurrentCycleValue(1, COLOR_CYCLE_DURATION), 1, 0.625);
        }
        
        var sumColorCompnent = (color[0]/255) +(color[1]/255) +(color[2]/255);
        if (sumColorCompnent === 0) { 
            sumColorCompnent = 0.001; 
        }
        var bloomFactor = 7 / sumColorCompnent;        
        
        var materialData = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "LIGHT",
                    "albedo": [1, 1, 1],
                    "metallic": 1,
                    "roughness": 1,
                    "emissive": [(color[0]/255) * bloomFactor, (color[1]/255) * bloomFactor, (color[2]/255) * bloomFactor],
                    "cullFaceMode": "CULL_BACK",
                    "model": "hifi_pbr"
                }
            ]
        };        

        if (lightMatID === Uuid.NULL) {
            lightMatID = Entities.addEntity({
                    "type": "Material",
                    "renderWithZones": thisRenderWithZones,
                    "name": "LightMaterial",
                    "grab": {
                        "grabbable": false
                    },
                    "materialURL": "materialData",
                    "priority": 2,
                    "parentMaterialName": "[mat::LIGHT]",
                    "materialData": JSON.stringify(materialData),
                    "parentID": thisEntityID,
                    "localPosition": {"x": 0, "y": 12, "z": 0}                    
                }, "local");
        } else {
            Entities.editEntity(lightMatID, {"materialData": JSON.stringify(materialData)});
        }
    }

    this.unload = function(entityID) {
        if (startTriggerId !== Uuid.NULL) {
            Entities.deleteEntity(startTriggerId);
            startTriggerId = Uuid.NULL;
        }
        
        if (lightMatID !== Uuid.NULL) {
            Entities.deleteEntity(lightMatID);
            lightMatID = Uuid.NULL;
        }
        
        if (displayBoards.length !== 0) {
            for (var i = 0; i < displayBoards.length; i++) {
                Entities.deleteEntity(displayBoards[i]);
            }
            displayBoards = [];
        }

        if (tpOneID !== Uuid.NULL) {
            Entities.deleteEntity(tpOneID);
            tpOneID = Uuid.NULL;
        }

        if (tpTwoID !== Uuid.NULL) {
            Entities.deleteEntity(tpTwoID);
            tpTwoID = Uuid.NULL;
        }

        if (entranceFxID !== Uuid.NULL) {
            Entities.deleteEntity(entranceFxID);
            entranceFxID = Uuid.NULL;
        }

        if (spannerFxID !== Uuid.NULL) {
            Entities.deleteEntity(spannerFxID);
            spannerFxID = Uuid.NULL;
        }

        if (logoOverteOneID !== Uuid.NULL) {
            Entities.deleteEntity(logoOverteOneID);
            logoOverteOneID = Uuid.NULL;
        }

        if (logoOverteTwoID !== Uuid.NULL) {
            Entities.deleteEntity(logoOverteTwoID);
            logoOverteTwoID = Uuid.NULL;
        }
        
        if (doorMessageTextID !== Uuid.NULL) {
            Entities.deleteEntity(doorMessageTextID);
            doorMessageTextID = Uuid.NULL;
        }
        
        if (warTimeinjector !== Uuid.NULL) {
            if (warTimeinjector.isPlaying()) {
                warTimeinjector.stop();
            }
            warTimeinjector = Uuid.NULL;
        }         

        if (countDownInjector !== Uuid.NULL) {
            if (countDownInjector.isPlaying()) {
                countDownInjector.stop();
            }
            countDownInjector = Uuid.NULL;
        }
        
        if (ambientSoundInjector !== Uuid.NULL) {
            ambientSoundInjector.stop();
        }        

        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelComm);
        Script.update.disconnect(myTimer);
    };

    Script.scriptEnding.connect(function () {
        //do nothing
    });    

    // ################## CYLCE AND TIME FUNCTIONS ###########################
    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}    
    // ################## END CYLCE AND TIME FUNCTIONS ###########################   


    /*
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {Array}           The RGB representation
     */
    function hslToRgb(h, s, l){
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

})
