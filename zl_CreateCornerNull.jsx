/**********************************************************************************************
    zl_CreatePivotalNull
    Copyright (c) 2013 Zack Lovatt. All rights reserved.
    zack@zacklovatt.com

    Name: zl_CreatePivotalNull
    Version: 1.1

    Description:
        This script creates a null at one of 9 key points for a layer. Will consider
        rotation, scale, 3d, parented, etc.

        Options for manual offset & toggle parenting.

        Originally requested by Jayse Hansen (jayse.tv)

        This script is provided "as is," without warranty of any kind, expressed
        or implied. In no event shall the author be held liable for any damages
        arising in any way from the use of this script.

**********************************************************************************************/

    var zl_CPN__scriptName = "zl_CreatePivotalNull";

    /******************************
        zl_CreatePivotalNull()

        Description:
        This function contains the main logic for this script.

        Parameters:
        thisObj - "this" object.
        curPos - position to put null
        parentNull - bool, whether to parent null to layer
        x/y/zOffset - amount of pixels to shift null

        Returns:
        Nothing.
    ******************************/
    function zl_CreatePivotalNull(thisObj, curPos, parentNull, offsetArray){

        var thisComp = app.project.activeItem;
        app.project.activeItem.selected = true;

        var userLayers = thisComp.selectedLayers;

        if (userLayers.length == 0){
            alert("Select a layer!");
        } else {
            for (var i = 0, il = userLayers.length; i < il; i++){
                var thisLayer = userLayers[i];
                var newNull = thisComp.layers.addNull();

                newNull.moveBefore(thisLayer);
                newNull.name = thisLayer.name + " - " + newNull.name;

                if (thisLayer.threeDLayer == true)
                    newNull.threeDLayer = true;

                if (thisLayer.parent != null)
                    newNull.parent = thisLayer.parent;

                zl_CreatePivotalNull_moveNull(thisComp, thisLayer, newNull, curPos, offsetArray);

                if (parentNull == true)
                    thisLayer.parent = newNull;
            }
        }

    } // end function CreatePivotalNull


    /******************************
        zl_CreatePivotalNull_setKeys()

        Description:
        Try/catch for animated properties

        Parameters:
        thisComp - current comp
        sourceLayer - original layer to create null from
        targetLayer - the new null, to shift
        targetPos - target corner to shift to
        x/y/zOffset - user-set offsets to position

        Returns:
        Nothing.
     ******************************/
    function zl_CreatePivotalNull_setKeys(thisComp, rotationProperty, newValue){

        if (rotationProperty.isTimeVarying == true){

            var nearestKeyIndexVal = rotationProperty.nearestKeyIndex(thisComp.time);
            var valDiff = rotationProperty.keyValue(nearestKeyIndexVal);

            rotationProperty.setValueAtKey(nearestKeyIndexVal, newValue);

            //var valDiff = rotationProperty.valueAtTime(rotationProperty.keyTime(rotationProperty.nearestKeyIndex(thisComp.time)),false);
            //var valDiff = rotationProperty.valueAtTime(thisComp.time,false);

      //      for (var i = 1; i <= rotationProperty.numKeys; i++){
     //           var curVal = rotationProperty.keyValue(i);
                //if (i == nearestKeyIndex) return;
   //             rotationProperty.setValueAtKey(i, valDiff - curVal);
   //         }

            //rotationProperty.setValue(newValue);

        } else {
            rotationProperty.setValue(newValue);
        }

    }

    /******************************
        zl_CreatePivotalNull_moveNull()

        Description:
        Moves the null to one of 9 key points

        Parameters:
        thisComp - current comp
        sourceLayer - original layer to create null from
        targetLayer - the new null, to shift
        targetPos - target corner to shift to
        x/y/zOffset - user-set offsets to position

        Returns:
        Nothing.
     ******************************/
    function zl_CreatePivotalNull_moveNull(thisComp, sourceLayer, targetLayer, targetPos, offsetArray){
        var is3d = sourceLayer.threeDLayer;
        var resetRot = false;

        if (is3d){
            var tempRot = [sourceLayer.xRotation.value, sourceLayer.yRotation.value, sourceLayer.zRotation.value];
            var tempOrient = sourceLayer.orientation.value;
        } else
            tempRot = sourceLayer.rotation.value;

        if (sourceLayer.rotation.isModified){
            zl_CreatePivotalNull_setKeys(thisComp, sourceLayer.rotation, 0);
            resetRot = true;
        }

        if (is3d)
            if (sourceLayer.xRotation.isModified || sourceLayer.yRotation.isModified || sourceLayer.zRotation.isModified || sourceLayer.orientation.isModified){
                zl_CreatePivotalNull_setKeys(thisComp, sourceLayer.orientation, [0,0,0]);

                zl_CreatePivotalNull_setKeys(thisComp, sourceLayer.xRotation, 0);
                zl_CreatePivotalNull_setKeys(thisComp, sourceLayer.yRotation, 0);
                zl_CreatePivotalNull_setKeys(thisComp, sourceLayer.zRotation, 0);

                resetRot = true;
            }

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

        zl_CreatePivotalNull_setKeys(thisComp, targetLayer.position, [xPos + xShift + parseInt(offsetArray[0]), yPos + yShift + parseInt(offsetArray[1]), zPos + zShift + parseInt(offsetArray[2])]);
        //targetLayer.position.setValue([xPos + xShift + parseInt(offsetArray[0]), yPos + yShift + parseInt(offsetArray[1]), zPos + zShift + parseInt(offsetArray[2])]);

        if (resetRot == true){
            targetLayer.parent = sourceLayer;

            if (!is3d)
                zl_CreatePivotalNull_setKeys(thisComp, sourceLayer.rotation, tempRot);
            else if (is3d){
                zl_CreatePivotalNull_setKeys(thisComp, sourceLayer.zRotation, tempRot[2]);
                zl_CreatePivotalNull_setKeys(thisComp, sourceLayer.yRotation, tempRot[1]);
                zl_CreatePivotalNull_setKeys(thisComp, sourceLayer.xRotation, tempRot[0]);

                zl_CreatePivotalNull_setKeys(thisComp, sourceLayer.orientation, tempOrient);
            }

            targetLayer.parent = null;
        }
    } // end function moveNull


    /******************************
        zl_CreatePivotalNull_createPalette()

        Description:
        Creates ScriptUI Palette Panel
        Generated using Boethos (crgreen.com/boethos)

        Parameters:
        thisObj - this comp object

        Returns:
        Nothing
     ******************************/
    function zl_CreatePivotalNull_createPalette(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'Create Pivotal Null',undefined);
        var curPos = 0;
        var parentNull = false;

        { // Corners
            win.cornerGroup = win.add('panel', undefined, 'Point', {borderStyle: "etched"});

            { // Top Row
                var topRow = win.cornerGroup.add('group');
                    topRow.label = "r1";
                    topRow.a1 = topRow.add('radiobutton', undefined, '');
                    topRow.a2 = topRow.add('radiobutton', undefined, '');
                    topRow.a3 = topRow.add('radiobutton', undefined, '');
            }

            { // Middle Row
                var midRow = win.cornerGroup.add('group');
                    midRow.label = "r2";
                    midRow.b1 = midRow.add('radiobutton', undefined, '');
                    midRow.b2 = midRow.add('radiobutton', undefined, '');
                    midRow.b3 = midRow.add('radiobutton', undefined, '');
            }

            { // Bottom Row
                var lowRow = win.cornerGroup.add('group')
                    lowRow.label = "r3";
                    lowRow.c1 = lowRow.add('radiobutton', undefined, '');
                    lowRow.c2 = lowRow.add('radiobutton', undefined, '');
                    lowRow.c3 = lowRow.add('radiobutton', undefined, '');
            }

            var counter = 0;
            midRow.b2.value = true;
            curPos = 4;

            for (var i = 0, il = win.cornerGroup.children.length; i < il; i++){
                for (var j = 0, jl = win.cornerGroup.children[i].children.length; j < jl; j++){
                    win.cornerGroup.children[i].children[j].id = counter;
                    counter++

                    win.cornerGroup.children[i].children[j].onClick = function(event){
                        curPos = this.id;

                        if (this.parent.label == "r1") {
                            for (var i = 0, il = midRow.children.length; i < il; i++)
                                midRow.children[i].value = false;
                            for (var i = 0, il = lowRow.children.length; i < il; i++)
                                lowRow.children[i].value = false;
                        } else if (this.parent.label == "r2"){
                            for (var i = 0, il = topRow.children.length; i < il; i++)
                                topRow.children[i].value = false;
                            for (var i = 0, il = lowRow.children.length; i < il; i++)
                                lowRow.children[i].value = false;
                        } else if (this.parent.label == "r3"){
                            for (var i = 0, il = topRow.children.length; i < il; i++)
                                topRow.children[i].value = false;
                            for (var i = 0, il = midRow.children.length; i < il; i++)
                                midRow.children[i].value = false;
                        } // end elses
                    }; // end onClick
                }
            }
        } // end Corners


        { // Options
            win.optionGroup = win.add('panel', undefined, 'Options', {borderStyle: "etched"});

            win.parentOption = win.optionGroup.add('checkbox', undefined, '\u00A0\u00A0Parent to null');
            win.parentOption.value = true;

            { // xOffset Line
                var xOffRow = win.optionGroup.add('group');
                    xOffRow.xOffLabel = xOffRow.add('statictext', undefined, 'X Offset');
                    xOffRow.xOffInput = xOffRow.add('edittext', undefined, '');
            }

            { // yOffset Line
                var yOffRow = win.optionGroup.add('group');
                    yOffRow.yOffLabel = yOffRow.add('statictext', undefined, 'Y Offset');
                    yOffRow.yOffInput = yOffRow.add('edittext', undefined, '');
            }

            { // zOffset Line
                var zOffRow = win.optionGroup.add('group');
                    zOffRow.zOffLabel = zOffRow.add('statictext', undefined, 'Z Offset');
                    zOffRow.zOffInput = zOffRow.add('edittext', undefined, '');
            }

            xOffRow.xOffInput.text = yOffRow.yOffInput.text = zOffRow.zOffInput.text = "0 px";
            xOffRow.xOffInput.characters = yOffRow.yOffInput.characters = zOffRow.zOffInput.characters = 4;

            function checkStr (str) {
                try {
                    var array = str.split(" ");
                    var num = String (Number (array[0]));
                    if (isNaN(num))
                        throw new Error("Not a number");
                    return num;
                } catch (_) {
                    return NaN;
                }
            } // update
        }


        { // Buttons
            win.explodeButton = win.add('button', undefined, 'Create');
            win.explodeButton.onClick = function () {
                for (var i = 0, il = win.cornerGroup.children.length; i < il; i++){
                    if (win.cornerGroup.children[i].value == true){
                        curPos = i;
                    }
                }

                var parentNull = win.parentOption.value;
                var offsetArray = [checkStr(xOffRow.xOffInput.text), checkStr(yOffRow.yOffInput.text), checkStr(zOffRow.zOffInput.text)]

                if (app.project) {
                    var activeItem = app.project.activeItem;
                    if (activeItem != null && (activeItem instanceof CompItem)) {
                        app.beginUndoGroup(zl_CPN__scriptName);
                        if (!offsetArray[0] || !offsetArray[1] || !offsetArray[2]){
                            alert("Invalid input!");
                        }else{
                            zl_CreatePivotalNull(thisObj, curPos, parentNull, offsetArray);
                        }
                        app.endUndoGroup();
                    } else {
                        alert("Select a layer!", zl_CPN__scriptName);
                    }
                } else {
                    alert("Open a project!", zl_CPN__scriptName);
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
        zl_CreatePivotalNull_main()

        Description:
        Main function

        Parameters:
        thisObj - this comp object

        Returns:
        Nothing
     ******************************/
    function zl_CreatePivotalNull_main(thisObj) {
        zl_CreatePivotalNull_createPalette(thisObj);
    } // end function main

    // RUN!
    zl_CreatePivotalNull_main(this);