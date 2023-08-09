//"use strict";
//
//  AC_voxecutor.js
//
//  Created by Alezia Kurdis on September 28th, 2022
//  Copyright 2022 Alezia Kurdis.
//
//  Server side game manager for Voxecutor game.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

print("VOXECUTOR: start running.");
var jsMainFileName = "AC_voxecutor.js";
var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

var channelComm = "ak.voxecutor.ac.communication";
var ORIGIN_POSITION = {"x":8000,"y":8000,"z":8000};
var GRID_POINT_SIDE_SIZE = 8.0; //in meter
var GRID = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1],
    [1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,0,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1],
    [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

var CENTER_GRID_X = 8;
var CENTER_GRID_Y = 8;
var LIFE_TIME_ANTI_JUNK = 10; //10 sec.

var HUNT_SPEED_TIME = 2000; // 2 sec
var CHASED_SPEED_TIME = 1000; // 1 sec
var JOINING_TIMER_INTERVAL = 1000; // 1 sec
var JOING_NBR_SEC = 30;
var countDown = JOING_NBR_SEC;

var VOXECUTOR_WALK_VOLUME = 0.3;

var NUMBER_OF_LIVE_PER_PLAYER = 4;
var life = 0;

var updateTimerInterval = HUNT_SPEED_TIME; 
var processTimer = 0;

var numberOfGhost = 0;
var numberOfExpectedGhost = 0;
var ghost = [];
var gameStatus = "NOT_STARTED"; //other values would be "PLAYING"
var reversedMode = 0;

var players = [];

var coins = [];
var NBR_COINS_IN_GAME = 30;

var weapons = [];
var WEAPON_DELAY = 120000; //2 minutes
var weaponsUpdateTimerInterval = WEAPON_DELAY; //2 minutes 
var weaponsProcessTimer = 0;
var weaponBonus = 100;

var BONUS_DELAY = 120000; // 2 min.
var bonusUpdateTimerInterval = BONUS_DELAY;
var bonusProcessTimer = 0;

var ghostSoundTimerInterval = 300; //0.3 sec
var ghostSoundProcessTimer = 0;

var portalLockerID = Uuid.NULL;

var MINE_GENERATION_PROBABILITY = 0.05; //(1 each 20 moves)

var gameDurationStart = 0;
var isGameEnded = false;

var statTimerInterval = 7000; //7 sec.
var statProcessTimer = 0;

var glassCeilingID = Uuid.NULL;

function addPlayer(id, name) {
    var message;
    if (getPlayerNoFromSessionID(id) === -1) {
        if (gameStatus === "NOT_STARTED" || gameStatus === "JOINING") {
            if (gameStatus === "NOT_STARTED") {
                gameStatus = "JOINING";
                updateTimerInterval = JOINING_TIMER_INTERVAL;
                countDown = JOING_NBR_SEC;
                message = {
                    "action": "TRIGGER_COUNTDOWN_SOUND"      
                };
                Messages.sendMessage(channelComm, JSON.stringify(message));                
                
                Script.update.connect(myTimer);
                setGlassCeiling();
            }
            var player = {
                "id": id,
                "name": name,
                "score": 0,
                "state": "ALIVE"
            };
            players.push(player);
            message = {
                "action": "TELEPORT_USER",
                "avatarID": id,
                "position": determinePlayerInitialPosition(),
                "orientation": Quat.fromVec3Degrees({"x": 0, "y": (Math.random() * 360), "z": 0})        
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
        }
    } else {
        message = {
            "action": "TELEPORT_USER",
            "avatarID": id,
            "position": determinePlayerInitialPosition(),
            "orientation": Quat.fromVec3Degrees({"x": 0, "y": (Math.random() * 360), "z": 0})        
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));
    }
}

function setGlassCeiling() {
    if (glassCeilingID === Uuid.NULL) {
        glassCeilingID = Entities.addEntity({
            "type": "Shape",
            "shape": "Cube",
            "dimensions": {
                "x": 300,
                "y": 0.1,
                "z": 300
            },
            "renderWithZones": visibilityZone,
            "position": Vec3.sum( ORIGIN_POSITION, { "x": 0, "y": 4.06, "z": 0 }),
            "visible": false,
            "canCastShadow": false,
            "collisionless": false,
            "name": "GLASS-CEILING",
            "lifetime": 7200,            
        }, "domain");
    }
}

function clearGlassCeiling() {
    if (glassCeilingID !== Uuid.NULL) {
        Entities.deleteEntity(glassCeilingID);
        glassCeilingID = Uuid.NULL;
    }
}

function determinePlayerInitialPosition() {
    var startPositions = [{"x":32, "y":-3, "z":0}, {"x":-32, "y":-3, "z":0}];
    var pickedStartPosition = startPositions[Math.floor(Math.random() * startPositions.length)];
    var newStartPosition = Vec3.sum(pickedStartPosition, {"x":(Math.random() * 4) - 2,"y":0,"z": (Math.random() * 8) - 4} );
    var newPosition = Vec3.sum(ORIGIN_POSITION, newStartPosition);
    return newPosition;
}

function determineExitGameToPosition() {
    var nominalExitPositions = {"x":0, "y":15.7, "z":0};
    var relativeExitPosition = Vec3.sum(nominalExitPositions, {"x":(Math.random() * 4) - 2,"y":0,"z": (Math.random() * 4) - 2} );
    var exitPosition = Vec3.sum(ORIGIN_POSITION, relativeExitPosition);
    return exitPosition;    
}

function getVisibilityZone() {
    return Entities.findEntitiesByName( "VOXECUTOR_VISIBILITY_ZONE_(X!X)", ORIGIN_POSITION, 100, true );
}

var visibilityZone = getVisibilityZone();

function initiateGame() {
    if (ghost.length > 0) { 
        clearGhost();
    }
    lockStartPortal();
    for (var c = 0; c < NBR_COINS_IN_GAME; c++) {
        addOneCoin();
    }
    var today = new Date();
    weaponsProcessTimer = today.getTime();
    bonusProcessTimer = today.getTime() - 60000; //the first time we want it 60 sec before.
    addWeapons();
    gameDurationStart = today.getTime();
    gameStatus = "PLAYING";
    life = NUMBER_OF_LIVE_PER_PLAYER * players.length;
    var message = {
        "action": "LIFE_COUNT_UPDATE",
        "life": life      
    };
    Messages.sendMessage(channelComm, JSON.stringify(message));    
    numberOfExpectedGhost = 4;
    updateTimerInterval = HUNT_SPEED_TIME;
    Script.update.connect(myTimer);    
    playSound(SOUND_START_GAME, Vec3.sum(ORIGIN_POSITION, {"x":32, "y":-3, "z":0}), 1.0);
    playSound(SOUND_START_GAME, Vec3.sum(ORIGIN_POSITION, {"x":-32, "y":-3, "z":0}), 1.0);
    isGameEnded = false;
}

function getHunterModel(no) {
    var modelUrl = ROOT + "hunter_" + no + ".fst";
    if (no > 7) {
        modelUrl = ROOT + "hunter_N.fst";
    }
    return modelUrl;
}

function addOneGhost() {
    numberOfGhost = numberOfGhost + 1;
     //add ghost in position
    var name = "VOXECUTOR-" + (numberOfGhost + 1);
    var positionGhost = getInWorldPositionFromGrid(CENTER_GRID_X, CENTER_GRID_Y);
    var ghostID = Entities.addEntity({
        "name": name,
        "description": numberOfGhost,
        "type": "Model",
        "modelURL": getHunterModel(numberOfGhost + 1),
        "useOriginalPivot": true,
        "shapeType": "box",
        "dimensions": {"x": GRID_POINT_SIDE_SIZE, "y": GRID_POINT_SIDE_SIZE, "z": GRID_POINT_SIDE_SIZE},
        "position": positionGhost,
        "grab": {
            "grabbable": false
        },            
        "collisionless": true,
        "dynamic": true,
        "damping": 0,
        "friction": 0,
        "velocity": {"x": 0, "y": 0, "z": 0},
        "lifetime": LIFE_TIME_ANTI_JUNK,
        "billboardMode": "yaw",
        "renderWithZones": visibilityZone
    }, "domain");

    var injector = playLoopingSound(SOUND_LETHAL_VOXECUTOR_WALK, positionGhost, VOXECUTOR_WALK_VOLUME);
    
    var thisGhost = {
        "id": ghostID,
        "cox": CENTER_GRID_X,
        "coy": CENTER_GRID_Y,
        "direction": 0,
        "reversed": false,
        "injector": injector 
    }
    ghost.push(thisGhost);
    playSound(SOUND_VOXECUTOR_NEW_BORN, positionGhost, 0.8);
}

function getInWorldPositionFromGrid(x, y) {
    var position = {"x":ORIGIN_POSITION.x  + ((x - CENTER_GRID_X) * GRID_POINT_SIDE_SIZE),"y": ORIGIN_POSITION.y,"z": ORIGIN_POSITION.z + ((y - CENTER_GRID_Y) * GRID_POINT_SIDE_SIZE)};
    return position;
}

function clearGhost() {
    if (ghost.length > 0) {
        for (var i = 0; i < ghost.length; i++) {
            Entities.deleteEntity(ghost[i].id);
			ghost[i].injector.stop();
        }
    }
    ghost = [];
    numberOfGhost = 0;
}

function manageGhostSoundPosition() {
    if (ghost.length > 0) {
        for (var i = 0; i < ghost.length; i++) {
			ghost[i].injector.setOptions({"position": Entities.getEntityProperties(ghost[i].id, ["position"]).position, "volume": VOXECUTOR_WALK_VOLUME, "loop": true});
        }
    }
}

function deleteSpecificCoin(coinID) {
    var coinNo = getCoinNoFromID(coinID);
    if (coinNo !== -1) {
        Entities.deleteEntity(coinID);
        coins.splice(coinNo, 1);
        addOneCoin();
    }
}

function getCoinNoFromID(coinID) {
    var no = -1
    for (var i = 0; i < coins.length; i++) {
        if (coins[i] === coinID) {
            no = i;
            break;
        }
    }
    return no;
}

function clearCoins() {
    if (coins.length > 0) {
        for (var i = 0; i < coins.length; i++) {
            Entities.deleteEntity(coins[i]);
        }
    }
    coins = [];
}

function addOneCoin() {
    var gx = 0;
    var gy = 0;
    do {
      gx = Math.floor(Math.random() * 17);
      gy = Math.floor(Math.random() * 17);
    } while (GRID[gx][gy] === 1); 
    
    var nominalCoinPosition =  getInWorldPositionFromGrid(gx, gy);
    var coinPosition = {"x": nominalCoinPosition.x + (Math.random() * 6) - 3, "y": nominalCoinPosition.y - 2.5 , "z": nominalCoinPosition.z + (Math.random() * 6) - 3};
    var rotation = Quat.fromVec3Degrees({"x": 0,"y": Math.random() * 360, "z": 0});
    var coinValue = 10;
    var probability = Math.random();
    if (probability < 0.15) { coinValue = 50; }
    if (probability < 0.03) { coinValue = 100; }     
    var coin = Entities.addEntity({
        "name": "COIN_" + coinValue,
        "description": coinValue,
        "type": "Model",
        "modelURL": ROOT + "COIN_" + coinValue + ".fst",
        "useOriginalPivot": true,
        "shapeType": "box",
        "dimensions": {"x": 1, "y": 3, "z": 1},
        "position": coinPosition,
        "rotation": rotation,
        "grab": {
            "grabbable": false
        },            
        "collisionless": true,
        "script": ROOT + "coinTrigger.js",
        "lifetime": 1800,
        "renderWithZones": visibilityZone
    }, "domain");
    coins.push(coin);
}

function addBonus() {
    var drawingPoints = [{"x": 8, "y": 6}, {"x": 8, "y": 10}];
    var electedPointIndex = Math.floor(Math.random() * 2);
    var nominalPosition = getInWorldPositionFromGrid(drawingPoints[electedPointIndex].x, drawingPoints[electedPointIndex].y);
    var bonusPosition = {"x": nominalPosition.x, "y": nominalPosition.y - 2.5 , "z": nominalPosition.z};
    var bonusValue = 500 * (Math.floor(Math.random() * 4) + 1);
    var bonusID = Entities.addEntity({
        "name": "BONUS_" + bonusValue,
        "description": bonusValue,
        "type": "Model",
        "modelURL": ROOT + "BONUS-" + bonusValue + ".fst",
        "useOriginalPivot": true,
        "shapeType": "box",
        "dimensions": {"x": 1.5, "y": 3, "z": 1.5},
        "position": bonusPosition,
        "grab": {
            "grabbable": false
        },
        "angularVelocity": {"x": 0, "y": 1.08, "z": 0},
        "angularDamping": 0,
        "collisionless": true,
        "script": ROOT + "bonusTrigger.js",
        "lifetime": 60,
        "renderWithZones": visibilityZone
    }, "domain");

    var bonusTextID = Entities.addEntity({
        "name": "BONUS-TEXT_" + bonusValue,
        "type": "Text",
        "text": bonusValue,
        "lineHeight": 0.5,
        "textColor": {"red": 122, "green": 213, "blue": 255},
        "backgroundAlpha": 0,
        "unlit": true,
        "alignment": "center",
        "parentID": bonusID,
        "localPosition": {"x": 0, "y": 0.5, "z": 0},
        "billboardMode": "yaw",
        "dimensions": {"x": 1.5, "y": 0.8, "z": 0.01},
        "grab": {
                    "grabbable": false
                },
        "collisionless": true,
        "lifetime": 60,
        "renderWithZones": visibilityZone        
    }, "domain");
    playSound(SOUND_NEW_BONUS, bonusPosition, 1.0);
}

function addWeapons() {
    clearAllWeapons();
    var drawingPoints = [{"x": 1, "y": 1}, {"x": 1, "y": 15}, {"x": 15, "y": 1}, {"x": 15, "y": 15}];
    for (var i=0; i < 4; i++) {
        var nominalPosition = getInWorldPositionFromGrid(drawingPoints[i].x, drawingPoints[i].y);
        var weaponPosition = {"x": nominalPosition.x, "y": nominalPosition.y - 2.5 , "z": nominalPosition.z};
        var weaponID = Entities.addEntity({
            "name": "AXE",
            "type": "Model",
            "modelURL": ROOT + "AXE.fst",
            "useOriginalPivot": true,
            "shapeType": "box",
            "dimensions": {"x": 1.5, "y": 3, "z": 1.5},
            "position": weaponPosition,
            "grab": {
                "grabbable": false
            },
            "angularVelocity": {"x": 0, "y": 1, "z": 0},
            "angularDamping": 0,
            "collisionless": true,
            "script": ROOT + "weaponTrigger.js",
            "lifetime": 120,
            "renderWithZones": visibilityZone
        }, "domain");
        weapons.push(weaponID);
    }
}

function clearAllWeapons() {
    if (weapons.length > 0) {
        for (var i = 0; i < weapons.length; i++) {
            if (weapons[i] !== Uuid.NULL) {
                Entities.deleteEntity(weapons[i]);
            }
        }
        weapons = [];
    }
    
}

function manageGhostMoves() {
    if (gameStatus === "PLAYING") {
        var scale = GRID_POINT_SIDE_SIZE / (updateTimerInterval /1000);
        var move, i, possibleMove, previousCox, previousCoy, velocity, scaledVelocity, name, script, fst;
        for (i = 0; i < ghost.length; i++) {
            name = "VOXECUTOR-" + (i + 1);
            possibleMove = [];
            if (GRID[ghost[i].cox - 1][ghost[i].coy] === 0) {
                if (ghost[i].direction !== 2) {
                    possibleMove.push(1);
                }
            }
            if (GRID[ghost[i].cox + 1][ghost[i].coy] === 0) {
                if (ghost[i].direction !== 1) {
                    possibleMove.push(2);
                }
            }
            if (GRID[ghost[i].cox][ghost[i].coy - 1] === 0) {
                if (ghost[i].direction !== 4) {
                    possibleMove.push(3);
                }
            }
            if (GRID[ghost[i].cox][ghost[i].coy + 1] === 0) {
                if (ghost[i].direction !== 3) {
                    possibleMove.push(4);
                }
            }
            move = possibleMove[Math.floor(Math.random() * possibleMove.length)];
            ghost[i].direction = move;
            previousCox = ghost[i].cox;
            previousCoy = ghost[i].coy;
            switch(move) {
                case 1:
                    ghost[i].cox = ghost[i].cox - 1;
                    velocity = {"x": -1, "y": 0, "z": 0 };
                    break;
                case 2:
                    ghost[i].cox = ghost[i].cox + 1;
                    velocity = {"x": 1, "y": 0, "z": 0 };
                    break;
                case 3:
                    ghost[i].coy = ghost[i].coy - 1;
                    velocity = {"x": 0, "y": 0, "z": -1 };
                    break;
                case 4:
                    ghost[i].coy = ghost[i].coy + 1;
                    velocity = {"x": 0, "y": 0, "z": 1 };
                    break;                
                default:
                    // do nothing
                    ghost[i].direction = 0;
                    velocity = {"x": 0, "y": 0, "z": 0 };
            }
            scaledVelocity = Vec3.multiply(velocity, scale);
            
            if (ghost[i].reversed) {
                //set fst and script for being chased
                fst = ROOT + "chased.fst";
                script = ROOT + "chasedMode.js";
            } else {
                //set fst and script for attack
                fst = getHunterModel(i + 1);
                script = ROOT + "attackMode.js";
            }
            Entities.deleteEntity(ghost[i].id);
            ghost[i].id = Entities.addEntity({
                "name": name,
                "description": i,
                "type": "Model",
                "modelURL": fst,
                "useOriginalPivot": true,
                "shapeType": "box",
                "dimensions": {"x": GRID_POINT_SIDE_SIZE, "y": GRID_POINT_SIDE_SIZE, "z": GRID_POINT_SIDE_SIZE},
                "position": getInWorldPositionFromGrid(previousCox, previousCoy),
                "grab": {
                    "grabbable": false
                },            
                "collisionless": true,
                "dynamic": true,
                "damping": 0,
                "friction": 0,
                "script": script,
                "velocity": scaledVelocity,
                "lifetime": LIFE_TIME_ANTI_JUNK,
                "billboardMode": "yaw",
                "renderWithZones": visibilityZone
            }, "domain");
            if (Math.random() < MINE_GENERATION_PROBABILITY && !ghost[i].reversed) {
                addOneMine(previousCox, previousCoy);
            }
        }
    }
}

function reverseMove() {
    if (ghost.length > 0) {
        for (var i = 0; i < ghost.length; i++) {
            switch(ghost[i].direction) {
                case 1:
                    ghost[i].direction = 2;
                    break;
                case 2:
                    ghost[i].direction = 1;
                    break;
                case 3:
                    ghost[i].direction = 4;
                    break;
                case 4:
                    ghost[i].direction = 3;
                    break;                
                default:
                    // do nothing
            }
            ghost[i].reversed = true;
            ghost[i].injector.stop();
            ghost[i].injector = playLoopingSound(SOUND_WEAK_VOXECUTOR_WALK, Entities.getEntityProperties(ghost[i].id, ["position"]).position, VOXECUTOR_WALK_VOLUME);
        }
    }    
}

function addOneMine(pointX, pointY) {
    var nominalMinePosition =  getInWorldPositionFromGrid(pointX, pointY);
    var mineHeigh = -2.5;
    if (Math.random() > 0.70) {
        if (Math.random() > 0.7) {
            mineHeigh = 2.5;
        } else {
            mineHeigh = 0.5;
        }
    }
    var minePosition = {"x": nominalMinePosition.x + (Math.random() * 6) - 3, "y": nominalMinePosition.y + mineHeigh , "z": nominalMinePosition.z + (Math.random() * 6) - 3};
    var mineID = Entities.addEntity({
        "name": "MINE",
        "type": "Model",
        "modelURL": ROOT + "MINE.fst",
        "useOriginalPivot": true,
        "shapeType": "box",
        "dimensions": {"x": 1.5, "y": 3, "z": 1.5},
        "position": minePosition,
        "grab": {
            "grabbable": false
        },
        "angularVelocity": {"x": 0, "y": 1, "z": 0},
        "angularDamping": 0,
        "collisionless": true,
        "script": ROOT + "mineTrigger.js",
        "lifetime": 20,
        "renderWithZones": visibilityZone
    }, "domain");
}

function attackMode() {
    if (ghost.length > 0) {
        for (var i = 0; i < ghost.length; i++) {
            ghost[i].reversed = false;
            ghost[i].injector.stop();
            ghost[i].injector = playLoopingSound(SOUND_LETHAL_VOXECUTOR_WALK, Entities.getEntityProperties(ghost[i].id, ["position"]).position, VOXECUTOR_WALK_VOLUME);            
        }
    }
    var message = {
        "action": "END_REVERSE"
    };
    Messages.sendMessage(channelComm, JSON.stringify(message));
}

function returnOneGhostHomeAsAttackant(no) {
    ghost[no].reversed = false;
    ghost[no].cox = CENTER_GRID_X;
    ghost[no].coy = CENTER_GRID_Y;
    ghost[no].direction = 0;
    ghost[no].injector.stop();
    ghost[no].injector = playLoopingSound(SOUND_LETHAL_VOXECUTOR_WALK, getInWorldPositionFromGrid(CENTER_GRID_X, CENTER_GRID_Y), VOXECUTOR_WALK_VOLUME);            
    Entities.deleteEntity(ghost[no].id);
}

function onMessageReceived(channel, message, sender, localOnly) {
    if (channel === channelComm) {
        var data = JSON.parse(message);
        if (data.action === "GET_BONUS") { 
            manageTriggerdBonus (data.avatarID, data.bonusID, data.bonusAmount);
            addOneGhost();
        } else if  (data.action === "REVERSE") { 
            Entities.deleteEntity(data.weaponID);
            for (var j = 0; j < weapons.length; j++) {
                if (weapons[j] === data.weaponID) {
                    weapons[j] === Uuid.NULL;
                    break;
                }
            }
            //Playsound REVERSING
            reverseMove();
            updateTimerInterval = CHASED_SPEED_TIME;
            reversedMode = 20;
            weaponBonus = 100;
        } else if (data.action === "RETURN_GHOST") { 
            var ghostDeathPosition =  Entities.getEntityProperties(ghost[data.ghostNo].id, ["position"]).position;
            playSound(SOUND_CATCH_VOXECUTOR, ghostDeathPosition, 1.0);
            managePlayerWhenCatchGhost(data.by);
            ejectBounty(ghostDeathPosition, weaponBonus);
            weaponBonus = weaponBonus * 2;
            returnOneGhostHomeAsAttackant(data.ghostNo);
        } else if (data.action === "PLAYER_ENTERING") {
            addPlayer(data.avatarID, data.name);
        } else if (data.action === "KILLED") {
            killPlayer(data.avatarID, data.ghostNo, data.position);
        } else if (data.action === "KILLED_BY_MINE") {
            killPlayerByMine(data.avatarID, data.mineID, data.position);
        } else if (data.action === "GET_COIN") {
            manageTriggerdCoin(data.avatarID, data.coinID, data.coinAmount);
        }
    }
}

function manageTriggerdBonus (avatarID, bonusID, bonusAmount){
    var message;
    var playerNo = getPlayerNoFromSessionID(avatarID);
    if (playerNo === -1) {
        message = {
            "action": "TELEPORT_USER",
            "avatarID": avatarID,
            "position": determineExitGameToPosition(),
            "orientation": Quat.fromVec3Degrees({"x": 0, "y": (Math.random() * 360), "z": 0})
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));
    } else {
        playSound(SOUND_GET_BONUS, Entities.getEntityProperties(bonusID, ["position"]).position, 1.0);
        players[playerNo].score = players[playerNo].score + bonusAmount;
        Entities.deleteEntity(bonusID);
        message = {
                "action": "PLAYERS_DATA",
                "players": players
            };
        Messages.sendMessage(channelComm, JSON.stringify(message));
    }    
}

function managePlayerWhenCatchGhost(avatarID) {
    var message;
    var playerNo = getPlayerNoFromSessionID(avatarID);
    if (playerNo === -1) {
        message = {
            "action": "TELEPORT_USER",
            "avatarID": avatarID,
            "position": determineExitGameToPosition(),
            "orientation": Quat.fromVec3Degrees({"x": 0, "y": (Math.random() * 360), "z": 0})
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));
    } else {
        players[playerNo].score = players[playerNo].score + weaponBonus;
        message = {
                "action": "PLAYERS_DATA",
                "players": players
            };
        Messages.sendMessage(channelComm, JSON.stringify(message));
    }
};

function manageTriggerdCoin(avatarID, coinID, coinAmount) {
    var message;
    var playerNo = getPlayerNoFromSessionID(avatarID);
    if (playerNo === -1) {
        message = {
            "action": "TELEPORT_USER",
            "avatarID": avatarID,
            "position": determineExitGameToPosition(),
            "orientation": Quat.fromVec3Degrees({"x": 0, "y": (Math.random() * 360), "z": 0})
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));
    } else {
        players[playerNo].score = players[playerNo].score + coinAmount;
        deleteSpecificCoin(coinID);
        message = {
                "action": "PLAYERS_DATA",
                "players": players
            };
        Messages.sendMessage(channelComm, JSON.stringify(message));
    }
};

function killPlayerByMine(avatarID, mineID, deathPosition) {
    var playerNo = getPlayerNoFromSessionID(avatarID);
    var message;
    if (playerNo === -1  || gameStatus === "NOT_STARTED") {
        message = {
            "action": "TELEPORT_USER",
            "avatarID": avatarID,
            "position": determineExitGameToPosition(),
            "orientation": Quat.fromVec3Degrees({"x": 0, "y": (Math.random() * 360), "z": 0})        
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));        
    } else {
        var tpPosition;
        if (life === 0) {
            players[playerNo].state = "DEAD";
            tpPosition = determineExitGameToPosition();
            if (isAllPlayerDead()) {
                endGame();
                isGameEnded = true;
            }
        } else {
            players[playerNo].state = "ALIVE";
            tpPosition = determinePlayerInitialPosition();
        }

        life = life - 1;
        if (life < 0) { 
            life = 0; 
        }
        
        if (!isGameEnded) {
            message = {
                "action": "LIFE_COUNT_UPDATE",
                "life": life      
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
        }
        message = {
            "action": "TELEPORT_USER",
            "avatarID": avatarID,
            "position": tpPosition,
            "orientation": Quat.fromVec3Degrees({"x": 0, "y": (Math.random() * 360), "z": 0})        
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));        
        playSound(SOUND_AVATAR_KILLED, deathPosition, 1);
        Entities.deleteEntity(mineID);
        ejectBones(deathPosition);
        message = {
            "action": "I_DIED",
            "avatarID": avatarID       
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));        
    }
}

function killPlayer(avatarID, ghostNo, deathPosition) {
    var playerNo = getPlayerNoFromSessionID(avatarID);
    var message;
    if (playerNo === -1 || gameStatus === "NOT_STARTED") {
        message = {
            "action": "TELEPORT_USER",
            "avatarID": avatarID,
            "position": determineExitGameToPosition(),
            "orientation": Quat.fromVec3Degrees({"x": 0, "y": (Math.random() * 360), "z": 0})        
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));        
    } else {
        var tpPosition;
        var isGameEnded = false;
        if (life === 0) {
            players[playerNo].state = "DEAD";
            tpPosition = determineExitGameToPosition();
            if (isAllPlayerDead()) {
                endGame();
                isGameEnded = true;
            }
        } else {
            players[playerNo].state = "ALIVE";
            tpPosition = determinePlayerInitialPosition();
        }

        life = life - 1;
        if (life < 0) { 
            life = 0; 
        }
        
        if (!isGameEnded) {
            message = {
                "action": "LIFE_COUNT_UPDATE",
                "life": life      
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
        }

        message = {
            "action": "TELEPORT_USER",
            "avatarID": avatarID,
            "position": tpPosition,
            "orientation": Quat.fromVec3Degrees({"x": 0, "y": (Math.random() * 360), "z": 0})        
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));
        playSound(SOUND_AVATAR_KILLED, deathPosition, 1);
        if (!isGameEnded) {
            var properties = Entities.getEntityProperties(ghost[ghostNo].id, ["velocity", "position"]);
            var ghostVelocity = properties.velocity;
            var ghostPosition = properties.position;
            Entities.deleteEntity(ghost[ghostNo].id);       
            ghost[ghostNo].id = Entities.addEntity({
                    "name": "VOXECUTOR-" + (ghostNo + 1),
                    "description": ghostNo,
                    "type": "Model",
                    "modelURL": getHunterModel(ghostNo + 1),
                    "useOriginalPivot": true,
                    "shapeType": "box",
                    "dimensions": {"x": GRID_POINT_SIDE_SIZE, "y": GRID_POINT_SIDE_SIZE, "z": GRID_POINT_SIDE_SIZE},
                    "position": ghostPosition,
                    "grab": {
                        "grabbable": false
                    },            
                    "collisionless": true,
                    "dynamic": true,
                    "damping": 0,
                    "friction": 0,
                    "script": ROOT + "attackMode.js",
                    "velocity": ghostVelocity,
                    "lifetime": LIFE_TIME_ANTI_JUNK,
                    "billboardMode": "none",
                    "angularDamping": 0, 
                    "angularVelocity": {"x": 0, "y": 10, "z": 0},
                    "renderWithZones": visibilityZone            
                }, "domain");
        }
        ejectBones(deathPosition);
        message = {
            "action": "I_DIED",
            "avatarID": avatarID       
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));         
    }
    
}

function ejectBones(position){
    for (var i = 0; i < 40; i++) {
        var ejectionBoneVelocity = {"x": (Math.random() * 10)-5, "y": (Math.random() * 10)-5, "z": (Math.random() * 10)-5};
        var angularBoneVelocity = {"x": (Math.random() * 6)-3, "y": (Math.random() * 6)-3, "z": (Math.random() * 6)-3};
        var boneScale = 0.9 + (Math.random() * 1.4);
        if (Math.random() > 0.7) {
            boneID = Entities.addEntity({
                "name": "AVATAR-BONE",
                "type": "Model",
                "modelURL": ROOT + "AVATAR_BONE.fbx",
                "useOriginalPivot": false,
                "shapeType": "box",
                "dimensions": Vec3.multiply({"x": 0.035, "y": 0.2, "z": 0.035}, boneScale),
                "position": position,
                "grab": {
                    "grabbable": true
                },            
                "dynamic": true,
                "gravity": { "x": 0, "y": -9.8, "z": 0 },
                "restitution": 0.4,
                "friction": 0.3,
                "angularVelocity": angularBoneVelocity,
                "velocity": ejectionBoneVelocity,
                "lifetime": 20 + (Math.floor(Math.random() * 21)),
                "renderWithZones": visibilityZone
            }, "domain");
        } else {
            boneID = Entities.addEntity({
                "name": "AVATAR-VOXEL",
                "type": "Shape",
                "shape": "Cube",
                "dimensions": {"x": 0.04, "y": 0.04, "z": 0.04},
                "position": position,
                "grab": {
                    "grabbable": true
                },
                "color": {
                    "red": 196,
                    "green": 0,
                    "blue": 0
                },
                "dynamic": true,
                "gravity": { "x": 0, "y": -9.8, "z": 0 },
                "restitution": 0.4,
                "friction": 0.3,
                "angularVelocity": angularBoneVelocity,
                "velocity": ejectionBoneVelocity,
                "lifetime": 10 + (Math.floor(Math.random() * 8)),
                "renderWithZones": visibilityZone
            }, "domain");            
        }
    }
}

function ejectBounty(position, bounty) {
    for (var i = 0; i < 12; i++) {
        var ejectionBountyVelocity = {"x": (Math.random() * 10)-5, "y": 0, "z": (Math.random() * 10)-5};
        boneID = Entities.addEntity({
            "name": "BOUNTY-" + bounty,
            "type": "Text",
            "dimensions": {"x": 3, "y": 1, "z": 0.01},
            "position": {"x": position.x, "y": position.y - 2, "z": position.z},
            "text": bounty,
            "lineHeight": 0.5,
            "textColor": { "red": 255, "green": 128, "blue": 0 },
            "backgroundAlpha": 0,
            "unlit": true,
            "alignment": "center",
            "grab": {
                "grabbable": true
            },            
            "dynamic": false,
            "collisionless": true,
            "gravity": { "x": 0, "y": 2, "z": 0 },
            "friction": 0,
            "velocity": ejectionBountyVelocity,
            "lifetime": 5 + (Math.floor(Math.random() * 8)),
            "renderWithZones": visibilityZone,
            "billboardMode": "full"
        }, "domain");
    }
}

function endGame() {
    //COMPILE GAME DATA  
    var today = new Date();
    var duration = today.getTime() - gameDurationStart;

    var nbrPlayers = players.length;
    
    var winnerName;
    var winnerScore = 0;
    var participants = "";
    var teamScore = 0;
    for (var h = 0; h < nbrPlayers; h++) {
        if (players[h].score > winnerScore) {
            winnerName = players[h].name;
            winnerScore = players[h].score;
            if (participants !== "") {
                participants = players[h].name + " (" + players[h].score + "), " + participants;
            } else {
                participants = players[h].name + " (" + players[h].score + ")";
            }
        } else {
            if (participants !== "") {
                participants = participants + ", " + players[h].name + " (" + players[h].score + ")";
            } else {
                participants = players[h].name + " (" + players[h].score + ")";
            }
        }
        teamScore = teamScore + players[h].score;
    }
    
    var url = ROOT + "web/statDepot.php?k=ak363zp&winame=" + encodeURI(winnerName);
    url = url + "&wiscore=" + winnerScore + "&tscore=" + teamScore + "&nplayers=" + nbrPlayers;
    url = url + "&dura=" + Math.floor(duration/1000) + "&memb=" + encodeURI(participants.substr(0, 1000));
    returnAllPlayersToLobby(); 
    players = [];
    unlockStartPortal();
    gameStatus = "NOT_STARTED";
    Script.update.disconnect(myTimer);
    clearGhost();
    clearCoins();
    clearAllWeapons();
    clearGlassCeiling();
    var message = {
        "action": "GAME_END"
    };
    Messages.sendMessage(channelComm, JSON.stringify(message));
    //print("VOXECUTOR: " + url); //DEBUG
    //Send stat here
    var requestResponse = postGameStat(url);
    if (requestResponse !== "SAVED") {
        print("VOXECUTOR ERROR STAT COMMUNICATION TEXT: " + requestResponse);
        //print("VOXECUTOR REQUESTED URL: " + url);
    }
}

function postGameStat(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.timeout = 15000; // 15 sec.
    xhr.ontimeout = function (e) {
        return "TIMEOUT";
    };
    xhr.send( null );
    return xhr.responseText;
}

function lockStartPortal() {
    if (portalLockerID === Uuid.NULL) {
        portalLockerID = Entities.addEntity({
            "type": "Shape",
            "shape": "Cylinder",
            "color": {"red": 255, "green": 0, "blue": 0},
            "alpha": 1,
            "dimensions": {
                "x": 2.4,
                "y": 3.7,
                "z": 2.4
            },
            "renderWithZones": visibilityZone,
            "position": Vec3.sum( ORIGIN_POSITION, { "x": 8.3, "y": 16, "z": 0 }),
            "visible": false,
            "canCastShadow": false,
            "collisionless": false,
            "name": "ENTRANCE-LOCKER",
            "lifetime": 7200,
        }, "domain");
    }    
}

function unlockStartPortal() {
    if (portalLockerID !== Uuid.NULL) {
        Entities.deleteEntity(portalLockerID);
    }
    portalLockerID = Uuid.NULL;
}

function isAllPlayerDead() {
    var response = true;
    for (var i = 0; i < players.length; i++) {
        if (players[i].state === "ALIVE") {
            response = false;
            break;
        }
    }
    return response;    
}

function getPlayerNoFromSessionID(avatarID) {
    var no = -1
    for (var i = 0; i < players.length; i++) {
        if (players[i].id === avatarID) {
            no = i;
            break;
        }
    }
    return no;
}

function myTimer(deltaTime) {
    var today = new Date();
    var todayAgain;
    switch (gameStatus) {
        case "PLAYING":
            if ((today.getTime() - processTimer) > updateTimerInterval ) {
                if (reversedMode > 0) {
                    reversedMode = reversedMode - 1;
                    if (reversedMode === 0) {
                        updateTimerInterval = HUNT_SPEED_TIME;
                        attackMode();
                    }
                }
                if (numberOfGhost < 4) {
                    addOneGhost();
                } else {
                    manageGhostMoves();
                }
                todayAgain = new Date();
                processTimer = todayAgain.getTime();
            }
            if ((today.getTime() - weaponsProcessTimer) > weaponsUpdateTimerInterval ) {
                numberOfExpectedGhost++;
                addWeapons();
                if (numberOfGhost < numberOfExpectedGhost) {
                    addOneGhost();
                }
                todayAgain = new Date();
                weaponsProcessTimer = todayAgain.getTime();
                checkIfthereAreStillPlayers();
            }
            if ((today.getTime() - bonusProcessTimer) > bonusUpdateTimerInterval ) {
                addBonus();
                todayAgain = new Date();
                bonusProcessTimer = todayAgain.getTime();
            }
            if ((today.getTime() - ghostSoundProcessTimer) > ghostSoundTimerInterval ) {
                manageGhostSoundPosition();
                todayAgain = new Date();
                ghostSoundProcessTimer = todayAgain.getTime();
            }

            if ((today.getTime() - statProcessTimer) > statTimerInterval ) {
                var messageStat = {
                    "action": "LIFE_COUNT_UPDATE",
                    "life": life
                };
                Messages.sendMessage(channelComm, JSON.stringify(messageStat));
                messageStat = {
                    "action": "PLAYERS_DATA",
                    "players": players
                };
                Messages.sendMessage(channelComm, JSON.stringify(messageStat));                
                todayAgain = new Date();
                statProcessTimer = todayAgain.getTime();
            }            
            break;
        case "JOINING":
            if ((today.getTime() - processTimer) > updateTimerInterval ) {
                countDown = countDown - 1;
                var message = {
                    "action": "JOINING_COUNTDOWN",
                    "second": countDown
                };
                Messages.sendMessage(channelComm, JSON.stringify(message));
                if (countDown < 0) {
                    Script.update.disconnect(myTimer);
                    initiateGame();
                    checkIfthereAreStillPlayers();
                }
                today = new Date();
                processTimer = today.getTime();
            }
            break;
    }

}

function checkIfthereAreStillPlayers() {
    if (gameStatus === "PLAYING") {
        var someonePlaying = false;
        var avatars = AvatarList.getAvatarsInRange(ORIGIN_POSITION, 15 * GRID_POINT_SIDE_SIZE);
        if (avatars.length !== 0 ) {
            for (var i = 0; i < avatars.length; i++) {
                var avatar = AvatarList.getAvatar(avatars[i]);
                if (avatar.position.y < (ORIGIN_POSITION.y + 4)) {
                    someonePlaying = true;
                    break;
                }
            }
        }
        if (!someonePlaying) {
            endGame();
            isGameEnded = true;
        }
    }
}

function returnAllPlayersToLobby() {
    var message;
    var avatars = AvatarList.getAvatarsInRange(ORIGIN_POSITION, 15 * GRID_POINT_SIDE_SIZE);
    if (avatars.length !== 0 ) {
        for (var i = 0; i < avatars.length; i++) {
            var avatar = AvatarList.getAvatar(avatars[i]);
            if (avatar.position.y < (ORIGIN_POSITION.y + 4)) {
                message = {
                    "action": "TELEPORT_USER",
                    "avatarID": avatar.sessionUUID,
                    "position": determineExitGameToPosition(),
                    "orientation": Quat.fromVec3Degrees({"x": 0, "y": (Math.random() * 360), "z": 0})        
                };
                Messages.sendMessage(channelComm, JSON.stringify(message)); 
            }
        }
    }
}

function playSound(sound, position, volume) {
    var injectorOptions = {
        "position": position,
        "volume": volume,
        "loop": false,
        "localOnly": false
    };
    var injector = Audio.playSound(sound, injectorOptions);
}

function playLoopingSound(sound, position, volume) {
    var injectorOptions = {
        "position": position,
        "volume": volume,
        "loop": true,
        "localOnly": false
    };
    return injector = Audio.playSound(sound, injectorOptions);
}

Messages.subscribe(channelComm);
Messages.messageReceived.connect(onMessageReceived);

var SOUND_AVATAR_KILLED = SoundCache.getSound(ROOT + "sounds/avatarKilled.wav");
var SOUND_LETHAL_VOXECUTOR_WALK = SoundCache.getSound(ROOT + "sounds/voxecutorLethalWalk.wav");
var SOUND_WEAK_VOXECUTOR_WALK = SoundCache.getSound(ROOT + "sounds/voxecutorWeakWalk.wav");
var SOUND_VOXECUTOR_NEW_BORN = SoundCache.getSound(ROOT + "sounds/voxecutorNewBorn.wav");
var SOUND_NEW_BONUS = SoundCache.getSound(ROOT + "sounds/newBonus.wav");
var SOUND_CATCH_VOXECUTOR = SoundCache.getSound(ROOT + "sounds/catchVoxecutor.wav");
var SOUND_GET_BONUS = SoundCache.getSound(ROOT + "sounds/getBonus.wav");
var SOUND_START_GAME = SoundCache.getSound(ROOT + "sounds/startGame.wav");

Script.scriptEnding.connect(function () {
    unlockStartPortal();
    clearGhost();
    clearCoins();
    clearAllWeapons();
    clearGlassCeiling();
    Messages.messageReceived.disconnect(onMessageReceived);
    Messages.unsubscribe(channelComm);
    Script.update.disconnect(myTimer);
});

