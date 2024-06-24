document.addEventListener("DOMContentLoaded", function() {
    const canvas = new fabric.Canvas('canvas', {
        width: 1920,
        height: 1080
    });
    let rulerVisible = false;
    let rulerInterval = 50;
    let zoomLevel = 1; // Track the current zoom level

    // Function to fit the canvas within the viewport
    function fitCanvasToViewport() {
        const container = document.getElementById('canvas-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const scaleX = containerWidth / 1920;
        const scaleY = containerHeight / 1080;
        const scale = Math.min(scaleX, scaleY);

        canvas.setDimensions({
            width: 1920 * scale,
            height: 1080 * scale
        }, {
            cssOnly: true
        });

        canvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);
    }

    // Call the fitCanvasToViewport function initially and on window resize
    window.addEventListener('resize', fitCanvasToViewport);
    fitCanvasToViewport();

    // Mouse wheel zoom
    canvas.on('mouse:wheel', function(opt) {
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
        var vpt = this.viewportTransform;
        if (zoom < 400 / 1000) {
            vpt[4] = 200 - 1000 * zoom / 2;
            vpt[5] = 200 - 1000 * zoom / 2;
        } else {
            if (vpt[4] >= 0) {
                vpt[4] = 0;
            } else if (vpt[4] < canvas.getWidth() - 1000 * zoom) {
                vpt[4] = canvas.getWidth() - 1000 * zoom;
            }
            if (vpt[5] >= 0) {
                vpt[5] = 0;
            } else if (vpt[5] < canvas.getHeight() - 1000 * zoom) {
                vpt[5] = canvas.getHeight() - 1000 * zoom;
            }
        }
        // Update zoom level and percentage display
        zoomLevel = zoom;
        updateZoom();
    });

    document.getElementById('addText').addEventListener('click', function() {
        const text = new fabric.Textbox('Sample Text', {
            left: 50,
            top: 50,
            width: 200,
            fontSize: 20,
            fill: '#000',
            fontFamily: 'Arial',
            scaleX: 1,
            scaleY: 1
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        showObjectDetails();
    });

    document.getElementById('addImage').addEventListener('click', function() {
        const url = prompt("Enter the image URL:");
        const altText = prompt("Enter the alt text for the image:");
        if (url) {
            fabric.Image.fromURL(url, function(img) {
                img.set({
                    left: 50,
                    top: 100,
                    scaleX: 0.5,
                    scaleY: 0.5,
                    alt: altText
                });
                canvas.add(img);
                canvas.setActiveObject(img);
                showObjectDetails();
            });
        }
    });

    document.getElementById('exportCode').addEventListener('click', function() {
        const objects = canvas.getObjects();
        let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<title>Your Page</title>\n</head>\n<body>\n';

        objects.forEach(obj => {
            if (obj.type === 'textbox') {
                let tag = obj.heading || 'div';
                html += `<${tag} style="position:absolute;left:${obj.left.toFixed(1)}px;top:${obj.top.toFixed(1)}px;font-size:${obj.fontSize.toFixed(1)}px;color:${obj.fill};font-family:${obj.fontFamily};">${obj.text}</${tag}>\n`;
            } else if (obj.type === 'image') {
                html += `<img src="${obj._element.src}" alt="${obj.alt || ''}" style="position:absolute;left:${obj.left.toFixed(1)}px;top:${obj.top.toFixed(1)}px;width:${(obj.width * obj.scaleX).toFixed(1)}px;height:${(obj.height * obj.scaleY).toFixed(1)}px;transform:rotate(${obj.angle.toFixed(1)}deg);">\n`;
            }
        });

        html += '</body>\n</html>';
        document.getElementById('htmlCode').value = html;
    });

    document.getElementById('toggleRuler').addEventListener('click', function() {
        rulerVisible = !rulerVisible;
        updateRulerVisibility();
    });

    document.getElementById('rulerInterval').addEventListener('input', function() {
        rulerInterval = parseInt(this.value);
        if (rulerVisible) {
            updateRulerVisibility();
        }
    });

    document.getElementById('zoomIn').addEventListener('click', function() {
        zoomLevel *= 1.1;
        if (zoomLevel > 20) zoomLevel = 20;
        canvas.setZoom(zoomLevel);
        updateZoom();
    });

    document.getElementById('zoomOut').addEventListener('click', function() {
        zoomLevel *= 0.9;
        if (zoomLevel < 0.01) zoomLevel = 0.01;
        canvas.setZoom(zoomLevel);
        updateZoom();
    });

    document.getElementById('resetZoom').addEventListener('click', function() {
        zoomLevel = 1;
        canvas.setZoom(zoomLevel);
        updateZoom();
    });

    function updateZoom() {
        document.getElementById('zoomPercentage').innerText = `${(zoomLevel * 100).toFixed(1)}%`;
    }

    function updateRulerVisibility() {
        const horizontalRuler = document.getElementById('horizontalRuler');
        const verticalRuler = document.getElementById('verticalRuler');

        if (rulerVisible) {
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            horizontalRuler.style.width = `${canvasWidth}px`;
            verticalRuler.style.height = `${canvasHeight}px`;

            horizontalRuler.innerHTML = '';
            verticalRuler.innerHTML = '';

            for (let i = 0; i < canvasWidth; i += 10) {
                const mark = document.createElement('div');
                mark.style.position = 'absolute';
                mark.style.top = '0';
                mark.style.left = `${i}px`;
                mark.style.width = '1px';
                mark.style.height = '10px';
                mark.style.background = '#ccc';
                horizontalRuler.appendChild(mark);

                if (i % rulerInterval === 0) {
                    const label = document.createElement('div');
                    label.style.position = 'absolute';
                    label.style.top = '10px';
                    label.style.left = `${i}px`;
                    label.style.fontSize = '10px';
                    label.innerText = i;
                    horizontalRuler.appendChild(label);
                }
            }

            for (let j = 0; j < canvasHeight; j += 10) {
                const mark = document.createElement('div');
                mark.style.position = 'absolute';
                mark.style.left = '0';
                mark.style.top = `${j}px`;
                mark.style.width = '10px';
                mark.style.height = '1px';
                mark.style.background = '#ccc';
                verticalRuler.appendChild(mark);

                if (j % rulerInterval === 0) {
                    const label = document.createElement('div');
                    label.style.position = 'absolute';
                    label.style.top = `${j}px`;
                    label.style.left = '10px';
                    label.style.fontSize = '10px';
                    label.innerText = j;
                    verticalRuler.appendChild(label);
                }
            }
        } else {
            horizontalRuler.innerHTML = '';
            verticalRuler.innerHTML = '';
        }
    }

    canvas.on('selection:updated', showObjectDetails);
    canvas.on('selection:created', showObjectDetails);
    canvas.on('selection:cleared', clearObjectDetails);

    canvas.on('object:modified', showObjectDetails);
    canvas.on('object:scaling', showObjectDetails);
    canvas.on('object:rotating', showObjectDetails);
    canvas.on('object:moving', showObjectDetails);

    function showObjectDetails() {
        const activeObject = canvas.getActiveObject();
        const details = document.getElementById('objectDetails');
        details.innerHTML = '';

        if (activeObject) {
            if (activeObject.type === 'textbox') {
                details.innerHTML = 
                    `<h3>Text Properties</h3>
                    <label>Text: <input type="text" id="textContent" value="${activeObject.text}"></label><br>
                    <label>Font Size: <input type="number" id="fontSize" value="${activeObject.fontSize}"></label><br>
                    <label>Color: <input type="color" id="fontColor" value="${activeObject.fill}"></label><br>
                    <label>Font Family: <input type="text" id="fontFamily" value="${activeObject.fontFamily}"></label><br>
                    <button id="deleteObject">Delete</button>`;
                
                document.getElementById('textContent').addEventListener('input', function() {
                    activeObject.text = this.value;
                    canvas.renderAll();
                });

                document.getElementById('fontSize').addEventListener('input', function() {
                    activeObject.fontSize = this.value;
                    canvas.renderAll();
                });

                document.getElementById('fontColor').addEventListener('input', function() {
                    activeObject.fill = this.value;
                    canvas.renderAll();
                });

                document.getElementById('fontFamily').addEventListener('input', function() {
                    activeObject.fontFamily = this.value;
                    canvas.renderAll();
                });

                document.getElementById('deleteObject').addEventListener('click', function() {
                    canvas.remove(activeObject);
                    clearObjectDetails();
                });
            } else if (activeObject.type === 'image') {
                details.innerHTML = 
                    `<h3>Image Properties</h3>
                    <label>Alt Text: <input type="text" id="altText" value="${activeObject.alt}"></label><br>
                    <button id="deleteObject">Delete</button>`;

                document.getElementById('altText').addEventListener('input', function() {
                    activeObject.alt = this.value;
                });

                document.getElementById('deleteObject').addEventListener('click', function() {
                    canvas.remove(activeObject);
                    clearObjectDetails();
                });
            }
        }
    }

    function clearObjectDetails() {
        const details = document.getElementById('objectDetails');
        details.innerHTML = '<p>Select an object to view and edit its properties.</p>';
    }
});
