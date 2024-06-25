document.addEventListener("DOMContentLoaded", function() {
    const canvas = new fabric.Canvas('canvas');
    let rulerVisible = false;
    let rulerInterval = 50;
    let zoomLevel = 1; // Track the current zoom level
    const maxZoom = 20;
    const minZoom = 0.01;

    // Set canvas dimensions
    canvas.setWidth(600);
    canvas.setHeight(400);

    // Adjust zoom level to fit canvas within browser window
    function adjustZoomToFitCanvas() {
        const browserWidth = window.innerWidth;
        const browserHeight = window.innerHeight;
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();

        let scaleFactor = Math.min(browserWidth / canvasWidth, browserHeight / canvasHeight, 1);

        canvas.setZoom(scaleFactor);
        zoomLevel = scaleFactor;
        updateZoom();
    }

    adjustZoomToFitCanvas();

    // Adjust zoom level on window resize
    window.addEventListener('resize', adjustZoomToFitCanvas);

    // Mouse wheel zoom
    canvas.on('mouse:wheel', function(opt) {
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > maxZoom) zoom = maxZoom;
        if (zoom < minZoom) zoom = minZoom;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();

        // Adjust viewport transform to keep canvas centered
        updateViewportTransform();

        // Update zoom level and percentage display
        zoomLevel = zoom;
        updateZoom();
    });

    // Add Text Button
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

    // Add Image Button
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

    // Export HTML Button
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

    // Toggle Ruler Button
    document.getElementById('toggleRuler').addEventListener('click', function() {
        rulerVisible = !rulerVisible;
        updateRulerVisibility();
    });

    // Ruler Interval Input
    document.getElementById('rulerInterval').addEventListener('input', function() {
        rulerInterval = parseInt(this.value);
        if (rulerVisible) {
            updateRulerVisibility();
        }
    });

    // Zoom In Button
    document.getElementById('zoomIn').addEventListener('click', function() {
        zoomLevel *= 1.1;
        if (zoomLevel > maxZoom) zoomLevel = maxZoom;
        canvas.setZoom(zoomLevel);
        updateViewportTransform();
        updateZoom();
    });

    // Zoom Out Button
    document.getElementById('zoomOut').addEventListener('click', function() {
        zoomLevel *= 0.9;
        if (zoomLevel < minZoom) zoomLevel = minZoom;
        canvas.setZoom(zoomLevel);
        updateViewportTransform();
        updateZoom();
    });

    // Reset Zoom Button
    document.getElementById('resetZoom').addEventListener('click', function() {
        zoomLevel = 1;
        canvas.setZoom(zoomLevel);
        updateViewportTransform();
        updateZoom();
    });

    // Update Canvas Size Button
    document.getElementById('updateCanvasSize').addEventListener('click', function() {
        const width = parseInt(document.getElementById('canvasWidth').value, 10);
        const height = parseInt(document.getElementById('canvasHeight').value, 10);
        canvas.setDimensions({ width: width, height: height });
        updateRulerVisibility(); // Update ruler positions to match new canvas size
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

    function updateViewportTransform() {
        var vpt = canvas.viewportTransform;
        vpt[4] = canvas.getWidth() / 2 - (canvas.getWidth() * zoomLevel / 2);
        vpt[5] = canvas.getHeight() / 2 - (canvas.getHeight() * zoomLevel / 2);
        canvas.renderAll();
    }

    // Other event listeners to update object details...
    canvas.on('selection:updated', showObjectDetails);
    canvas.on('selection:created', showObjectDetails);
    canvas.on('selection:cleared', clearObjectDetails);

    canvas.on('object:modified', showObjectDetails);
    canvas.on('object:scaling', function(e) {
        const activeObject = e.target;
        if (activeObject && activeObject.type === 'textbox') {
            activeObject.set('fontSize', activeObject.fontSize * activeObject.scaleX);
            activeObject.set({ scaleX: 1, scaleY: 1 });
        }
        showObjectDetails();
    });

    function showObjectDetails() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            // Display object details...
        }
    }

    function clearObjectDetails() {
        // Clear object details display...
    }
});
