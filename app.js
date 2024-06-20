document.addEventListener("DOMContentLoaded", function() {
    const canvas = new fabric.Canvas('canvas');

    document.getElementById('addText').addEventListener('click', function() {
        const text = new fabric.Textbox('Sample Text', {
            left: 50,
            top: 50,
            width: 200,
            fontSize: 20,
            fill: '#000',
            fontFamily: 'Arial'
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
                html += `<${tag} style="position:absolute;left:${obj.left}px;top:${obj.top}px;font-size:${obj.fontSize}px;color:${obj.fill};font-family:${obj.fontFamily};">${obj.text}</${tag}>\n`;
            } else if (obj.type === 'image') {
                html += `<img src="${obj._element.src}" alt="${obj.alt || ''}" style="position:absolute;left:${obj.left}px;top:${obj.top}px;width:${obj.width * obj.scaleX}px;height:${obj.height * obj.scaleY}px;transform:rotate(${obj.angle}deg);">\n`;
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
                    <label>Size: <input type="number" id="textSize" value="${activeObject.fontSize}"></label><br>
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
                `;

                // Add real-time updates for text properties
                document.getElementById('textContent').addEventListener('input', function() {
                    activeObject.set('text', this.value);
                    canvas.renderAll();
                });
                document.getElementById('textSize').addEventListener('input', function() {
                    activeObject.set('fontSize', parseInt(this.value, 10));
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
                    <label>Width: <input type="number" id="imgWidth" value="${activeObject.width * activeObject.scaleX}"></label><br>
                    <label>Height: <input type="number" id="imgHeight" value="${activeObject.height * activeObject.scaleY}"></label><br>
                    <label>Angle: <input type="number" id="imgAngle" value="${activeObject.angle}"></label><br>
                    <label>Alt Text: <input type="text" id="imgAlt" value="${activeObject.alt || ''}"></label><br>
                `;

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
});
