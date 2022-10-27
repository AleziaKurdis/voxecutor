# voxecutor
Voxecutor - VR arena game, single and multiplayer for the Overte platform.
  
  
# INSTALLATION  

1- You must deploy the file "VOXECUTOR_INSTALLATION.json" in your domain. This will add some entities including the 2 main entities:  
- VOXECUTOR_VISIBILITY_ZONE_(X!X)  
- VOXECUTOR_ARENA  
   
(Do not rename those entities)  
  
    
2- You will need to copy the position of the "VOXECUTOR_ARENA" and copy this position at the line 18 of the script "AC_voxecutor.js" for the variable: ORIGIN_POSITION  
(This is critical to have the ACscript synchronized with the maze)  
  
    
3- Using the Create app, You will need to adjust those 2 properties of the zone "VOXECUTOR_VISIBILITY_ZONE_(X!X)":  
"hazeCeiling"  
"hazeBaseRef"  
(you must keep them relative to the ORIGIN_POSITION.y you have set, considering that their current value are currently relative to 8000)  
    
    
4- In your domain server's script you must add the AC script "AC_voxecutor.js".  
   
    
5- the service that compile the statistic of the game is built in php (this won't run from the github page). If you want this to be functional, install all the files on a webserver running php. You will have to replace the github url in the "VOXECUTOR_INSTALLATION.json" before proceeding to the installation.
