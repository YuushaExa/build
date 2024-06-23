document.addEventListener("DOMContentLoaded", function() {
    const canvas = new fabric.Canvas('canvas');
    let rulerVisible = false;
    let rulerInterval = 50;
    let zoomLevel = 1;
    const container = document.getElementById('canvas-container');
    const originalWidth = 1920;
    const originalHeight = 1080;

    document.getElementById('zoomIn').addEventListener('click', function() {
        setZoom(zoomLevel + 0.1);
    });

    document.getElementById('zoomOut').addEventListener('click', function() {
        setZoom(zoomLevel - 0.1);
    });

    canvas.on('mouse:wheel', function(opt) {
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 3) zoom = 3;
        if (zoom < 0.5) zoom = 0.5;
        setZoom(zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
    });

    function setZoom(newZoomLevel) {
        zoomLevel = newZoomLevel;
        if (zoomLevel > 3) zoomLevel = 3;
        if (zoomLevel < 0.5) zoomLevel = 0.5;

        canvas.setZoom(zoomLevel);
        canvas.setWidth(originalWidth * zoomLevel);
        canvas.setHeight(originalHeight * zoomLevel);

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const offsetX = (containerWidth - (originalWidth * zoomLevel)) / 2;
        const offsetY = (containerHeight - (originalHeight * zoomLevel)) / 2;

        canvas.setViewportTransform([zoomLevel, 0, 0, zoomLevel, offsetX, offsetY]);
        document.getElementById('zoomLevel').value = Math.round(zoomLevel * 100);
        updateRulerVisibility();
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

    function updateRulerVisibility() {
        const horizontalRuler = document.getElementById('horizontalRuler');
        const verticalRuler = document.getElementById('verticalRuler');

        if (rulerVisible) {
            const canvasWidth = originalWidth * zoomLevel;
            const canvasHeight = originalHeight * zoomLevel;

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
                    label.innerText = i / zoomLevel;
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
                    label.innerText = j / zoomLevel;
                    verticalRuler.appendChild(label);
                }
            }
        } else {
            horizontalRuler.innerHTML = '';
            verticalRuler.innerHTML = '';
        }
    }

    document.getElementById('addText').addEventListener('click', function() {
        const text = new fabric.Textbox('Sample Text', {
            left: 50,
            top: 50,
            width: 200,
            fontSize: 20,
            fill: '#000',
            fontFamily: 'Arial',
            scaleX: 1 / zoomLevel,
            scaleY: 1 / zoomLevel
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
                    scaleX: 0.5 / zoomLevel,
                    scaleY: 0.5 / zoomLevel,
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
                html += `<img src="${obj._element.src}" alt="${obj.alt || ''}" style="position:absolute;left:${obj.left.toFixed(1)}px;top:${obj.top.toFixed(1)}px;width:${(obj.width * obj.scaleX * zoomLevel).toFixed(1)}px;height:${(obj.height * obj.scaleY * zoomLevel).toFixed(1)}px;transform:rotate(${obj.angle.toFixed(1)}deg);">\n`;
            }
        });

        html += '</body>\n</html>';
        document.getElementById('htmlCode').value = html;
    });

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
                    <button id="deleteObject">Delete</button>
                `;
            } else if (activeObject.type === 'image') {
                details.innerHTML = `
                    <h3>Image Properties</h3>
                    <label>Image URL: <input type="text" id="imageUrl" value="${activeObject._element.src}"></label><br>
                    <label>Alt Text: <input type="text" id="imageAlt" value="${activeObject.alt || ''}"></label><br>
                    <button id="deleteObject">Delete</button>
                `;
            }

            document.getElementById('deleteObject').addEventListener('click', function() {
                canvas.remove(activeObject);
                clearObjectDetails();
            });

            if (activeObject.type === 'textbox') {
                document.getElementById('textContent').addEventListener('input', function() {
                    activeObject.text = this.value;
                    canvas.renderAll();
                });

                document.getElementById('textSize').addEventListener('input', function() {
                    activeObject.fontSize = parseFloat(this.value);
                    canvas.renderAll();
                });

                document.getElementById('textColor').addEventListener('input', function() {
                    activeObject.fill = this.value;
                    canvas.renderAll();
                });

                document.getElementById('textFont').addEventListener('input', function() {
                    activeObject.fontFamily = this.value;
                    canvas.renderAll();
                });

                document.getElementById('textHeading').addEventListener('change', function() {
                    activeObject.heading = this.value;
                    canvas.renderAll();
                });
            } else if (activeObject.type === 'image') {
                document.getElementById('imageUrl').addEventListener('input', function() {
                    fabric.Image.fromURL(this.value, function(img) {
                        img.set({
                            left: activeObject.left,
                            top: activeObject.top,
                            scaleX: activeObject.scaleX,
                            scaleY: activeObject.scaleY
                        });
                        canvas.remove(activeObject);
                        canvas.add(img);
                        canvas.setActiveObject(img);
                    });
                });

                document.getElementById('imageAlt').addEventListener('input', function() {
                    activeObject.alt = this.value;
                });
            }
        }
    }

    function clearObjectDetails() {
        document.getElementById('objectDetails').innerHTML = '';
    }

    // Add initial sample content
    const text = new fabric.Textbox('Sample Text', {
        left: 50,
        top: 50,
        width: 200,
        fontSize: 20,
        fill: '#000',
        fontFamily: 'Arial',
        scaleX: 1 / zoomLevel,
        scaleY: 1 / zoomLevel
    });
    canvas.add(text);

    fabric.Image.fromURL('https://via.placeholder.com/150', function(img) {
        img.set({
            left: 50,
            top: 100,
            scaleX: 0.5 / zoomLevel,
            scaleY: 0.5 / zoomLevel
        });
        canvas.add(img);
    });
});
