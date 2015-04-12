/**********************************************************************************************
    zl_CreateCornerNull
    Copyright (c) 2013 Zack Lovatt. All rights reserved.
    zack@zacklovatt.com
 
    Name: zl_CreateCornerNull
    Version: 0.1
 
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
	 
        Returns:
        Nothing.
	******************************/
    function zl_CreateCornerNull(thisObj, curPos){

        var thisComp = app.project.activeItem;
        app.project.activeItem.selected = true;
        var thisLayer = thisComp.selectedLayers[0];

        // Error checking; ensure shape layer is selected
 /*       if (!(thisLayer instanceof CompItem)){
            alert("Select a layer! 2");
            return;
        }
*/

        var vectorGroupCollection = new Array;        
        var shapeGroupCollection = thisLayer.property(2);
        var numGroups = shapeGroupCollection.numProperties;

        // Build our initial list of shape object indices
        vectorGroupCollection = zl_CreateCornerNull_makeShapeIndexList(numGroups, shapeGroupCollection);

        // As we now know the # of shape groups, we know how many layers to make.
        // Make them, and for each one isolate one shape object
        for (var i = 0; i < vectorGroupCollection.length; i++){
            thisLayer.duplicate();
            zl_CreateCornerNull_isolateGroup(thisComp.layer(thisLayer.index-1), vectorGroupCollection, i);
            if (zl_ESL__centreAnchorPoints == true)
                zl_CreateCornerNull_centreAnchorPoint(thisComp, thisComp.layer(thisLayer.index-1));
       } 

        thisLayer.enabled = false;
    } // end function CreateCornerNull


    /****************************** 
        zl_CreateCornerNull_isolateGroup()
          
        Description:
        This function gets the earliest inPoint for target layers
         
        Parameters:
        targetLayer - layer to strip down
        vectorGroupCollection - collection of all shape groups (not effects)
        targetIndex - index of the shape to keep for this layer
        
        Returns:
        Nothing
     ******************************/
    function zl_CreateCornerNull_isolateGroup(targetLayer, vectorGroupCollection, targetIndex){
        var targetShapeCollection = targetLayer.property(2);
        var tempNumShapeGroups = targetShapeCollection.numProperties;
        
        // Push the target shape to the top of the stack
        targetShapeCollection.property(vectorGroupCollection[targetIndex]).moveTo(1);

        // Rebuild the shape index list
        var newVCG = zl_CreateCornerNull_makeShapeIndexList(tempNumShapeGroups, targetShapeCollection);

        // Run through the objects and remove the non-target shapes (preserving the effects)
        for (var i = newVCG.length-1; i > 0; i--)
            targetShapeCollection.property(newVCG[i]).remove();
    } // end function isolateGroup

    /****************************** 
        zl_CreateCornerNull_makeShapeIndexList()
          
        Description:
        This function builds a list in array format of the indices of all shape groups on a layer
         
        Parameters:
        targetLayer - layer to strip down
        vectorGroupCollection - collection of all shape groups (not effects)
        targetIndex - index of the shape to keep for this layer
        
        Returns:
        Array of shape group indices
     ******************************/
    function zl_CreateCornerNull_makeShapeIndexList(numGroups, shapeGroupCollection){
        var shapeIndexList = new Array;
        var vectorShapeText = new RegExp("Vector Shape");
        var vectorGroupText = new RegExp("Vector Group");

        var j = 0;

        for (var i = 1; i <= numGroups; i++){
            if (vectorShapeText.test(shapeGroupCollection.property(i).matchName) || vectorGroupText.test(shapeGroupCollection.property(i).matchName)){
                shapeIndexList[j] = i;
                j++;
            }
        }
    
    return shapeIndexList
    } // end function makeShapeIndexList


    /****************************** 
        zl_CreateCornerNull_centreAnchorPoint()
          
        Description:
        centres the anchor point of current layer
         
        Parameters:
        targetLayer - layer to strip down
        vectorGroupCollection - collection of all shape groups (not effects)
        targetIndex - index of the shape to keep for this layer
        
        Returns:
        Array of shape group indices
     ******************************/
    function zl_CreateCornerNull_centreAnchorPoint(thisComp, targetLayer){
        var sourceRect = targetLayer.sourceRectAtTime(thisComp.time,false);
        var newAnch = [sourceRect.width/2, sourceRect.height/2];
        var oldAnch = targetLayer.anchorPoint.value;

        var xAdjust = newAnch[0] + sourceRect.left;
        var yAdjust = newAnch[1] + sourceRect.top;
    
        targetLayer.anchorPoint.setValue([xAdjust, yAdjust]);
        
        var xShift = (xAdjust - oldAnch[0]) * (targetLayer.scale.value[0]/100);
        var yShift = (yAdjust - oldAnch[1])  * (targetLayer.scale.value[1]/100);    

        var xPos = targetLayer.position.value[0];
        var yPos = targetLayer.position.value[1];

        targetLayer.position.setValue([xPos + xShift, yPos + yShift]);
    } // end function centreAnchorPoint
    
    
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
        var win = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'Create Corner Null',[371,147,531,339]); 
        var curPos = 0;
        
        { // Options    
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

        


        { // Buttons
            win.explodeButton = win.add('button', [12,149,146,175], 'Create'); 
            win.explodeButton.onClick = function () {
                for (var i = 0; i < win.cornerGroup.children.length; i++){
                    if (win.cornerGroup.children[i].value == true){
                        curPos = i;
                    }
                }
            
                if (app.project) {
                    var activeItem = app.project.activeItem;
                    if (activeItem != null && (activeItem instanceof CompItem)) {
                        app.beginUndoGroup(zl_CCN__scriptName);
                        zl_CreateCornerNull(thisObj, curPos);
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