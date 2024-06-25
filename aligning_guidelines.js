
function initAligningGuidelines(canvas) {

    var ctx = canvas.contextTop(),
        aligningLineOffset = 5,
        aligningLineMargin = 4,
        aligningLineWidth = 1,
        aligningLineColor = 'rgb(0,255,0)',
        viewportTransform,
        zoom = 1;

    function drawVerticalLine(coords) {
        drawLine(
            coords.x + 0.5,
            coords.y1 > coords.y2 ? coords.y2 : coords.y1,
            coords.x + 0.5,
            coords.y2 > coords.y1 ? coords.y2 : coords.y1);
    }

    function drawHorizontalLine(coords) {
        drawLine(
            coords.x1 > coords.x2 ? coords.x2 : coords.x1,
            coords.y + 0.5,
            coords.x2 > coords.x1 ? coords.x2 : coords.x1,
            coords.y + 0.5);
    }

    function drawLine(x1, y1, x2, y2) {
        ctx.save();
        ctx.lineWidth = aligningLineWidth;
        ctx.strokeStyle = aligningLineColor;
        ctx.beginPath();
        ctx.moveTo(((x1 + viewportTransform[4]) * zoom), ((y1 + viewportTransform[5]) * zoom));
        ctx.lineTo(((x2 + viewportTransform[4]) * zoom), ((y2 + viewportTransform[5]) * zoom));
        ctx.stroke();
        ctx.restore();
        //console.log('x1: ' + Math.round(x1) + ' |y1: ' + Math.round(y1) + ' |x2: ' + Math.round(x2) + ' |y2: ' + Math.round(y2));
    }

    function isInRange(value1, value2) {
        value1 = Math.round(value1);
        value2 = Math.round(value2);
        for (var i = value1 - aligningLineMargin, len = value1 + aligningLineMargin; i <= len; i++) {
            if (i === value2) {
                return true;
            }
        }
        return false;
    }

    function getABoundingRect(object) {
        var matrix = object.calcTransformMatrix();
        var options = fabric.util.qrDecompose(matrix);
        var translateMatrix = [1, 0, 0, 1, options.translateX, options.translateY];
        var rotateMatrix = fabric.iMatrix.concat();
        if (options.angle) {
            var theta = fabric.util.degreesToRadians(options.angle),
                cos = Math.cos(theta),
                sin = Math.sin(theta);
            rotateMatrix = [cos, sin, -sin, cos, 0, 0];
        }

        var finalMatrix = fabric.util.multiplyTransformMatrices(translateMatrix, rotateMatrix);

        var transformPoint = fabric.util.transformPoint;
        var p = object._getNonTransformedDimensions(),
            matrix = fabric.util.customTransformMatrix(options.scaleX, options.scaleY, options.skewX),
            dim = transformPoint(p, matrix),
            w = dim.x / 2,
            h = dim.y / 2,
            tl = transformPoint({
                x: -w,
                y: -h
            }, finalMatrix),
            tr = transformPoint({
                x: w,
                y: -h
            }, finalMatrix),
            bl = transformPoint({
                x: -w,
                y: h
            }, finalMatrix),
            br = transformPoint({
                x: w,
                y: h
            }, finalMatrix);

        // corners
        var points = [
            new fabric.Point(tl.x, tl.y),
            new fabric.Point(tr.x, tr.y),
            new fabric.Point(br.x, br.y),
            new fabric.Point(bl.x, bl.y)
        ];

        return fabric.util.makeBoundingBoxFromPoints(points);
    }

    function getNewlineSin(angle, Hypotenuse) {
			var radians = Math.sin(angle * Math.PI / 180);
      var result =  (Hypotenuse*radians);
        return Math.abs(result);
    }
    
    function getNewlineCos(angle, Hypotenuse) {
			var radians = Math.cos(angle * Math.PI / 180);
      var result =  (Hypotenuse*radians);
        return result;
    }

    var verticalLines = [],
        horizontalLines = [];

    canvas.on('mouse:down', function () {
        viewportTransform = canvas.viewportTransform;
        zoom = canvas.getZoom();
    });

    canvas.on('object:moving', function (e) {

        var activeObject = e.target,
            canvasObjects = canvas.getObjects(),
            activeObjectCenter = activeObject.getCenterPoint(),
            activeObjectLeft = activeObjectCenter.x,
            activeObjectTop = activeObjectCenter.y,
            activeObjectBoundingRect = activeObject.getBoundingRect(),
            activeObjectHeight = activeObjectBoundingRect.height / viewportTransform[3],
            activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0],
            horizontalInTheRange = false,
            verticalInTheRange = false,
            transform = canvas._currentTransform;

        if (!transform) return;

        // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
        // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move

        for (var i = canvasObjects.length; i--;) {

            if (canvasObjects[i] === activeObject) continue;

            var objectCenter = canvasObjects[i].getCenterPoint(),
                objectLeft = objectCenter.x,
                objectTop = objectCenter.y,
                objectBoundingRect = canvasObjects[i].getBoundingRect(),
                objectHeight = objectBoundingRect.height / viewportTransform[3],
                objectWidth = objectBoundingRect.width / viewportTransform[0],
                posTop = 0,
                posLeft = 0,
                snapLeft = false,
                snapRight = false,
                snapTop = false,
                snapBottom = false,
                snapHorizontal = false,
                snapVertical = false;

            // snap by the horizontal center line
            if (isInRange(objectLeft, activeObjectLeft)) {
            	if (verticalInTheRange) return;
              verticalLines.push({
                    x: objectLeft,
                    y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                });

                //activeObject.setPositionByOrigin(new fabric.Point(objectLeft, activeObjectTop), 'center', 'center');
                posLeft = objectLeft;
                snapHorizontal = true;
                verticalInTheRange = true;
            }

            // snap by the left edge
            if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
								if (verticalInTheRange) return;
                verticalLines.push({
                    x: objectLeft - objectWidth / 2,
                    /* y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                                    }); */
                    //activeObject.setPositionByOrigin(new fabric.Point(objectLeft - objectWidth / 2 + activeObjectWidth / 2, activeObjectTop), 'center', 'center');
                    y1: (objectTop - objectHeight / 2 < activeObjectTop - activeObjectHeight / 2) ? (objectTop - objectHeight / 2) : (activeObjectTop - activeObjectHeight / 2),
                    y2: (activeObjectTop + activeObjectHeight / 2 > objectTop + objectHeight / 2) ? (activeObjectTop + activeObjectHeight / 2) : (objectTop + objectHeight / 2)
                });

                //console.log('objTop: ' + (objectTop - objectHeight / 2) + ' || actTop: ' + (activeObjectTop - activeObjectHeight/2));

                posLeft = (objectLeft - objectWidth / 2 + activeObjectWidth / 2);
                snapLeft = true;
                verticalInTheRange = true;
            }

            // snap by the right edge
            if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
                if (verticalInTheRange) return;
                verticalLines.push({
                    x: objectLeft + objectWidth / 2,
                    y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                });
                //activeObject.setPositionByOrigin(new fabric.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop), 'center', 'center');
                posLeft = (objectLeft + objectWidth / 2 - activeObjectWidth / 2)
                snapRight = true;
                verticalInTheRange = true;
            }

            // snap by the vertical center line
            if (isInRange(objectTop, activeObjectTop)) {
            	if (horizontalInTheRange) return;
							horizontalLines.push({
                    y: objectTop,
                    x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                });
                //activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop), 'center', 'center');
                posTop = objectTop;
                snapVertical = true;
                horizontalInTheRange = true;
            }

            // snap by the top edge
            if (isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
                if (horizontalInTheRange) return;
                horizontalLines.push({
                    y: objectTop - objectHeight / 2,
                    x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                });
                //activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 + activeObjectHeight / 2), 'center', 'center');
                posTop = (objectTop - objectHeight / 2 + activeObjectHeight / 2);
                snapTop = true;
                horizontalInTheRange = true;
            }

            // snap by the bottom edge
            if (isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
                if (horizontalInTheRange) return;
                horizontalLines.push({
                    y: objectTop + objectHeight / 2,
                    x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                });
                //activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 - activeObjectHeight / 2), 'center', 'center');
                posTop = (objectTop + objectHeight / 2 - activeObjectHeight / 2);
                snapBottom = true;
                horizontalInTheRange = true;
            }

            if (snapLeft || snapRight || snapTop || snapBottom || snapHorizontal || snapVertical) {
                if (snapHorizontal || snapLeft || snapRight) {
                    posTop = activeObjectTop;
                }
                if (snapVertical || snapTop || snapBottom) {
                    posLeft = activeObjectLeft;
                }

                //Snap center
                if (snapHorizontal && snapVertical) {
                    activeObject.setPositionByOrigin(new fabric.Point(objectLeft, objectTop), 'center', 'center');
                } else {

                    if (snapLeft) posLeft = (objectLeft - objectWidth / 2 + activeObjectWidth / 2);
                    if (snapRight) posLeft = (objectLeft + objectWidth / 2 - activeObjectWidth / 2);
                    if (snapTop) posTop = (objectTop - objectHeight / 2 + activeObjectHeight / 2);
                    if (snapBottom) posTop = (objectTop + objectHeight / 2 - activeObjectHeight / 2);
                    if (snapHorizontal) posLeft = objectLeft;
                    if (snapVertical) posTop = objectTop;

                    activeObject.setPositionByOrigin(new fabric.Point(posLeft, posTop), 'center', 'center');
                }

            }
        }

        if (!horizontalInTheRange) {
            horizontalLines.length = 0;
        }

        if (!verticalInTheRange) {
            verticalLines.length = 0;
        }
    });

    canvas.on('object:scaling', function (e) {

        var activeObject = e.target,
            canvasObjects = canvas.getObjects(),
            activeObjectCenter = activeObject.getCenterPoint(),
            activeObjectLeft = activeObjectCenter.x,
            activeObjectTop = activeObjectCenter.y,
            activeObjectBoundingRect = activeObject.getBoundingRect(),
            /* activeObjectHeight = activeObjectBoundingRect.height / viewportTransform[3],
            activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0], */
            activeObjectHeight = ((activeObject.height + activeObject.strokeWidth) * activeObject.scaleY) / viewportTransform[3],
            activeObjectWidth = ((activeObject.width + activeObject.strokeWidth) * activeObject.scaleX) / viewportTransform[0],
            horizontalInTheRange = false,
            verticalInTheRange = false,
            transform = canvas._currentTransform;

        var eCoords = activeObject.calcCoords(true),
            eTop = Math.min(eCoords.tl.y, eCoords.tr.y, eCoords.bl.y, eCoords.br.y),
            eLeft = Math.min(eCoords.tl.x, eCoords.tr.x, eCoords.bl.x, eCoords.br.x),
            eRight = Math.max(eCoords.tl.y, eCoords.tr.y, eCoords.bl.y, eCoords.br.y),
            eBottom = Math.max(eCoords.tl.x, eCoords.tr.x, eCoords.bl.x, eCoords.br.x);

        console.log('%ceTop: ' + eTop + ' |eBottom: ' + eBottom + ' |eLeft: ' + eLeft + ' |eRight: ' + eRight, 'color: #E74C3C;');
        console.log('%c eCoords.tl.x: ' + eCoords.tl.x + ' |eCoords.tl.y: ' + eCoords.tl.y, 'color: #E74CFF;');
        console.log('actTop: ' + activeObjectTop + ' |actLeft: ' + activeObjectLeft);
    
        //toFixed(2) 
        if (!transform) return;

        // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
        // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move

        for (var i = canvasObjects.length; i--;) {

            if (canvasObjects[i] === activeObject) continue;

            var objectCenter = canvasObjects[i].getCenterPoint(),
                objectLeft = objectCenter.x,
                objectTop = objectCenter.y,
                objectBoundingRect = canvasObjects[i].getBoundingRect(),
                objectHeight = objectBoundingRect.height / viewportTransform[3],
                objectWidth = objectBoundingRect.width / viewportTransform[0],
                newWidth = 0,
                newHeight = 0,
                posTop = 0,
                posLeft = 0,
                snapLeft = false,
                snapRight = false,
                snapTop = false,
                snapBottom = false,
                snapHorizontal = false,
                snapVertical = false;

            // snap by the horizontal center line
            /* if (isInRange(objectLeft, activeObjectLeft)) {
                verticalInTheRange = true;
                verticalLines.push({
                    x: objectLeft,
                    y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                                    });
                                    
                //activeObject.setPositionByOrigin(new fabric.Point(objectLeft, activeObjectTop), 'center', 'center');
                posLeft = objectLeft;
                snapHorizontal = true;
            } */

            // snap by the left edge
            if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
                verticalInTheRange = true;
                verticalLines.push({
                    x: objectLeft - objectWidth / 2,
                    y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                });
                /* console.log('obj Left: ' + (activeObjectLeft - activeObjectWidth/2) + ' | activeObjectWidth: ' + activeObjectWidth);
                newWidth = ((activeObjectLeft - activeObjectWidth/2) + activeObjectWidth) - (activeObjectLeft - activeObjectWidth/2); */

                /* console.log('obj Left: ' + (objectLeft - objectHeight/2) + ' | actObj Right: ' + ((activeObjectLeft - (activeObjectWidth*activeObject.scaleX)/2) +  (activeObjectWidth*activeObject.scaleX))); */
                //console.log('scaleX: ' + activeObject.scaleX + ' |activeObjectWidth: ' + activeObjectWidth);
                /* console.log('activeObjectLeft: ' + activeObjectLeft); */

                /*  console.log('obj L: ' + (objectLeft - objectWidth/2));
                 console.log('act L: ' + (activeObjectLeft - activeObjectWidth/2)); */
                console.log('act L: ' + (activeObjectLeft));
                /* var objL = (objectLeft - objectWidth/2);
                var actL = (activeObjectLeft - activeObjectWidth/2); */
                /*  if(objL <= actL-5 || objL >= actL+5) */

                snapLeft = true;
                posLeft = (objectLeft - objectWidth / 2 + activeObjectWidth / 2);
                if (activeObject.compareWith != i) {
                    newWidth = ((activeObjectLeft + activeObjectWidth / 2) - (objectLeft - objectWidth / 2));
                    console.log('newWidth: ' + newWidth + ' |actWidth before change: ' + activeObjectWidth);
                    /* console.log('obj[i]: ' + (objectLeft - objectWidth / 2) + ' | center obj: ' + (activeObjectLeft + activeObjectWidth / 2) + ' || objectLeft: ' + objectLeft); */
                    //objectLeft
                    activeObject.set('newWidth', newWidth);
                    activeObject.set('compareWith', i);                    
                    //activeObject.set('snapL',true);
                    // Please delete newWidth and campreWith when mouse down 
                    console.dir(activeObject);
                }

            }

            // snap by the right edge
            /* if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
                verticalInTheRange = true;
                verticalLines.push({
                    x: objectLeft + objectWidth / 2,
                    y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
                });
                //activeObject.setPositionByOrigin(new fabric.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop), 'center', 'center');
                posLeft = (objectLeft + objectWidth / 2 - activeObjectWidth / 2)
                snapRight = true;
                console.log('snapRight');
            } */

            // snap by the vertical center line
            if (isInRange(objectTop, activeObjectTop)) {
                horizontalInTheRange = true;
                horizontalLines.push({
                    y: objectTop,
                    x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                });
                //activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop), 'center', 'center');
                posTop = objectTop;
                snapVertical = true;
            }

            // snap by the top edge
            if (isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
                horizontalInTheRange = true;
                horizontalLines.push({
                    y: objectTop - objectHeight / 2,
                    x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                });
                //activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 + activeObjectHeight / 2), 'center', 'center');
                posTop = (objectTop - objectHeight / 2 + activeObjectHeight / 2);
                snapTop = true;
                console.log('snapTop');
            }

            // snap by the bottom edge
            if (isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
                horizontalInTheRange = true;
                horizontalLines.push({
                    y: objectTop + objectHeight / 2,
                    x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
                });
                //activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 - activeObjectHeight / 2), 'center', 'center');
                posTop = (objectTop + objectHeight / 2 - activeObjectHeight / 2);
                snapBottom = true;
                console.log('snapBottom');
            }

            if (snapLeft || snapRight || snapTop || snapBottom || snapHorizontal || snapVertical) {
                var scaleXN = 1,
                    scaleYN = 1,
                    scaleXO = 1,
                    scaleYO = 1;

                if (snapHorizontal || snapLeft || snapRight) {
                    posTop = activeObjectTop;
                }
                if (snapVertical || snapTop || snapBottom) {
                    posLeft = activeObjectLeft;
                }

                //Snap center
                if (snapHorizontal && snapVertical) {
                    //activeObject.setPositionByOrigin(new fabric.Point(objectLeft, objectTop), 'center', 'center');
                } else {
                    //newWidth  activeObject.width
                    if (snapLeft) {

                        scaleXN = activeObject.newWidth / (activeObject.width + activeObject.strokeWidth);
												console.log('%cscaleXN: ' + scaleXN , 'color: #bada55');
                        /* scaleXO = activeObject.scaleX;
                        scaleYO = activeObject.scaleY; */

                        var newX = (objectLeft - objectWidth / 2);
                        
                        var xCenter = 0,
                        		yCenter = 0;
                            
                   			var newCal = activeObject.calcCoords(true),
                            oldCenterY = 0,
                            newCenterY = 0,
                        		newY = 0,
                            newObjH = newCal.tl.y; 
                        
                        var newY = newObjH;
                   
                       /*  var newCalc = getABoundingRect(activeObject);
                        console.log('newCalc');
                        console.dir(newCalc); */
                        scaleXO = activeObject.scaleX;
                        
                        
                        console.log('scaleXO: ' + scaleXO + ' |scaleXN: ' + scaleXN + ' |activeObjectTop: ' + activeObjectTop);
                        
                        if(activeObject.angle){
                          //oldCenterY = getNewlineSin(activeObject.angle, activeObject.width*scaleXO);
                          newCenterY = getNewlineCos(activeObject.angle%90, activeObject.width*scaleXN)/2;
                          console.log('%c angle: ' + activeObject.angle%90 + 'width: ' + activeObject.width*scaleXN, 'color: #FFda55')
                          //newCenterY = getNewlineCos(activeObject.angle, activeObject.width*scaleXN)/2;
                          //newY = activeObjectTop + (newCenterY - oldCenterY);
                          newY = eCoords.tl.y + newCenterY;
                          console.log('%cnewY: ' + newY + ' |activeObjectTop: ' + activeObjectTop + ' |newCenterY: ' + newCenterY, 'color: #F18DF0');
                          //activeObject.set('center', activeObjectTop + (newCenterY - oldCenterY));
                          
                        } else newY = activeObjectTop;
                        //console.log('%c activeObjectTop: ' + activeObjectTop, 'color: #BBFC95')
                        // Calc center x,y
                        /* if(activeObject.angle){
                          xCenter = eRight - eLeft;
                          yCenter = eBottom - eLeft;
                        } */
                        
                        activeObject.scaleX = scaleXN;
                        
                 
                        
                        /* var xyz = new fabric.Point(newX, newY);
                        console.log('xyz: ' + xyz); */
                        
                     /*    console.log('newX: ' + newX);
                        console.log('%cxCenter: ' + xCenter + ' |yCenter: ' + yCenter , 'color: #F0B27A'); */
                        activeObject.set('left', newX);
                    		/* activeObject.setPositionByOrigin(new fabric.Point(newX, newY), 'left', 'top'); */
                    		//activeObject.setPositionByOrigin(new fabric.Point(newX + xCenter, eTop + yCenter), 'center', 'center');

                    }
                }
            }
        }

        if (!horizontalInTheRange) {
            horizontalLines.length = 0;
        }

        if (!verticalInTheRange) {
            verticalLines.length = 0;
        }
    });

    canvas.on('before:render', function () {
        canvas.clearContext(canvas.contextTop);
    });

    canvas.on('after:render', function () {
        /* canvas.contextContainer.strokeStyle = '#555';

        canvas.forEachObject(function(obj) {
          var bound = obj.getBoundingRect();

          canvas.contextContainer.strokeRect(
            bound.left + 0.5,
            bound.top + 0.5,
            bound.width,
            bound.height
          );
        })

        canvas.forEachObject(function(obj) {
          var setCoords = obj.setCoords.bind(obj);
          obj.on({
            moving: setCoords,
            scaling: setCoords,
            rotating: setCoords
          });
        }) */
        for (var i = verticalLines.length; i--;) {
            drawVerticalLine(verticalLines[i]);
        }
        for (var i = horizontalLines.length; i--;) {
            drawHorizontalLine(horizontalLines[i]);
        }

        verticalLines.length = horizontalLines.length = 0;

    });

    canvas.on('mouse:up', function () {
        verticalLines.length = horizontalLines.length = 0;
        for (var jj = canvas._objects.length; jj--;) {
            canvas._objects[jj].set('newWidth', 0);
            canvas._objects[jj].set('compareWith', 9999);

        }
        canvas.renderAll();
        console.dir(canvas);
    });
}

//END of alignment guidline

//Start of centering guidelines

function initx(canvas) {

    var canvasWidth = canvas.getWidth(),
        canvasHeight = canvas.getHeight(),
        canvasWidthCenter = canvasWidth / 2,
        canvasHeightCenter = canvasHeight / 2,
        canvasWidthCenterMap = {},
        canvasHeightCenterMap = {},
        centerLineMargin = 4,
        centerLineColor = 'rgba(255,0,241,0.5)',
        centerLineWidth = 1,
        ctx = canvas.contextTop(),
        viewportTransform;

    for (var i = canvasWidthCenter - centerLineMargin, len = canvasWidthCenter + centerLineMargin; i <= len; i++) {
        canvasWidthCenterMap[Math.round(i)] = true;
    }
    for (var i = canvasHeightCenter - centerLineMargin, len = canvasHeightCenter + centerLineMargin; i <= len; i++) {
        canvasHeightCenterMap[Math.round(i)] = true;
    }

    function showVerticalCenterLine() {
        showCenterLine(canvasWidthCenter + 0.5, 0, canvasWidthCenter + 0.5, canvasHeight);
    }

    function showHorizontalCenterLine() {
        showCenterLine(0, canvasHeightCenter + 0.5, canvasWidth, canvasHeightCenter + 0.5);
    }

    function showCenterLine(x1, y1, x2, y2) {
        ctx.save();
        ctx.strokeStyle = centerLineColor;
        ctx.lineWidth = centerLineWidth;
        ctx.beginPath();
        ctx.moveTo(x1 * viewportTransform[0], y1 * viewportTransform[3]);
        ctx.lineTo(x2 * viewportTransform[0], y2 * viewportTransform[3]);
        ctx.stroke();
        ctx.restore();
    }

    var afterRenderActions = [],
        isInVerticalCenter,
        isInHorizontalCenter;

    canvas.on('mouse:down', function () {
        viewportTransform = canvas.viewportTransform;
    });

    canvas.on('object:moving', function (e) {
        var object = e.target,
            objectCenter = object.getCenterPoint(),
            transform = canvas._currentTransform;

        if (!transform) return;

        isInVerticalCenter = Math.round(objectCenter.x) in canvasWidthCenterMap;
        isInHorizontalCenter = Math.round(objectCenter.y) in canvasHeightCenterMap;

        if (isInHorizontalCenter || isInVerticalCenter) {
            object.setPositionByOrigin(new fabric.Point((isInVerticalCenter ? canvasWidthCenter : objectCenter.x), (isInHorizontalCenter ? canvasHeightCenter : objectCenter.y)), 'center', 'center');
        }
    });

    canvas.on('before:render', function () {
        canvas.clearContext(canvas.contextTop);
    });

    canvas.on('after:render', function () {
        if (isInVerticalCenter) {
            showVerticalCenterLine();
        }
        if (isInHorizontalCenter) {
            showHorizontalCenterLine();
        }
    });

    canvas.on('mouse:up', function () {
        // clear these values, to stop drawing guidelines once mouse is up
        isInVerticalCenter = isInHorizontalCenter = null;
        canvas.renderAll();
    });
}

//END centering guilelines

initAligningGuidelines(canvas);
initCenteringGuidelines(canvas);
