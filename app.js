document.addEventListener("DOMContentLoaded", function() {
    const canvas = new fabric.Canvas('canvas');
    let rulerVisible = false;
    let rulerInterval = 50;
    let zoomLevel = 1; // Track the current zoom level
    const maxZoom = 20;
    const minZoom = 0.01;

    // Set initial canvas size and adjust if necessary
    function adjustCanvasSize() {
        const browserWidth = window.innerWidth;
        const browserHeight = window.innerHeight;
        const canvasWidth = 600;
        const canvasHeight = 400;
        
        let scaleFactor = Math.min(browserWidth / canvasWidth, browserHeight / canvasHeight, 1);
        
        canvas.setWidth(canvasWidth * scaleFactor);
        canvas.setHeight(canvasHeight * scaleFactor);
        canvas.setZoom(scaleFactor);
        
        zoomLevel = scaleFactor;
        updateZoom();
        updateRulerVisibility();
    }
    
    adjustCanvasSize();
    
    // Adjust canvas size on window resize
    window.addEventListener('resize', adjustCanvasSize);

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

    // Other existing event listeners...

    // Zoom in, zoom out, reset zoom buttons
    document.getElementById('zoomIn').addEventListener('click', function() {
        zoomLevel *= 1.1;
        if (zoomLevel > maxZoom) zoomLevel = maxZoom;
        canvas.setZoom(zoomLevel);
        updateViewportTransform();
        updateZoom();
    });

    document.getElementById('zoomOut').addEventListener('click', function() {
        zoomLevel *= 0.9;
        if (zoomLevel < minZoom) zoomLevel = minZoom;
        canvas.setZoom(zoomLevel);
        updateViewportTransform();
        updateZoom();
    });

    document.getElementById('resetZoom').addEventListener('click', function() {
        zoomLevel = 1;
        canvas.setZoom(zoomLevel);
        updateViewportTransform();
        updateZoom();
    });

    // Other existing functions...

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

    // Other existing event handlers...

    // Ensure real-time updates for object properties
    canvas.on('object:scaling', function(e) {
        const activeObject = e.target;
        if (activeObject && activeObject.type === 'textbox') {
            activeObject.set('fontSize', activeObject.fontSize * activeObject.scaleX);
            activeObject.set({ scaleX: 1, scaleY: 1 });
        }
        showObjectDetails();
    });

    // Other existing event handlers...

});

// Ensure canvas size adjustments on window resize
window.addEventListener('resize', function() {
    adjustCanvasSize();
});

