document.addEventListener("DOMContentLoaded", function() {
    const canvas = new fabric.Canvas('canvas');
    let rulerVisible = false;
    let rulerInterval = 50;
    
function resizeCanvasContainer() {
    const container = document.getElementById('canvas-container');
    const aspectRatio = 1920 / 1080;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (containerWidth / aspectRatio <= containerHeight) {
        canvas.setWidth(containerWidth);
        canvas.setHeight(containerWidth / aspectRatio);
    } else {
        canvas.setWidth(containerHeight * aspectRatio);
        canvas.setHeight(containerHeight);
    }

    canvas.renderAll();
}

// Initial resize
resizeCanvasContainer();

// Resize the canvas when the window is resized
window.addEventListener('resize', resizeCanvasContainer);

// Zoom in and out
const zoomStep = 0.1;
let zoomLevel = 1;
const zoomPercentage = document.getElementById('zoom-percentage');

function updateZoom() {
    canvas.setZoom(zoomLevel);
    zoomPercentage.innerText = `${Math.round(zoomLevel * 100)}%`;
}

document.getElementById('zoom-in').addEventListener('click', () => {
    zoomLevel += zoomStep;
    updateZoom();
});

document.getElementById('zoom-out').addEventListener('click', () => {
    if (zoomLevel > zoomStep) {
        zoomLevel -= zoomStep;
        updateZoom();
    }
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
                details.innerHTML = `
                    <h3>Text Properties</h3>
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
                    <button id="resetText">Reset Text Properties</button>
                `;

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
                details.innerHTML = `
                    <h3>Image Properties</h3>
                    <label>Width: <input type="number" id="imgWidth" value="${(activeObject.width * activeObject.scaleX).toFixed(1)}"></label><br>
                    <label>Height: <input type="number" id="imgHeight" value="${(activeObject.height * activeObject.scaleY).toFixed(1)}"></label><br>
                    <label>Angle: <input type="number" id="imgAngle" value="${activeObject.angle.toFixed(1)}"></label><br>
                    <label>Alt Text: <input type="text" id="imgAlt" value="${activeObject.alt || ''}"></label><br>
                    <button id="resetImage">Reset Image Properties</button>
                `;

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

    canvas.on('object:modified', function(e) {
        showObjectDetails();
    });

document.getElementById('updateCanvasSize').addEventListener('click', function() {
    const newWidth = parseInt(document.getElementById('canvasWidth').value, 10);
    const newHeight = parseInt(document.getElementById('canvasHeight').value, 10);

    if (!isNaN(newWidth) && newWidth > 0 && !isNaN(newHeight) && newHeight > 0) {
        canvas.setWidth(newWidth);
        canvas.setHeight(newHeight);
        updateRulerVisibility(); // Update rulers to match new canvas size
    }
});

    
});
