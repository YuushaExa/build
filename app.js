document.addEventListener("DOMContentLoaded", function() {
    const canvas = new fabric.Canvas('canvas');

    document.getElementById('addText').addEventListener('click', function() {
        const text = new fabric.Textbox('Sample Text', {
            left: 50,
            top: 50,
            width: 200,
            fontSize: 20
        });
        canvas.add(text);
    });

    document.getElementById('addImage').addEventListener('click', function() {
        const url = prompt("Enter the image URL:");
        if (url) {
            fabric.Image.fromURL(url, function(img) {
                img.set({
                    left: 50,
                    top: 100,
                    scaleX: 0.5,
                    scaleY: 0.5
                });
                canvas.add(img);
            });
        }
    });

    document.getElementById('exportCode').addEventListener('click', function() {
        const objects = canvas.getObjects();
        let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<title>Your Page</title>\n</head>\n<body>\n';

        objects.forEach(obj => {
            if (obj.type === 'textbox') {
                html += `<div style="position:absolute;left:${obj.left}px;top:${obj.top}px;font-size:${obj.fontSize}px;">${obj.text}</div>\n`;
            } else if (obj.type === 'image') {
                html += `<img src="${obj._element.src}" style="position:absolute;left:${obj.left}px;top:${obj.top}px;width:${obj.width * obj.scaleX}px;height:${obj.height * obj.scaleY}px;">\n`;
            }
        });

        html += '</body>\n</html>';
        document.getElementById('htmlCode').value = html;
    });
});
