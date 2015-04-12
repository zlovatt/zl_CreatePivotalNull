/**********************************************************************************************
    zl_CreateCornerNull
    Copyright (c) 2013 Zack Lovatt. All rights reserved.
    zack@zacklovatt.com
 
    Name: zl_CreateCornerNull
    Version: 0.2
 
    Description:
        This script looks at a selected shape layer and breaks apart all vector
        groups & paths into separate layers. Handy if you're converting AI layers.
        
        If you have general effects applied at the end (fill, stroke, other effects),
        they will remain present on each layer.

        Originally requested by Jayse Hansen (jayse.tv)

        This script is provided "as is," without warranty of any kind, expressed
        or implied. In no event shall the author be held liable for any damages 
        arising in any way from the use of this script.
        
**********************************************************************************************/

    var zl_CCN__scriptName = "zl_CreateCornerNull";
    
    /****************************** 
        zl_CreateCornerNull()
    
        Description:
        This function contains the main logic for this script.
     
        Parameters:
        thisObj - "this" object.
        curPos - position to put null
     
        Returns:
        Nothing.
    ******************************/
    function zl_CreateCornerNull(thisObj, curPos, parentNull, xOffset, yOffset){

        var thisComp = app.project.activeItem;
        app.project.activeItem.selected = true;
                
        var userLayers = thisComp.selectedLayers;
        
        for (var i = 0; i < userLayers.length; i++){
            var thisLayer = userLayers[i];
            var newNull = thisComp.layers.addNull();
            
            newNull.moveBefore(thisLayer);

            if (thisLayer.threeDLayer == true)
                newNull.threeDLayer = true;
                
            zl_CreateCornerNull_moveNull(thisComp, thisLayer, newNull, curPos, xOffset, yOffset);
            
            if (parentNull == true)
                newNull.parent = thisLayer;
        }
        
    } // end function CreateCornerNull


    /****************************** 
        zl_CreateCornerNull_moveNull()
          
        Description:
        centres the anchor point of current layer
         
        Parameters:
        targetLayer - layer to strip down
        vectorGroupCollection - collection of all shape groups (not effects)
        targetIndex - index of the shape to keep for this layer
        
        Returns:
        Array of shape group indices
     ******************************/
    function zl_CreateCornerNull_moveNull(thisComp, sourceLayer, targetLayer, targetPos, xOffset, yOffset){
        var sourceRect = sourceLayer.sourceRectAtTime(thisComp.time,false);
        var newPos = [sourceRect.width/2, sourceRect.height/2, 0];

        switch (targetPos){
            case 0:
                newPos = [0, 0, 0];
                break;
            case 1:
                newPos = [sourceRect.width/2, 0, 0];
                break;
            case 2:
                newPos = [sourceRect.width, 0, 0];
                break;
            case 3:
                newPos = [0, sourceRect.height/2, 0];
                break;
            case 4:
                newPos = [sourceRect.width/2, sourceRect.height/2, 0];
                break;
            case 5:
                newPos = [sourceRect.width, sourceRect.height/2, 0];
                break;
            case 6:
                newPos = [0, sourceRect.height, 0];
                break;
            case 7:
                newPos = [sourceRect.width/2, sourceRect.height, 0];
                break;
            case 8:
                newPos = [sourceRect.width, sourceRect.height, 0];
                break;
        }
    
        var oldAnch = sourceLayer.anchorPoint.value;

        var xAdjust = newPos[0] + sourceRect.left;
        var yAdjust = newPos[1] + sourceRect.top;
        
        var xShift = (xAdjust - oldAnch[0]) * (sourceLayer.scale.value[0]/100);
        var yShift = (yAdjust - oldAnch[1])  * (sourceLayer.scale.value[1]/100);    
        var zShift = (oldAnch[2]) * (sourceLayer.scale.value[2]/100);
        
        var xPos = sourceLayer.position.value[0];
        var yPos = sourceLayer.position.value[1];
        var zPos = sourceLayer.position.value[2];

        targetLayer.position.setValue([xPos + xShift + xOffset, yPos + yShift + yOffset, zPos + zShift]);
                
    } // end function moveNull
    
    
    /****************************** 
        zl_CreateCornerNull_createPalette()
          
        Description:
        Creates ScriptUI Palette Panel
        Generated using Boethos (crgreen.com/boethos)
        
        Parameters:
        thisObj - this comp object
        
        Returns:
        Nothing
     ******************************/
    function zl_CreateCornerNull_createPalette(thisObj) { 
        var win = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'Create Corner Null',[371,147,531,457]); 
        var curPos = 0; // 360,147,570,339
        var parentNull = false;
        
        { // Corners    
            win.cornerGroup = win.add('panel', [14,14,145,133], 'Corner', {borderStyle: "etched"}); 
            
            { // Top Row
                win.a1 = win.cornerGroup.add('radiobutton', [18,17,48,39], ''); 
                win.a2 = win.cornerGroup.add('radiobutton', [58,17,88,39], ''); 
                win.a3 = win.cornerGroup.add('radiobutton', [98,17,128,39], ''); 
            }

            { // Middle Row
                win.b1 = win.cornerGroup.add('radiobutton', [18,47,48,69], ''); 
                win.b2 = win.cornerGroup.add('radiobutton', [58,47,88,69], ''); 
                win.b3 = win.cornerGroup.add('radiobutton', [98,47,128,69], ''); 
            }

            { // Bottom Row
                win.c1 = win.cornerGroup.add('radiobutton', [18,77,48,99], ''); 
                win.c2 = win.cornerGroup.add('radiobutton', [58,77,88,99], ''); 
                win.c3 = win.cornerGroup.add('radiobutton', [98,77,128,99], ''); 
            }
        
            win.b2.value = true;
            curPos = 4;
        }

        { // Options
            win.optionGroup = win.add('panel', [14,186,145,295], 'Options', {borderStyle: "etched"});
            win.parentOption = win.add('checkbox', [33,204,142,226], 'Parent to layer'); 
            win.parentOption.value = false; 

            { // xOffset Line
                win.xOffLabel = win.optionGroup.add('statictext', [10,40,60,60], 'X Offset'); 
                win.xOffLabel.justify = 'right'; 
                win.xOffInput = win.optionGroup.add('edittext', [65,37,95,59], ''); 
                win.xOffInput.text = "0";
                win.xOffPixels = win.optionGroup.add('statictext', [98,40,118,60], 'px'); 
                win.xOffPixels.justify = 'left'; 
            }
    
            { // yOffset Line
                win.xOffLabel = win.optionGroup.add('statictext', [10,70,60,90], 'Y Offset'); 
                win.xOffLabel.justify = 'right'; 
                win.yOffInput = win.optionGroup.add('edittext', [65,67,95,89], ''); 
                win.yOffInput.text = "0";
                win.yOffPixels = win.optionGroup.add('statictext', [98,70,118,90], 'px'); 
                win.yOffPixels.justify = 'left'; 
            }
        }

        { // Buttons
            win.explodeButton = win.add('button', [12,149,146,175], 'Create'); 
            win.explodeButton.onClick = function () {
                for (var i = 0; i < win.cornerGroup.children.length; i++){
                    if (win.cornerGroup.children[i].value == true){
                        curPos = i;
                    }
                }
            
                var parentNull = win.parentOption.value;
                var xOffset = parseInt(win.xOffInput.text);
                var yOffset = parseInt(win.yOffInput.text);
                                
                if (app.project) {
                    var activeItem = app.project.activeItem;
                    if (activeItem != null && (activeItem instanceof CompItem)) {
                        app.beginUndoGroup(zl_CCN__scriptName);
                        zl_CreateCornerNull(thisObj, curPos, parentNull, xOffset, yOffset);
                        app.endUndoGroup();
                    } else {
                        alert("Select a layer!", zl_CCN__scriptName);
                    }
                } else {
                    alert("Open a project!", zl_CCN__scriptName);
                }
            }
        }

        
        if (win instanceof Window) {
            win.show();
        } else {
            win.layout.layout(true);
        }
    } // end function createPalette


    /****************************** 
        zl_CreateCornerNull_main()
          
        Description:
        Main function
            
        Parameters:
        thisObj - this comp object
        
        Returns:
        Nothing
     ******************************/
    function zl_CreateCornerNull_main(thisObj) {
        zl_CreateCornerNull_createPalette(thisObj);
    } // end function main

    // RUN!
    zl_CreateCornerNull_main(this);