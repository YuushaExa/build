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
    const previewWindow = window.open('', 'Preview', 'width=100%,height=100%');
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
        zoomLevel *= 0.9;
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
                    <label>Size: <input type="number" id="textSize" value="${activeObject.fontSize.toFixed(1)}"></label><br>
                    <label>Color: <input type="color" id="textColor" value="${activeObject.fill}"></label><br>
                    <label>Font: <input type="text" id="textFont" value="${activeObject.fontFamily || 'Arial'}"></label><br>
                    <label>Heading: 
                        <select id="textHeading">
                            <option value="div" ${activeObject.heading === 'div' ? 'selected' : ''}>Normal</option>
                            <option value="h1" ${activeObject.heading === 'h1' ? 'selected' : ''}>H1</option>
                            <option value="h2" ${activeObject.heading === 'h2' ? 'selected' : ''}>H2</option>
                            <option value="h3" ${activeObject.heading === 'h3' ? 'selected' : ''}>H3</option>
                            <option value="h4" ${activeObject.heading === 'h4' ? 'selected' : ''}>H4</option>
                            <option value="h5" ${activeObject.heading === 'h5' ? 'selected' : ''}>H5</option>
                            <option value="h6" ${activeObject.heading === 'h6' ? 'selected' : ''}>H6</option>
                        </select>
                    </label><br>
                    <button id="resetText">Reset Text Properties</button>`;
                document.getElementById('resetText').addEventListener('click', function() {
                    activeObject.set({
                        text: 'Sample Text',
                        fontSize: 20,
                        fill: '#000',
                        fontFamily: 'Arial',
                        heading: 'div'
                    });
                    canvas.renderAll();
                    showObjectDetails();
                });
                // Add real-time updates for text properties
                document.getElementById('textContent').addEventListener('input', function() {
                    activeObject.set('text', this.value);
                    canvas.renderAll();
                });
                document.getElementById('textSize').addEventListener('input', function() {
                    activeObject.set('fontSize', parseFloat(this.value));
                    canvas.renderAll();
                });
                document.getElementById('textColor').addEventListener('input', function() {
                    activeObject.set('fill', this.value);
                    canvas.renderAll();
                });
                document.getElementById('textFont').addEventListener('input', function() {
                    activeObject.set('fontFamily', this.value);
                    canvas.renderAll();
                });
                document.getElementById('textHeading').addEventListener('change', function() {
                    activeObject.set('heading', this.value);
                    canvas.renderAll();
                });
            } else if (activeObject.type === 'image') {
                details.innerHTML = 
                    `<h3>Image Properties</h3>
                    <label>Width: <input type="number" id="imgWidth" value="${(activeObject.width * activeObject.scaleX).toFixed(1)}"></label><br>
                    <label>Height: <input type="number" id="imgHeight" value="${(activeObject.height * activeObject.scaleY).toFixed(1)}"></label><br>
                    <label>Angle: <input type="number" id="imgAngle" value="${activeObject.angle.toFixed(1)}"></label><br>
                    <label>Alt Text: <input type="text" id="imgAlt" value="${activeObject.alt || ''}"></label><br>
                    <button id="resetImage">Reset Image Properties</button>`;
                document.getElementById('resetImage').addEventListener('click', function() {
                    activeObject.set({
                        scaleX: 0.5,
                        scaleY: 0.5,
                        angle: 0,
                        alt: ''
                    });
                    canvas.renderAll();
                    showObjectDetails();
                });
                // Add real-time updates for image properties
                document.getElementById('imgWidth').addEventListener('input', function() {
                    activeObject.scaleToWidth(parseFloat(this.value));
                    canvas.renderAll();
                });
                document.getElementById('imgHeight').addEventListener('input', function() {
                    activeObject.scaleToHeight(parseFloat(this.value));
                    canvas.renderAll();
                });
                document.getElementById('imgAngle').addEventListener('input', function() {
                    activeObject.set('angle', parseFloat(this.value));
                    canvas.renderAll();
                });
                document.getElementById('imgAlt').addEventListener('input', function() {
                    activeObject.set('alt', this.value);
                });
            }
        }
    }
    function clearObjectDetails() {
        const details = document.getElementById('objectDetails');
        details.innerHTML = '';
    }
    // Ensure real-time updates for object properties
    canvas.on('object:scaling', function(e) {
        const activeObject = e.target;
        if (activeObject && activeObject.type === 'textbox') {
            activeObject.set('fontSize', activeObject.fontSize * activeObject.scaleX);
            activeObject.set({ scaleX: 1, scaleY: 1 });
        }
        showObjectDetails();
    });
    canvas.on('object:modified', function(e) {
        showObjectDetails();
    });
    canvas.on('object:rotating', function(e) {
        showObjectDetails();
    });
    canvas.on('object:moving', function(e) {
        showObjectDetails();
    });
});
