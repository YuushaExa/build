document.addEventListener("DOMContentLoaded", function() {
    const canvas = new fabric.Canvas('canvas');
    let rulerVisible = false;
    let rulerInterval = 50;
    let zoomLevel = 1; // Track the current zoom level
    canvas.setWidth(960);
    canvas.setHeight(540);

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
        
        // Adjust viewport transform to keep canvas centered
        var vpt = this.viewportTransform;
        vpt[4] = canvas.getWidth() / 2 - (canvas.getWidth() * zoom / 2);
        vpt[5] = canvas.getHeight() / 2 - (canvas.getHeight() * zoom / 2);
        
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
        const html = generateHTMLContent();
        document.getElementById('htmlCode').value = html;
    });
    document.getElementById('preview').addEventListener('click', function() {
        const html = generateHTMLContent();
        const previewWindow = window.open('', 'Preview', 'width=800,height=600');
        previewWindow.document.write(html);
        previewWindow.document.close();
    });
    
    function generateHTMLContent() {
        const objects = canvas.getObjects();
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const styles = generateStyles(objects, canvasWidth, canvasHeight);
        const bodyContent = generateBodyContent(objects, canvasWidth, canvasHeight);
        return generateHTML(styles, bodyContent);
    }

    function generateStyles(objects, canvasWidth, canvasHeight) {
        let styles = 'body{margin:0;padding:0;font-family:Arial,sans-serif;}.canvas-container{position:relative;width:100vw;height:100vh;}.canvas-object{position:absolute;}@media(max-width:600px){.canvas-container{width:100%;height:auto;}.canvas-object{transform-origin:top left;}}';
        objects.forEach((obj, index) => {
            const uniqueId = `object-${index}`;
            const leftPercent = (obj.left / canvasWidth) * 100;
            const topPercent = (obj.top / canvasHeight) * 100;
            const angle = obj.angle ? `transform:rotate(${obj.angle.toFixed(1)}deg);` : '';
            if (obj.type === 'textbox') {
                styles += `#${uniqueId}{left:${leftPercent.toFixed(1)}%;top:${topPercent.toFixed(1)}%;font-size:${(obj.fontSize / 16).toFixed(1)}rem;color:${obj.fill};font-family:${obj.fontFamily};${angle}}`;
            } else if (obj.type === 'image') {
                const widthPercent = ((obj.width * obj.scaleX) / canvasWidth) * 100;
                const heightPercent = ((obj.height * obj.scaleY) / canvasHeight) * 100;
                styles += `#${uniqueId}{left:${leftPercent.toFixed(1)}%;top:${topPercent.toFixed(1)}%;width:${widthPercent.toFixed(1)}%;height:${heightPercent.toFixed(1)}%;${angle}}`;
            }
        });
        return styles;
    }

    function generateBodyContent(objects, canvasWidth, canvasHeight) {
        let bodyContent = '<div class="canvas-container">';
        objects.forEach((obj, index) => {
            const uniqueId = `object-${index}`;
            if (obj.type === 'textbox') {
                const tag = obj.heading || 'div';
                bodyContent += `<${tag} id="${uniqueId}" class="canvas-object" role="textbox">${sanitizeHTML(obj.text)}</${tag}>`;
            } else if (obj.type === 'image') {
                bodyContent += `<img id="${uniqueId}" class="canvas-object" src="${sanitizeURL(obj._element.src)}" alt="${sanitizeHTML(obj.alt || 'Image')}" role="img">`;
            }
        });
        bodyContent += '</div>';
        return bodyContent;
    }

    function generateHTML(styles, bodyContent) {
        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="A dynamically generated HTML page with objects from the canvas."><meta name="keywords" content="HTML, canvas, objects, dynamic content"><title>Generated Page</title><style>${styles}</style></head><body>${bodyContent}</body></html>`;
    }

    function sanitizeHTML(html) {
        const element = document.createElement('div');
        element.innerText = html;
        return element.innerHTML;
    }

    function sanitizeURL(url) {
        const element = document.createElement('a');
        element.href = url;
        return element.href;
    }
    
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
        updateViewportTransform();
        updateZoom();
    });
    document.getElementById('zoomOut').addEventListener('click', function() {
        zoomLevel /= 1.1;
        if (zoomLevel < 0.01) zoomLevel = 0.01;
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

    function updateViewportTransform() {
        var vpt = canvas.viewportTransform;
        vpt[4] = canvas.getWidth() / 2 - (canvas.getWidth() * zoomLevel / 2);
        vpt[5] = canvas.getHeight() / 2 - (canvas.getHeight() * zoomLevel / 2);
        canvas.requestRenderAll();
    }

    function updateZoom() {
        document.getElementById('zoomPercentage').textContent = `${(zoomLevel * 100).toFixed(0)}%`;
    }
    
    function updateRulerVisibility() {
        const horizontalRuler = document.getElementById('horizontalRuler');
        const verticalRuler = document.getElementById('verticalRuler');
        if (rulerVisible) {
            drawRuler(horizontalRuler, verticalRuler);
        } else {
            horizontalRuler.innerHTML = '';
            verticalRuler.innerHTML = '';
        }
    }

    function drawRuler(horizontalRuler, verticalRuler) {
        horizontalRuler.innerHTML = '';
        verticalRuler.innerHTML = '';
        for (let i = 0; i < canvas.getWidth(); i += rulerInterval) {
            const div = document.createElement('div');
            div.classList.add('ruler-mark');
            div.style.left = `${i}px`;
            horizontalRuler.appendChild(div);
        }
        for (let i = 0; i < canvas.getHeight(); i += rulerInterval) {
            const div = document.createElement('div');
            div.classList.add('ruler-mark');
            div.style.top = `${i}px`;
            verticalRuler.appendChild(div);
        }
    }
    
    function showObjectDetails() {
        const activeObject = canvas.getActiveObject();
        const objectDetails = document.getElementById('objectDetails');
        if (activeObject) {
            let details = `<p>Type: ${activeObject.type}</p>`;
            details += `<p>Left: ${activeObject.left}</p>`;
            details += `<p>Top: ${activeObject.top}</p>`;
            details += `<p>ScaleX: ${activeObject.scaleX}</p>`;
            details += `<p>ScaleY: ${activeObject.scaleY}</p>`;
            details += `<p>Angle: ${activeObject.angle}</p>`;
            if (activeObject.type === 'textbox') {
                details += `<p>Text: ${activeObject.text}</p>`;
                details += `<p>Font Size: ${activeObject.fontSize}</p>`;
                details += `<p>Fill: ${activeObject.fill}</p>`;
                details += `<p>Font Family: ${activeObject.fontFamily}</p>`;
            } else if (activeObject.type === 'image') {
                details += `<p>Src: ${activeObject._element.src}</p>`;
                details += `<p>Alt: ${activeObject.alt}</p>`;
            }
            objectDetails.innerHTML = details;
        } else {
            objectDetails.innerHTML = '<p>No object selected</p>';
        }
    }
    document.getElementById('canvasWidth').addEventListener('change', function() {
        canvas.setWidth(parseInt(this.value));
        if (rulerVisible) updateRulerVisibility();
    });
    document.getElementById('canvasHeight').addEventListener('change', function() {
        canvas.setHeight(parseInt(this.value));
        if (rulerVisible) updateRulerVisibility();
    });
    document.getElementById('updateCanvasSize').addEventListener('click', function() {
        const canvasWidth = parseInt(document.getElementById('canvasWidth').value);
        const canvasHeight = parseInt(document.getElementById('canvasHeight').value);
        canvas.setWidth(canvasWidth);
        canvas.setHeight(canvasHeight);
        if (rulerVisible) updateRulerVisibility();
    });

    canvas.on('selection:created', showObjectDetails);
    canvas.on('selection:updated', showObjectDetails);
    canvas.on('selection:cleared', showObjectDetails);
    canvas.on('object:modified', showObjectDetails);
});
