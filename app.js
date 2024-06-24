document.addEventListener("DOMContentLoaded", function() {
    const canvas = new fabric.Canvas('canvas');
    let rulerVisible = false;
    let rulerInterval = 50;
    let zoomLevel = 1; // Track the current zoom level

    // Mouse wheel zoom
    canvas.on('mouse:wheel', function(opt) {
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
        zoomLevel = zoom;
        opt.e.preventDefault();
        opt.e.stopPropagation();
        updateZoom();
    });

    document.getElementById('zoomIn').addEventListener('click', function() {
        zoomLevel *= 1.1;
        if (zoomLevel > 20) zoomLevel = 20;
        canvas.setViewportTransform([zoomLevel, 0, 0, zoomLevel, 0, 0]);
        updateZoom();
    });

    document.getElementById('zoomOut').addEventListener('click', function() {
        zoomLevel *= 0.9;
        if (zoomLevel < 0.01) zoomLevel = 0.01;
        canvas.setViewportTransform([zoomLevel, 0, 0, zoomLevel, 0, 0]);
        updateZoom();
    });

    document.getElementById('resetZoom').addEventListener('click', function() {
        zoomLevel = 1;
        canvas.setViewportTransform([zoomLevel, 0, 0, zoomLevel, 0, 0]);
        updateZoom();
    });

    function updateZoom() {
        document.getElementById('zoomPercentage').innerText = `${(zoomLevel * 100).toFixed(1)}%`;
    }

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
                    </label><br>`;
            } else if (activeObject.type === 'image') {
                details.innerHTML = 
                    `<h3>Image Properties</h3>
                    <label>Alt Text: <input type="text" id="imageAltText" value="${activeObject.alt || ''}"></label><br>`;
            }
        }
    }

    function clearObjectDetails() {
        document.getElementById('objectDetails').innerHTML = '<em>No object selected</em>';
    }
});
