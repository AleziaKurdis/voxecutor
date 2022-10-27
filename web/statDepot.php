<?php 
//
//  userManager.js
//
//  Created by Alezia Kurdis on October 14th, 2022
//  Copyright 2022 Alezia Kurdis.
//
//  Voxecutor game - webservice to collect game statistic.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

if ((isset($_GET["k"])) && (!empty($_GET["k"]))){
	$k = $_GET["k"];
    if ($k == "ak464zp") {
        
        if ((isset($_GET["winame"])) && (!empty($_GET["winame"]))){
            $winnerName = $_GET["winame"];
            
            if ((isset($_GET["wiscore"])) && (!empty($_GET["wiscore"]))){
                $winnerScore = (int)$_GET["wiscore"];
                
                if ((isset($_GET["tscore"])) && (!empty($_GET["tscore"]))){
                    $teamScore = (int)$_GET["tscore"];
                    
                    if ((isset($_GET["nplayers"])) && (!empty($_GET["nplayers"]))){
                        $nbrPlayers = (int)$_GET["nplayers"];
                        
                        if ((isset($_GET["dura"])) && (!empty($_GET["dura"]))){
                            $gameDuration = (int)$_GET["dura"];
                            
                            if ((isset($_GET["memb"])) && (!empty($_GET["memb"]))){
                                $playersList = $_GET["memb"];
                                $timestamp = date("j M Y G:i");
                                saveStat($winnerName, $winnerScore, $teamScore, $nbrPlayers, $gameDuration, $playersList, $timestamp);
                                echo("SAVED");
                                
                            } else {
                                echo("ERROR 7");
                            }                              
                                                        
                            
                            
                        } else {
                            echo("ERROR 6");
                        }                              
                            
                        
                    } else {
                        echo("ERROR 5");
                    }                    
                    
                    
                } else {
                    echo("ERROR 4");
                }

            } else {
                echo("ERROR 3");
            }
        } else {
            echo("ERROR 2");
        }
    } else {
        echo("ERROR 1");
    }
} else {
    echo("ERROR 1");
}

function saveStat($winnerName, $winnerScore, $teamScore, $nbrPlayers, $gameDuration, $playersList, $timestamp) {
    $nbrToKeep = 50;
 
    //Top player score
    $filename = "top_player_score_all.json";
    $data = file_get_contents($filename);
    if ($data == false) {
        $data = "[]";
    }
    $top = json_decode($data);

    $newtop = array();
    $entry = array("winnerName" => $winnerName, "winnerScore" => $winnerScore, "nbrPlayers" => $nbrPlayers, "gameDuration" => $gameDuration, "timestamp" => $timestamp);

    if (count($top) == 0) {
        array_push($newtop, $entry);
    } else {
        $inserted = false;
        $counter = 0;
        foreach ($top as $record) {
            $score = $record->winnerScore;
            if ( $score < $winnerScore && $inserted == false) {
                if ($counter < $nbrToKeep) {
                    array_push($newtop, $entry);
                    $inserted = true;
                    $counter++;
                }
            }
            if ($counter < $nbrToKeep) {
                array_push($newtop, $record);
                $counter++;
            }
        }
        if ($counter < $nbrToKeep && $inserted == false) {
            array_push($newtop, $entry);
        }
    }
    $newContent = json_encode($newtop);       
    file_put_contents($filename, $newContent);    
 

    //Top player score (single player)
    if ( $nbrPlayers == 1) {
        $filename = "top_player_score_sp.json";
        $data = file_get_contents($filename);
        if ($data == false) {
            $data = "[]";
        }
        $top = json_decode($data);

        $newtop = array();
        $entry = array("winnerName" => $winnerName, "winnerScore" => $winnerScore, "gameDuration" => $gameDuration, "timestamp" => $timestamp);

        if (count($top) == 0) {
            array_push($newtop, $entry);
        } else {
            $inserted = false;
            $counter = 0;
            foreach ($top as $record) {
                $score = $record->winnerScore;
                if ( $score < $winnerScore && $inserted == false) {
                    if ($counter < $nbrToKeep) {
                        array_push($newtop, $entry);
                        $inserted = true;
                        $counter++;
                    }
                }
                if ($counter < $nbrToKeep) {
                    array_push($newtop, $record);
                    $counter++;
                }
            }
            if ($counter < $nbrToKeep && $inserted == false) {
                array_push($newtop, $entry);
            }
        }
        $newContent = json_encode($newtop);       
        file_put_contents($filename, $newContent);
    }

    //Top longest game (single player)
    if ( $nbrPlayers == 1) {
        $filename = "top_game_duration_sp.json";
        $data = file_get_contents($filename);
        if ($data == false) {
            $data = "[]";
        }
        $top = json_decode($data);

        $newtop = array();
        $entry = array("winnerName" => $winnerName, "winnerScore" => $winnerScore, "gameDuration" => $gameDuration, "timestamp" => $timestamp);

        if (count($top) == 0) {
            array_push($newtop, $entry);
        } else {
            $inserted = false;
            $counter = 0;
            foreach ($top as $record) {
                $duration = $record->gameDuration;
                if ( $duration < $gameDuration && $inserted == false) {
                    if ($counter < $nbrToKeep) {
                        array_push($newtop, $entry);
                        $inserted = true;
                        $counter++;
                    }
                }
                if ($counter < $nbrToKeep) {
                    array_push($newtop, $record);
                    $counter++;
                }
            }
            if ($counter < $nbrToKeep && $inserted == false) {
                array_push($newtop, $entry);
            }
        }
        $newContent = json_encode($newtop);       
        file_put_contents($filename, $newContent);        
    } 

    //Top player score (multiplayer)
    if ( $nbrPlayers > 1) {
        $filename = "top_player_score_mp.json";
        $data = file_get_contents($filename);
        if ($data == false) {
            $data = "[]";
        }
        $top = json_decode($data);

        $newtop = array();
        $entry = array("winnerName" => $winnerName, "winnerScore" => $winnerScore, "nbrPlayers" => $nbrPlayers, "playersList" => $playersList, "teamScore" => $teamScore, "gameDuration" => $gameDuration, "timestamp" => $timestamp);

        if (count($top) == 0) {
            array_push($newtop, $entry);
        } else {
            $inserted = false;
            $counter = 0;
            foreach ($top as $record) {
                $score = $record->winnerScore;
                if ( $score < $winnerScore && $inserted == false) {
                    if ($counter < $nbrToKeep) {
                        array_push($newtop, $entry);
                        $inserted = true;
                        $counter++;
                    }
                }
                if ($counter < $nbrToKeep) {
                    array_push($newtop, $record);
                    $counter++;
                }
            }
            if ($counter < $nbrToKeep && $inserted == false) {
                array_push($newtop, $entry);
            }
        }
        $newContent = json_encode($newtop);       
        file_put_contents($filename, $newContent);        
    }
  

    //Top collective score (multiplayer)
    if ( $nbrPlayers > 1) {
        $filename = "top_team_score_mp.json";
        $data = file_get_contents($filename);
        if ($data == false) {
            $data = "[]";
        }
        $top = json_decode($data);

        $newtop = array();
        $entry = array("teamScore" => $teamScore, "nbrPlayers" => $nbrPlayers, "playersList" => $playersList, "gameDuration" => $gameDuration, "timestamp" => $timestamp);

        if (count($top) == 0) {
            array_push($newtop, $entry);
        } else {
            $inserted = false;
            $counter = 0;
            foreach ($top as $record) {
                $score = $record->teamScore;
                if ( $score < $teamScore && $inserted == false) {
                    if ($counter < $nbrToKeep) {
                        array_push($newtop, $entry);
                        $inserted = true;
                        $counter++;
                    }
                }
                if ($counter < $nbrToKeep) {
                    array_push($newtop, $record);
                    $counter++;
                }
            }
            if ($counter < $nbrToKeep && $inserted == false) {
                array_push($newtop, $entry);
            }
        }
        $newContent = json_encode($newtop);       
        file_put_contents($filename, $newContent);          
    }

    //Top longest game (multiplayer)
    if ( $nbrPlayers > 1) {
        $filename = "top_game_duration_mp.json";
        $data = file_get_contents($filename);
        if ($data == false) {
            $data = "[]";
        }
        $top = json_decode($data);

        $newtop = array();
        $entry = array("teamScore" => $teamScore, "nbrPlayers" => $nbrPlayers, "playersList" => $playersList, "gameDuration" => $gameDuration, "timestamp" => $timestamp);

        if (count($top) == 0) {
            array_push($newtop, $entry);
        } else {
            $inserted = false;
            $counter = 0;
            foreach ($top as $record) {
                $duration = $record->gameDuration;
                if ( $duration < $gameDuration && $inserted == false) {
                    if ($counter < $nbrToKeep) {
                        array_push($newtop, $entry);
                        $inserted = true;
                        $counter++;
                    }
                }
                if ($counter < $nbrToKeep) {
                    array_push($newtop, $record);
                    $counter++;
                }
            }
            if ($counter < $nbrToKeep && $inserted == false) {
                array_push($newtop, $entry);
            }
        }
        $newContent = json_encode($newtop);       
        file_put_contents($filename, $newContent);           
    }


    //Top largest number of participant
    $filename = "top_number_players.json";
    $data = file_get_contents($filename);
    if ($data == false) {
        $data = "1";
    }
    $theMax = intval($data);
    if ($nbrPlayers > $theMax) {
        $theMax = $nbrPlayers;
    }

    $newContent = "".$theMax;       
    file_put_contents($filename, $newContent);   


    //Last 24h games
    $filename = "last50games.json";
    $data = file_get_contents($filename);
    if ($data == false) {
        $data = "[]";
    }
    $top = json_decode($data);

    $newtop = array();
    $entry = array("winnerName" => $winnerName, "winnerScore" => $winnerScore, "nbrPlayers" => $nbrPlayers, "teamScore" => $teamScore, "playersList" => $playersList, "gameDuration" => $gameDuration, "timestamp" => $timestamp);
    array_push($newtop, $entry);
    if (count($top) > 0) {
        $counter = 1;
        foreach ($top as $record) {
            if ($counter < $nbrToKeep) {
                array_push($newtop, $record);
                $counter++;
            }
        }
    }
    $newContent = json_encode($newtop);       
    file_put_contents($filename, $newContent);   

}

?>