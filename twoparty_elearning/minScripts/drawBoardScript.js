/* ***********************************************
common 
*********************************************/

function fitToContainer(parent , canvas){
    try{
        /*  canvas.style.width ='100%';
        canvas.style.height='100%';*/
        canvas.width  = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }catch(e){
        console.log(e);
    }
}

function setContext(canv) {
    var ctx=null;
    try{ 
         ctx = canv.getContext('2d');
         ctx.lineWidth = lineWidth;
         ctx.strokeStyle = strokeStyle;
         ctx.fillStyle = fillStyle;
         ctx.font = font;
    }catch(e){
        console.error(" canvas context not set " , canv);
        console.error(e);
    }
    return ctx;
}

var mainCanvas  = document.getElementById("main-canvas");
var canvas  = document.getElementById("temp-canvas");
var context = setContext(mainCanvas);
var tempContext = setContext(canvas);
var parentBox = document.getElementById("drawBox");

console.log("Main Canvas : " , mainCanvas , context);
console.log("Temp Canvas : " , canvas , tempContext );


fitToContainer( parentBox , mainCanvas );
fitToContainer( parentBox , canvas );

if(document.getElementById("trashBtn")){
    document.getElementById("trashBtn").onclick = function() {
        tempContext.clearRect(0, 0, canvas.width, canvas.height);
        console.log(" cleared temp canvas" , canvas  );

        context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        console.log(" cleared main canvas " , mainCanvas);

        window.location.reload();
    };
}else{
    console.error("trash button not found");
}


if(document.getElementById("saveBtn")){

    document.getElementById("saveBtn").onclick = function() {

        /*        
        var aref = document.createElement("a");
        aref.href = mainCanvas.toDataURL("image/png") ;
        aref.download = "drawBox.png";
        aref.click();*/

        parent.postMessage({
            modalpopup : {
                filetype : "blobcanvas" ,   
            }, 
            sender: selfId
        }, '*');

        /*document.getElementById("saveBtn").appendChild(aref);*/
        //window.open(mainCanvas.toDataURL("image/png") , "canvasDiagram");
        /*var e = mainCanvas.toDataURL("image/png"),
        a = window.open("about:blank", "image from canvas");
        a.document.write("<img src='" + e + "' alt='from canvas'/>");*/
    };
}else{
    console.error("save button not found");
}

/*-----------------------------------------------*/

var is = {
    isLine: false,
    isArc: false,
    isDragLastPath: false,
    isDragAllPaths: false,
    isRectangle: false,
    isQuadraticCurve: false,
    isBezierCurve: false,
    isPencil: false,
    isEraser: false,
    isText: false,

    set: function(shape) {
        var cache = this;
        cache.isLine = cache.isArc = cache.isDragLastPath = cache.isDragAllPaths = cache.isRectangle = cache.isQuadraticCurve = cache.isBezierCurve = is.isPencil = is.isEraser = is.isText = false;
        cache['is' + shape] = true;
    }
};


function addEvent(element, eventType, callback) {
    if (element.addEventListener) {
        element.addEventListener(eventType, callback, !1);
        return true;
    } else if (element.attachEvent) {
        return element.attachEvent('on' + eventType, callback);
    } else {
        element['on' + eventType] = callback;
    }
    return this;
}


function find(selector) {
    return document.getElementById(selector);
}


var points = [],
    textarea = find('code-text'),
    lineWidth = 2,
    strokeStyle = '#6c96c8',
    fillStyle = 'transparent',
    globalAlpha = 1,
    globalCompositeOperation = 'source-over',
    lineCap = 'butt',
    font = '15px Verdana',
    lineJoin = 'miter';


var common = {

    updateTextArea: function() {
        var c = common,
            toFixed = c.toFixed,
            getPoint = c.getPoint,

            isAbsolutePoints = find('is-absolute-points').checked,
            isShortenCode = find('is-shorten-code').checked;

        if (isAbsolutePoints && isShortenCode) c.absoluteShortened();
        if (isAbsolutePoints && !isShortenCode) c.absoluteNOTShortened(toFixed);
        if (!isAbsolutePoints && isShortenCode) c.relativeShortened(toFixed, getPoint);
        if (!isAbsolutePoints && !isShortenCode) c.relativeNOTShortened(toFixed, getPoint);
    },



    toFixed: function(input) {
        return Number(input).toFixed(1);
    },



    getPoint: function(pointToCompare, compareWith, prefix) {
        if (pointToCompare > compareWith) pointToCompare = prefix + ' + ' + (pointToCompare - compareWith);
        else if (pointToCompare < compareWith) pointToCompare = prefix + ' - ' + (compareWith - pointToCompare);
        else pointToCompare = prefix;

        return pointToCompare;
    },



    absoluteShortened: function() {

        var output = '',
            length = points.length,
            i = 0,
            point;
        for (i; i < length; i++) {
            point = points[i];
            output += this.shortenHelper(point[0], point[1], point[2]);
        }

        output = output.substr(0, output.length - 2);
        textarea.value = 'var points = [' + output + '], length = points.length, point, p, i = 0;\n\n' + this.forLoop;

        this.prevProps = null;
    },


    absoluteNOTShortened: function(toFixed) {
        var tempArray = [],
            i, point, p;

        for (i = 0; i < points.length; i++) {
            p = points[i];
            point = p[1];

            if (p[0] === 'pencil') {
                tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
            }

            if (p[0] === 'eraser') {
                tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
            }

            if (p[0] === 'line') {
                tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
            }

            if (p[0] === 'text') {
                tempArray[i] = ['context.fillText(' + point[0] + ', ' + point[1] + ', ' + point[2] + ');\n' + this.strokeOrFill(p[2])];
            }

            if (p[0] === 'arc') {
                tempArray[i] = ['context.beginPath(); \n' + 'context.arc(' + toFixed(point[0]) + ',' + toFixed(point[1]) + ',' + toFixed(point[2]) + ',' + toFixed(point[3]) + ', 0,' + point[4] + '); \n' + this.strokeOrFill(p[2])];
            }

            if (p[0] === 'rect') {
                tempArray[i] = [this.strokeOrFill(p[2]) + '\n' + 'context.strokeRect(' + point[0] + ', ' + point[1] + ',' + point[2] + ',' + point[3] + ');\n' + 'context.fillRect(' + point[0] + ', ' + point[1] + ',' + point[2] + ',' + point[3] + ');'];
            }

            if (p[0] === 'quadratic') {
                tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.quadraticCurveTo(' + point[2] + ', ' + point[3] + ', ' + point[4] + ', ' + point[5] + ');\n' + this.strokeOrFill(p[2])];
            }

            if (p[0] === 'bezier') {
                tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.bezierCurveTo(' + point[2] + ', ' + point[3] + ', ' + point[4] + ', ' + point[5] + ', ' + point[6] + ', ' + point[7] + ');\n' + this.strokeOrFill(p[2])];
            }

        }
        textarea.value = tempArray.join('\n\n') + this.strokeFillText;

        this.prevProps = null;
    },


    relativeShortened: function(toFixed, getPoint) {
        var i = 0,
            point, p, length = points.length,
            output = '',
            x = 0,
            y = 0;

        for (i; i < length; i++) {
            p = points[i];
            point = p[1];

            if (i === 0) {
                x = point[0];
                y = point[1];
            }

            if (p[0] === 'text') {
                x = point[1];
                y = point[2];
            }

            if (p[0] === 'pencil') {
                output += this.shortenHelper(p[0], [
                    getPoint(point[0], x, 'x'),
                    getPoint(point[1], y, 'y'),
                    getPoint(point[2], x, 'x'),
                    getPoint(point[3], y, 'y')
                ], p[2]);
            }

            if (p[0] === 'eraser') {
                output += this.shortenHelper(p[0], [
                    getPoint(point[0], x, 'x'),
                    getPoint(point[1], y, 'y'),
                    getPoint(point[2], x, 'x'),
                    getPoint(point[3], y, 'y')
                ], p[2]);
            }

            if (p[0] === 'line') {
                output += this.shortenHelper(p[0], [
                    getPoint(point[0], x, 'x'),
                    getPoint(point[1], y, 'y'),
                    getPoint(point[2], x, 'x'),
                    getPoint(point[3], y, 'y')
                ], p[2]);
            }

            if (p[0] === 'text') {
                output += this.shortenHelper(p[0], [
                    point[0],
                    getPoint(point[1], x, 'x'),
                    getPoint(point[2], y, 'y')
                ], p[2]);
            }

            if (p[0] === 'arc') {
                output += this.shortenHelper(p[0], [
                    getPoint(point[0], x, 'x'),
                    getPoint(point[1], y, 'y'),
                    point[2],
                    point[3],
                    point[4]
                ], p[2]);
            }

            if (p[0] === 'rect') {
                output += this.shortenHelper(p[0], [
                    getPoint(point[0], x, 'x'),
                    getPoint(point[1], y, 'y'),
                    getPoint(point[2], x, 'x'),
                    getPoint(point[3], y, 'y')
                ], p[2]);
            }

            if (p[0] === 'quadratic') {
                output += this.shortenHelper(p[0], [
                    getPoint(point[0], x, 'x'),
                    getPoint(point[1], y, 'y'),
                    getPoint(point[2], x, 'x'),
                    getPoint(point[3], y, 'y'),
                    getPoint(point[4], x, 'x'),
                    getPoint(point[5], y, 'y')
                ], p[2]);
            }

            if (p[0] === 'bezier') {
                output += this.shortenHelper(p[0], [
                    getPoint(point[0], x, 'x'),
                    getPoint(point[1], y, 'y'),
                    getPoint(point[2], x, 'x'),
                    getPoint(point[3], y, 'y'),
                    getPoint(point[4], x, 'x'),
                    getPoint(point[5], y, 'y'),
                    getPoint(point[6], x, 'x'),
                    getPoint(point[7], y, 'y')
                ], p[2]);
            }
        }

        output = output.substr(0, output.length - 2);
        textarea.value = 'var x = ' + x + ', y = ' + y + ', points = [' + output + '], length = points.length, point, p, i = 0;\n\n' + this.forLoop;

        this.prevProps = null;
    },


    relativeNOTShortened: function(toFixed, getPoint) {
        var i, point, p, length = points.length,
            output = '',
            x = 0,
            y = 0;

        for (i = 0; i < length; i++) {
            p = points[i];
            point = p[1];

            if (i === 0) {
                x = point[0];
                y = point[1];

                if (p[0] === 'text') {
                    x = point[1];
                    y = point[2];
                }

                output = 'var x = ' + x + ', y = ' + y + ';\n\n';
            }

            if (p[0] === 'arc') {
                output += 'context.beginPath();\n' + 'context.arc(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + point[2] + ', ' + point[3] + ', 0, ' + point[4] + ');\n'

                + this.strokeOrFill(p[2]);
            }

            if (p[0] === 'pencil') {
                output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                + this.strokeOrFill(p[2]);
            }

            if (p[0] === 'eraser') {
                output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                + this.strokeOrFill(p[2]);
            }

            if (p[0] === 'line') {
                output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                + this.strokeOrFill(p[2]);
            }

            if (p[0] === 'text') {
                output += 'context.fillText(' + point[0] + ', ' + getPoint(point[1], x, 'x') + ', ' + getPoint(point[2], y, 'y') + ');\n' + this.strokeOrFill(p[2]);
            }

            if (p[0] === 'rect') {
                output += this.strokeOrFill(p[2]) + '\n' + 'context.strokeRect(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n' + 'context.fillRect(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');';
            }

            if (p[0] === 'quadratic') {
                output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.quadraticCurveTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', ' + getPoint(point[4], x, 'x') + ', ' + getPoint(point[5], y, 'y') + ');\n'

                + this.strokeOrFill(p[2]);
            }

            if (p[0] === 'bezier') {
                output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.bezierCurveTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', ' + getPoint(point[4], x, 'x') + ', ' + getPoint(point[5], y, 'y') + ', ' + getPoint(point[6], x, 'x') + ', ' + getPoint(point[7], y, 'y') + ');\n'

                + this.strokeOrFill(p[2]);
            }

            if (i !== length - 1) output += '\n\n';
        }
        textarea.value = output + this.strokeFillText;

        this.prevProps = null;
    },



    forLoop: 'for(i; i < length; i++) {\n' + '\t p = points[i];\n' + '\t point = p[1];\n' + '\t context.beginPath();\n\n'

   
        + '\t if(p[2]) { \n' + '\t\t context.lineWidth = p[2][0];\n' + '\t\t context.strokeStyle = p[2][1];\n' + '\t\t context.fillStyle = p[2][2];\n'

        + '\t\t context.globalAlpha = p[2][3];\n' + '\t\t context.globalCompositeOperation = p[2][4];\n' + '\t\t context.lineCap = p[2][5];\n' + '\t\t context.lineJoin = p[2][6];\n' + '\t\t context.font = p[2][7];\n' + '\t }\n\n'

    
        + '\t if(p[0] === "line") { \n' + '\t\t context.moveTo(point[0], point[1]);\n' + '\t\t context.lineTo(point[2], point[3]);\n' + '\t }\n\n'

   
        + '\t if(p[0] === "pencil") { \n' + '\t\t context.moveTo(point[0], point[1]);\n' + '\t\t context.lineTo(point[2], point[3]);\n' + '\t }\n\n'

    
        + '\t if(p[0] === "text") { \n' + '\t\t context.fillText(point[0], point[1], point[2]);\n' + '\t }\n\n'


        + '\t if(p[0] === "eraser") { \n' + '\t\t context.moveTo(point[0], point[1]);\n' + '\t\t context.lineTo(point[2], point[3]);\n' + '\t }\n\n'


        + '\t if(p[0] === "arc") context.arc(point[0], point[1], point[2], point[3], 0, point[4]); \n\n'

        + '\t if(p[0] === "rect") {\n' + '\t\t context.strokeRect(point[0], point[1], point[2], point[3]);\n' + '\t\t context.fillRect(point[0], point[1], point[2], point[3]);\n'

        + '\t }\n\n'

        + '\t if(p[0] === "quadratic") {\n' + '\t\t context.moveTo(point[0], point[1]);\n' + '\t\t context.quadraticCurveTo(point[2], point[3], point[4], point[5]);\n' + '\t }\n\n'

        + '\t if(p[0] === "bezier") {\n' + '\t\t context.moveTo(point[0], point[1]);\n' + '\t\t context.bezierCurveTo(point[2], point[3], point[4], point[5], point[6], point[7]);\n' + '\t }\n\n'

        + '\t context.stroke();\n' + '\t context.fill();\n'

        + '}',

    strokeFillText: '\n\nfunction strokeOrFill(lineWidth, strokeStyle, fillStyle, globalAlpha, globalCompositeOperation, lineCap, lineJoin, font) { \n' + '\t if(lineWidth) { \n' + '\t\t context.globalAlpha = globalAlpha;\n' + '\t\t context.globalCompositeOperation = globalCompositeOperation;\n' + '\t\t context.lineCap = lineCap;\n' + '\t\t context.lineJoin = lineJoin;\n'

        + '\t\t context.lineWidth = lineWidth;\n' + '\t\t context.strokeStyle = strokeStyle;\n' + '\t\t context.fillStyle = fillStyle;\n' + '\t\t context.font = font;\n' + '\t } \n\n'

        + '\t context.stroke();\n' + '\t context.fill();\n'

        + '}',


    strokeOrFill: function(p) {
        if (!this.prevProps || this.prevProps !== p.join(',')) {
            this.prevProps = p.join(',');

            return 'strokeOrFill("' + p.join('", "') + '");';
        }

        return 'strokeOrFill();';
    },


    prevProps: null,
    shortenHelper: function(name, p1, p2) {
        var result = '["' + name + '", [' + p1.join(', ') + ']';

        if (!this.prevProps || this.prevProps !== p2.join(',')) {
            this.prevProps = p2.join(',');
            result += ', ["' + p2.join('", "') + '"]';
        }

        return result + '], ';
    }

};

// -------------------------------------------------------------

function endLastPath() {
    var cache = is;

    if (cache.isArc) arcHandler.end();
    else if (cache.isQuadraticCurve) quadraticHandler.end();
    else if (cache.isBezierCurve) bezierHandler.end();

    drawHelper.redraw();
}

// -------------------------------------------------------------

var copiedStuff = [],
    isControlKeyPressed;

// -------------------------------------------------------------

function copy() {
    endLastPath();

    dragHelper.global.startingIndex = 0;

    if (find('copy-last').checked) {
        copiedStuff = points[points.length - 1];
        setSelection(find('drag-last-path'), 'DragLastPath');
    } else {
        copiedStuff = points;
        setSelection(find('drag-all-paths'), 'DragAllPaths');
    }
}

// -------------------------------------------------------------

function paste() {
    endLastPath();

    dragHelper.global.startingIndex = 0;

    if (find('copy-last').checked) {
        points[points.length] = copiedStuff;

        dragHelper.global = {
            prevX: 0,
            prevY: 0,
            startingIndex: points.length - 1
        };

        dragHelper.dragAllPaths(0, 0);
        setSelection(find('drag-last-path'), 'DragLastPath');
    } else {

        dragHelper.global.startingIndex = points.length;
        points = points.concat(copiedStuff);
        setSelection(find('drag-all-paths'), 'DragAllPaths');
    }
}

// -------------------------------------------------------------


/* ***********************************************
Decorator
*********************************************/

function make_base(imgsrc , context)
{
  base_image = new Image();
  //base_image.src = 'img/base.png';
  
  base_image.onload = function(){
    alert(" make base decorator pencil ", imgsrc);
    context.drawImage(base_image, 40, 40);
  }
  base_image.src=imgsrc;
}

// -------------------------------------------------------------
(function() {
    var params = {},
        r = /([^&=]+)=?([^&]*)/g;

    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }

    var match, search = window.location.search;
    while (match = r.exec(search.substring(1)))
        params[d(match[1])] = d(match[2]);

    window.params = params;
})();

var tools = {
    line: true,
    pencil: true,
    dragSingle: true,
    dragMultiple: true,
    eraser: true,
    rectangle: true,
    arc: true,
    bezier: true,
    quadratic: true,
    text: true
};

if (params.tools) {
    tools = JSON.parse(params.tools);
}

function setSelection(element, prop) {
    endLastPath();
    hideContainers();

    is.set(prop);

    var selected = document.getElementsByClassName('selected-shape')[0];
    if (selected) selected.className = selected.className.replace(/selected-shape/g, '');

    element.className += ' selected-shape';
}

// -------------------------------------------------------------

(function() {

    var cache = {};

    var lineCapSelect = find('lineCap-select');
    var lineJoinSelect = find('lineJoin-select');


    function getContext(id) {
        var context = find(id).getContext('2d');
        context.lineWidth = 2;
        context.strokeStyle = '#6c96c8';
        return context;
    }


    function bindEvent(context, shape) {
        if (shape === 'Pencil') {
            lineCap = lineJoin = 'round';
        }

        /* Default: setting default selected shape!! */
        if(params.selectedIcon) {
            params.selectedIcon = params.selectedIcon.split('')[0].toUpperCase() + params.selectedIcon.replace(params.selectedIcon.split('').shift(1), '');
            if(params.selectedIcon === shape) {
                is.set(params.selectedIcon);
            }
        }
        else is.set('Pencil');

        addEvent(context.canvas, 'click', function() {
            
            dragHelper.global.startingIndex = 0;

            setSelection(this, shape);

            if (this.id === 'drag-last-path') {
                find('copy-last').checked = true;
                find('copy-all').checked = false;
            } else if (this.id === 'drag-all-paths') {
                find('copy-all').checked = true;
                find('copy-last').checked = false;
            }

            if (this.id === 'pencil-icon' || this.id === 'eraser-icon') {
                cache.lineCap = lineCap;
                cache.lineJoin = lineJoin;

                lineCap = lineJoin = 'round';
            } else if (cache.lineCap && cache.lineJoin) {
                lineCap = cache.lineCap;
                lineJoin = cache.lineJoin;
            }

            if (this.id === 'eraser-icon') {
                cache.strokeStyle = strokeStyle;
                cache.fillStyle = fillStyle;
                cache.lineWidth = lineWidth;

                strokeStyle = 'White';
                fillStyle = 'White';
                lineWidth = 10;
            } else if (cache.strokeStyle && cache.fillStyle && typeof cache.lineWidth !== 'undefined') {
                strokeStyle = cache.strokeStyle;
                fillStyle = cache.fillStyle;
                lineWidth = cache.lineWidth;
            }
        });
    }

    var toolBox = find('tool-box');
    //toolBox.style.height = (innerHeight /* - toolBox.offsetTop - 77 */ ) + 'px';
    toolBox.style.height="100%";



    function decorateDragLastPath() {
        var context = getContext('drag-last-path');

        var x = 10,
            y = 6,
            line = "line",
            points = [
                [line, x, y, x + 5, y + 27],
                [line, x, y, x + 18, y + 19],
                [line, x + 17, y + 19, x + 9, y + 20],
                [line, x + 9, y + 20, x + 5, y + 27],
                [line, x + 16, y + 22, x + 16, y + 31],
                [line, x + 12, y + 27, x + 20, y + 27]
            ],
            length = points.length,
            point, i;

        for (i = 0; i < length; i++) {
            point = points[i];

            if (point[0] === "line") {
                context.beginPath();
                context.moveTo(point[1], point[2]);
                context.lineTo(point[3], point[4]);
                context.closePath();
                context.stroke();
            }
        }

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Last', 18, 12);

        bindEvent(context, 'DragLastPath');
    }

    if (tools.dragSingle === true) {
        decorateDragLastPath();
    } else document.getElementById('drag-last-path').style.display = 'none';


    function decorateDragAllPaths() {
        var context = getContext('drag-all-paths');

        var x = 10,
            y = 6,
            line = "line",
            points = [
                [line, x, y, x + 5, y + 27],
                [line, x, y, x + 18, y + 19],
                [line, x + 17, y + 19, x + 9, y + 20],
                [line, x + 9, y + 20, x + 5, y + 27],
                [line, x + 16, y + 22, x + 16, y + 31],
                [line, x + 12, y + 27, x + 20, y + 27]
            ],
            length = points.length,
            point, i;

        for (i = 0; i < length; i++) {
            point = points[i];

            if (point[0] === "line") {
                context.beginPath();
                context.moveTo(point[1], point[2]);
                context.lineTo(point[3], point[4]);
                context.closePath();
                context.stroke();
            }
        }

        context.fillStyle = 'Gray';
        context.font = '10px Verdana';
        context.fillText('All', 20, 12);

        bindEvent(context, 'DragAllPaths');
    }

    if (tools.dragMultiple === true) {
        decorateDragAllPaths();
    } else document.getElementById('drag-all-paths').style.display = 'none';

    // -------------------------------------------------------------

    function decorateLine() {
        var context = getContext('line');

        context.moveTo(0, 0);
        context.lineTo(40, 40);
        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Line', 16, 12);

        bindEvent(context, 'Line');
    }

    if (tools.line === true) {
        decorateLine();
    } else document.getElementById('line').style.display = 'none';

    // -------------------------------------------------------------

    function decoratePencil() {
        //console.log(document.getElementById('pencil-icon'));
        var context = document.getElementById('pencil-icon').getContext('2d');
        var imageObj = new Image();
        imageObj.src = 'images/pencil.png';
        imageObj.onload = function() {
            context.drawImage(imageObj, 0, 0 , 35, 35);
        };
        

       /* var context = getContext('pencil-icon');
        context.lineWidth = 5;
        context.lineCap = 'round';
        context.moveTo(35, 20);
        context.lineTo(5, 35);
        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Pencil', 6, 12);*/

        //make_base('/images/pencil.png', context);

        bindEvent(context, 'Pencil');
    }

    if (tools.pencil === true) {
        decoratePencil();
    } else document.getElementById('pencil-icon').style.display = 'none';

    // -------------------------------------------------------------

    function decorateEraser() {

        var context = document.getElementById('eraser-icon').getContext('2d');
        var imageObj = new Image();
        imageObj.src = 'images/eraser.png';
        imageObj.onload = function() {
            context.drawImage(imageObj, 0, 0 , 35, 35);
        };

/*        var context = getContext('eraser-icon');

        context.lineWidth = 9;
        context.lineCap = 'round';
        context.moveTo(35, 20);
        context.lineTo(5, 25);
        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Eraser', 6, 12);*/

        bindEvent(context, 'Eraser');
    }

    if (tools.eraser === true) {
        decorateEraser();
    } else document.getElementById('eraser-icon').style.display = 'none';

    // -------------------------------------------------------------

    function decorateText() {
        var context = getContext('text-icon');

        context.font = '22px Verdana';
        context.strokeText('T', 15, 30);

        bindEvent(context, 'Text');
    }

    if (tools.text === true) {
        decorateText();
    } else document.getElementById('text-icon').style.display = 'none';

    // -------------------------------------------------------------

    function decorateArc() {
        var context = getContext('arc');

        context.arc(20, 20, 16.3, Math.PI * 2, 0, 1);
        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Arc', 10, 24);

        bindEvent(context, 'Arc');
    }

    if (tools.arc === true) {
        decorateArc();
    } else document.getElementById('arc').style.display = 'none';

    // -------------------------------------------------------------

    function decorateRect() {
        var context = getContext('rectangle');

        context.strokeRect(5, 5, 30, 30);

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Rect', 8, 24);

        bindEvent(context, 'Rectangle');
    }

    if (tools.rectangle === true) {
        decorateRect();
    } else document.getElementById('rectangle').style.display = 'none';

    // -------------------------------------------------------------

    function decorateQuadratic() {
        var context = getContext('quadratic-curve');

        context.moveTo(0, 0);
        context.quadraticCurveTo(50, 10, 30, 40);
        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('quad..', 2, 24);

        bindEvent(context, 'QuadraticCurve');
    }

    if (tools.quadratic === true) {
        decorateQuadratic();
    } else document.getElementById('quadratic-curve').style.display = 'none';

    // -------------------------------------------------------------

    function decorateBezier() {
        var context = getContext('bezier-curve');

        var x = 0,
            y = 4;

        context.moveTo(x, y);
        context.bezierCurveTo(x + 86, y + 16, x - 45, y + 24, x + 48, y + 34);

        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Bezier', 10, 8);

        bindEvent(context, 'BezierCurve');
    }

    if (tools.bezier === true) {
        decorateBezier();
    } else document.getElementById('bezier-curve').style.display = 'none';

    // -------------------------------------------------------------

    function tempStrokeTheLine(context, width, mx, my, lx, ly) {
        context.beginPath();
        context.lineWidth = width;
        context.moveTo(mx, my);
        context.lineTo(lx, ly);
        context.stroke();
    }

    function decorateLineWidth() {
/*        var context = getContext('line-width');

        tempStrokeTheLine(context, 2, 5, 15, 35, 15);
        tempStrokeTheLine(context, 3, 5, 20, 35, 20);
        tempStrokeTheLine(context, 4, 5, 26, 35, 26);

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Line', 8, 12);
        context.fillText('Width', 6, 38);*/

        var context = document.getElementById('line-width').getContext('2d');
        var imageObj = new Image();
        imageObj.src = 'images/linesize.png';
        imageObj.onload = function() {
            context.drawImage(imageObj, 0, 0 , 35, 35);
        };

        var lineWidthContainer = find('line-width-container'),
            lineWidthText = find('line-width-text'),
            btnLineWidthDone = find('line-width-done'),
            h1 = document.getElementsByTagName('h1')[0],
            canvas = context.canvas;

        addEvent(canvas, 'click', function() {
            hideContainers();

            lineWidthContainer.style.display = 'block';
            lineWidthContainer.style.top = (canvas.offsetTop + 1) + 'px';
            lineWidthContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

            lineWidthText.focus();
        });

        addEvent(btnLineWidthDone, 'click', function() {
            lineWidthContainer.style.display = 'none';
            lineWidth = lineWidthText.value;
        });
    }

    decorateLineWidth();

    // -------------------------------------------------------------
    function decorateColors() {
/*        var context = getContext('colors');

        context.fillStyle = 'red';
        context.fillRect(5, 3, 30, 10);

        context.fillStyle = 'green';
        context.fillRect(5, 15, 30, 10);

        context.fillStyle = 'blue';
        context.fillRect(5, 27, 30, 10);*/

        var context = document.getElementById('colors').getContext('2d');
        var imageObj = new Image();
        imageObj.src = 'images/color.png';
        imageObj.onload = function() {
            context.drawImage(imageObj, 0, 0 , 35, 35);
        };

        var colorsContainer = find('colors-container'),
            strokeStyleText = find('stroke-style'),
            fillStyleText = find('fill-style'),
            btnColorsDone = find('colors-done'),
            h1 = document.getElementsByTagName('h1')[0],
            canvas = context.canvas;

        addEvent(canvas, 'click', function() {
            hideContainers();

            colorsContainer.style.display = 'block';
            colorsContainer.style.top = (canvas.offsetTop + 1) + 'px';
            colorsContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

            strokeStyleText.focus();
        });

        addEvent(btnColorsDone, 'click', function() {
            colorsContainer.style.display = 'none';
            strokeStyle = strokeStyleText.value;
            fillStyle = fillStyleText.value;
        });
    }

    decorateColors();

    // -------------------------------------------------------------
    function decorateAdditionalOptions() {
        var context = getContext('additional');

        context.fillStyle = '#6c96c8';
        context.font = '35px Verdana';
        context.fillText('»', 10, 27);

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Extras!', 2, 38);

        var additionalContainer = find('additional-container'),
            btnAdditionalClose = find('additional-close'),
            h1 = document.getElementsByTagName('h1')[0],
            canvas = context.canvas,
            globalAlphaSelect = find('globalAlpha-select'),
            globalCompositeOperationSelect = find('globalCompositeOperation-select');

        addEvent(canvas, 'click', function() {
            hideContainers();

            additionalContainer.style.display = 'block';
            additionalContainer.style.top = (canvas.offsetTop + 1) + 'px';
            additionalContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';
        });

        addEvent(btnAdditionalClose, 'click', function() {
            additionalContainer.style.display = 'none';

            globalAlpha = globalAlphaSelect.value;
            globalCompositeOperation = globalCompositeOperationSelect.value;
            lineCap = lineCapSelect.value;
            lineJoin = lineJoinSelect.value;
        });
    }

    decorateAdditionalOptions();

    // -------------------------------------------------------------

    var designPreview = find('design-preview'),
        codePreview = find('code-preview');

    // -------------------------------------------------------------

    // todo: use this function in share-drawings.js
    // to sync buttons' states
    window.selectBtn = function(btn, isSkipWebRTCMessage) {
        codePreview.className = designPreview.className = '';

        if (btn == designPreview) designPreview.className = 'preview-selected';
        else codePreview.className = 'preview-selected';

        if (!isSkipWebRTCMessage && window.connection && connection.numberOfConnectedUsers >= 1) {
            connection.send({
                btnSelected: btn.id
            });
        } else {
            // to sync buttons' UI-states
            if (btn == designPreview) btnDesignerPreviewClicked();
            else btnCodePreviewClicked();
        }
    };

    // -------------------------------------------------------------

    addEvent(designPreview, 'click', function() {
        selectBtn(designPreview);
        btnDesignerPreviewClicked();
    });

    function btnDesignerPreviewClicked() {
        codeText.parentNode.style.display = 'none';
        optionsContainer.style.display = 'none';

        hideContainers();
        endLastPath();
    }

    // -------------------------------------------------------------

    addEvent(codePreview, 'click', function() {
        selectBtn(codePreview);
        btnCodePreviewClicked();
    });

    function btnCodePreviewClicked() {
        codeText.parentNode.style.display = 'block';
        optionsContainer.style.display = 'block';

        codeText.focus();
        common.updateTextArea();

        setHeightForCodeAndOptionsContainer();

        hideContainers();
        endLastPath();
    }

    // -------------------------------------------------------------

    var codeText = find('code-text'),
        optionsContainer = find('options-container');

    // -------------------------------------------------------------

    function setHeightForCodeAndOptionsContainer() {
        codeText.style.width = (innerWidth - optionsContainer.clientWidth - 30) + 'px';
        codeText.style.height = (innerHeight - 40) + 'px';

        codeText.style.marginLeft = (optionsContainer.clientWidth) + 'px';
        optionsContainer.style.height = (innerHeight) + 'px';
    }

    // -------------------------------------------------------------

    var isAbsolute = find('is-absolute-points'),
        isShorten = find('is-shorten-code');

    addEvent(isShorten, 'change', common.updateTextArea);
    addEvent(isAbsolute, 'change', common.updateTextArea);


})();



function hideContainers() {
    var additionalContainer = find('additional-container'),
        colorsContainer = find('colors-container'),
        lineWidthContainer = find('line-width-container');

    additionalContainer.style.display = colorsContainer.style.display = lineWidthContainer.style.display = 'none';
}

// -------------------------------------------------------------




/* ***********************************************
Draw helper
*********************************************/
var drawHelper = {


    redraw: function (skipSync) {
        tempContext.clearRect(0, 0, innerWidth, innerHeight);
        context.clearRect(0, 0, innerWidth, innerHeight);

        var i, point, length = points.length;
        for (i = 0; i < length; i++) {
            point = points[i];
            this[point[0]](context, point[1], point[2]);
        }
        
        if(!skipSync) {
            syncPoints();
        }
    },


    getOptions: function () {
        return [lineWidth, strokeStyle, fillStyle, globalAlpha, globalCompositeOperation, lineCap, lineJoin, font];
    },



    handleOptions: function (context, opt, isNoFillStroke) {
        opt = opt || this.getOptions();

        context.globalAlpha = opt[3];
        context.globalCompositeOperation = opt[4];

        context.lineCap = opt[5];
        context.lineJoin = opt[6];
        context.lineWidth = opt[0];

        context.strokeStyle = opt[1];
        context.fillStyle = opt[2];
        
        if (!isNoFillStroke) {
            context.stroke();
            context.fill();
        }
    },


    line: function (context, point, options) {
        context.beginPath();
        context.moveTo(point[0], point[1]);
        context.lineTo(point[2], point[3]);

        this.handleOptions(context, options);
    },


    text: function (context, point, options) {
        var oldFillStyle = fillStyle;
        context.fillStyle = fillStyle === 'transparent' || fillStyle === 'White' ? 'Black' : fillStyle;
        context.font = '15px Verdana';
		context.fillText(point[0].substr(1, point[0].length - 2), point[1], point[2]);
        fillStyle = oldFillStyle;

        this.handleOptions(context, options);
    },


    arc: function (context, point, options) {
        context.beginPath();
        context.arc(point[0], point[1], point[2], point[3], 0, point[4]);

        this.handleOptions(context, options);
    },



    rect: function (context, point, options) {
        this.handleOptions(context, options, true);

        context.strokeRect(point[0], point[1], point[2], point[3]);
        context.fillRect(point[0], point[1], point[2], point[3]);
    },



    quadratic: function (context, point, options) {
        context.beginPath();
        context.moveTo(point[0], point[1]);
        context.quadraticCurveTo(point[2], point[3], point[4], point[5]);

        this.handleOptions(context, options);
    },


    bezier: function (context, point, options) {
        context.beginPath();
        context.moveTo(point[0], point[1]);
        context.bezierCurveTo(point[2], point[3], point[4], point[5], point[6], point[7]);

        this.handleOptions(context, options);
    }


};

/* ***********************************************
Drag helper
*********************************************/
var dragHelper = {

    // -------------------------------------------------------------

    global: {
        prevX: 0,
        prevY: 0,
        ismousedown: false,
        pointsToMove: 'all',
        startingIndex: 0
    },

    // -------------------------------------------------------------

    mousedown: function (e) {

        // -------------------------------------------------------------

        if (isControlKeyPressed) {
            copy();
            paste();
            isControlKeyPressed = false;
        }

        // -------------------------------------------------------------

        var dHelper = dragHelper,
            g = dHelper.global;

        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        g.prevX = x;
        g.prevY = y;

        g.pointsToMove = 'all';

        if (points.length) {
            var p = points[points.length - 1],
                point = p[1];

            if (p[0] === 'line') {

                if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                    g.pointsToMove = 'head';
                }

                if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                    g.pointsToMove = 'tail';
                }
            }

            if (p[0] === 'rect') {

                if (dHelper.isPointInPath(x, y, point[0] + point[2], point[1] + point[3])) {
                    g.pointsToMove = 'stretch';
                }
            }

            if (p[0] === 'quadratic') {

                if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                    g.pointsToMove = 'starting-points';
                }

                if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                    g.pointsToMove = 'control-points';
                }

                if (dHelper.isPointInPath(x, y, point[4], point[5])) {
                    g.pointsToMove = 'ending-points';
                }
            }

            if (p[0] === 'bezier') {

                if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                    g.pointsToMove = 'starting-points';
                }

                if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                    g.pointsToMove = '1st-control-points';
                }

                if (dHelper.isPointInPath(x, y, point[4], point[5])) {
                    g.pointsToMove = '2nd-control-points';
                }

                if (dHelper.isPointInPath(x, y, point[6], point[7])) {
                    g.pointsToMove = 'ending-points';
                }
            }
        }

        g.ismousedown = true;
    },

    // -------------------------------------------------------------

    mouseup: function () {
        var g = this.global;

        if (is.isDragLastPath) {
            tempContext.clearRect(0, 0, innerWidth, innerHeight);
            context.clearRect(0, 0, innerWidth, innerHeight);
            this.end();
        }

        g.ismousedown = false;
    },

    // -------------------------------------------------------------

    mousemove: function (e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop,
            g = this.global;

        drawHelper.redraw();

        if (g.ismousedown) {
            this.dragShape(x, y);
        }

        if (is.isDragLastPath) this.init();
    },

    // -------------------------------------------------------------

    init: function () {
        if (!points.length) return;

        var p = points[points.length - 1],
            point = p[1],
            g = this.global;

        if (g.ismousedown) tempContext.fillStyle = 'rgba(255,85 ,154,.9)';
        else tempContext.fillStyle = 'rgba(255,85 ,154,.4)';

        if (p[0] === 'quadratic') {

            tempContext.beginPath();

            tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
            tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);
            tempContext.arc(point[4], point[5], 10, Math.PI * 2, 0, !1);

            tempContext.fill();
        }

        if (p[0] === 'bezier') {

            tempContext.beginPath();

            tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
            tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);
            tempContext.arc(point[4], point[5], 10, Math.PI * 2, 0, !1);
            tempContext.arc(point[6], point[7], 10, Math.PI * 2, 0, !1);

            tempContext.fill();
        }

        if (p[0] === 'line') {

            tempContext.beginPath();

            tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
            tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);

            tempContext.fill();
        }
        
        if (p[0] === 'text') {
            tempContext.font = "15px Verdana";
            tempContext.fillText(point[0], point[1], point[2]);
        }

        if (p[0] === 'rect') {

            tempContext.beginPath();
            tempContext.arc(point[0] + point[2], point[1] + point[3], 10, Math.PI * 2, 0, !1);
            tempContext.fill();
        }
    },

    // -------------------------------------------------------------

    isPointInPath: function (x, y, first, second) {
        return x > first - 10 && x < first + 10
            && y > second - 10 && y < second + 10;
    },

    // -------------------------------------------------------------

    getPoint: function (point, prev, otherPoint) {
        if (point > prev) point = otherPoint + (point - prev);
        else point = otherPoint - (prev - point);

        return point;
    },

    // -------------------------------------------------------------

    dragShape: function (x, y) {
        if (!this.global.ismousedown) return;

        tempContext.clearRect(0, 0, innerWidth, innerHeight);

        if (is.isDragLastPath) {
            this.dragLastPath(x, y);
        }

        if (is.isDragAllPaths) {
            this.dragAllPaths(x, y);
        }

        var g = this.global;

        g.prevX = x;
        g.prevY = y;
    },

    // -------------------------------------------------------------

    end: function () {
        if (!points.length) return;

        tempContext.clearRect(0, 0, innerWidth, innerHeight);

        var point = points[points.length - 1];
        drawHelper[point[0]](context, point[1], point[2]);
    },

    // -------------------------------------------------------------

    dragAllPaths: function (x, y) {
        var g = this.global,
            prevX = g.prevX,
            prevY = g.prevY, p, point,
            length = points.length,
            getPoint = this.getPoint,
            i = g.startingIndex;

        for (i; i < length; i++) {
            p = points[i];
            point = p[1];

            if (p[0] === 'line') {
                points[i] = [p[0], [
                    getPoint(x, prevX, point[0]),
                    getPoint(y, prevY, point[1]),
                    getPoint(x, prevX, point[2]),
                    getPoint(y, prevY, point[3])
                ], p[2]];

            }
            
            if (p[0] === 'text') {
                points[i] = [p[0], [
                    point[0],
                    getPoint(x, prevX, point[1]),
                    getPoint(y, prevY, point[2])
                ], p[2]];
            }

            if (p[0] === 'arc') {
                points[i] = [p[0], [
                    getPoint(x, prevX, point[0]),
                    getPoint(y, prevY, point[1]),
                    point[2],
                    point[3],
                    point[4]
                ], p[2]];
            }

            if (p[0] === 'rect') {
                points[i] = [p[0], [
                    getPoint(x, prevX, point[0]),
                    getPoint(y, prevY, point[1]),
                    point[2],
                    point[3]
                ], p[2]];
            }

            if (p[0] === 'quadratic') {
                points[i] = [p[0], [
                    getPoint(x, prevX, point[0]),
                    getPoint(y, prevY, point[1]),
                    getPoint(x, prevX, point[2]),
                    getPoint(y, prevY, point[3]),
                    getPoint(x, prevX, point[4]),
                    getPoint(y, prevY, point[5])
                ], p[2]];
            }

            if (p[0] === 'bezier') {
                points[i] = [p[0], [
                    getPoint(x, prevX, point[0]),
                    getPoint(y, prevY, point[1]),
                    getPoint(x, prevX, point[2]),
                    getPoint(y, prevY, point[3]),
                    getPoint(x, prevX, point[4]),
                    getPoint(y, prevY, point[5]),
                    getPoint(x, prevX, point[6]),
                    getPoint(y, prevY, point[7])
                ], p[2]];
            }
        }
    },

    // -------------------------------------------------------------

    dragLastPath: function (x, y) {
        var g = this.global,
            prevX = g.prevX,
            prevY = g.prevY,
            p = points[points.length - 1],
            point = p[1],
            getPoint = this.getPoint,
            isMoveAllPoints = g.pointsToMove === 'all';

        if (p[0] === 'line') {

            if (g.pointsToMove === 'head' || isMoveAllPoints) {
                point[0] = getPoint(x, prevX, point[0]);
                point[1] = getPoint(y, prevY, point[1]);
            }

            if (g.pointsToMove === 'tail' || isMoveAllPoints) {
                point[2] = getPoint(x, prevX, point[2]);
                point[3] = getPoint(y, prevY, point[3]);
            }

            points[points.length - 1] = [p[0], point, p[2]];
        }
        
        if (p[0] === 'text') {

            if (g.pointsToMove === 'head' || isMoveAllPoints) {
                point[1] = getPoint(x, prevX, point[1]);
                point[2] = getPoint(y, prevY, point[2]);
            }

            points[points.length - 1] = [p[0], point, p[2]];
        }

        if (p[0] === 'arc') {
            point[0] = getPoint(x, prevX, point[0]);
            point[1] = getPoint(y, prevY, point[1]);

            points[points.length - 1] = [p[0], point, p[2]];
        }

        if (p[0] === 'rect') {

            if (isMoveAllPoints) {
                point[0] = getPoint(x, prevX, point[0]);
                point[1] = getPoint(y, prevY, point[1]);
            }

            if (g.pointsToMove === 'stretch') {
                point[2] = getPoint(x, prevX, point[2]);
                point[3] = getPoint(y, prevY, point[3]);
            }

            points[points.length - 1] = [p[0], point, p[2]];
        }

        if (p[0] === 'quadratic') {

            if (g.pointsToMove === 'starting-points' || isMoveAllPoints) {
                point[0] = getPoint(x, prevX, point[0]);
                point[1] = getPoint(y, prevY, point[1]);
            }

            if (g.pointsToMove === 'control-points' || isMoveAllPoints) {
                point[2] = getPoint(x, prevX, point[2]);
                point[3] = getPoint(y, prevY, point[3]);
            }

            if (g.pointsToMove === 'ending-points' || isMoveAllPoints) {
                point[4] = getPoint(x, prevX, point[4]);
                point[5] = getPoint(y, prevY, point[5]);
            }

            points[points.length - 1] = [p[0], point, p[2]];
        }

        if (p[0] === 'bezier') {

            if (g.pointsToMove === 'starting-points' || isMoveAllPoints) {
                point[0] = getPoint(x, prevX, point[0]);
                point[1] = getPoint(y, prevY, point[1]);
            }

            if (g.pointsToMove === '1st-control-points' || isMoveAllPoints) {
                point[2] = getPoint(x, prevX, point[2]);
                point[3] = getPoint(y, prevY, point[3]);
            }

            if (g.pointsToMove === '2nd-control-points' || isMoveAllPoints) {
                point[4] = getPoint(x, prevX, point[4]);
                point[5] = getPoint(y, prevY, point[5]);
            }

            if (g.pointsToMove === 'ending-points' || isMoveAllPoints) {
                point[6] = getPoint(x, prevX, point[6]);
                point[7] = getPoint(y, prevY, point[7]);
            }

            points[points.length - 1] = [p[0], point, p[2]];
        }
    }

    // -------------------------------------------------------------

};
// -------------------------------------------------------------
/* ***********************************************
pencil Handler 
*********************************************/
var pencilHandler = {

    ismousedown: false,
    prevX: 0,
    prevY: 0,

    mousedown: function(e) {

        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;
            
        var t = this;

        t.prevX = x;
        t.prevY = y;

        t.ismousedown = true;

        tempContext.lineCap = 'round';
        drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

        points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

        t.prevX = x;
        t.prevY = y;
    },


    mouseup: function(e) {
        this.ismousedown = false;
    },


    mousemove: function(e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        var t = this;

        if (t.ismousedown) {
            tempContext.lineCap = 'round';
            drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

            t.prevX = x;
            t.prevY = y;
        }
    }
};


/* ***********************************************
Eraser Handler 
*********************************************/

var eraserHandler = {


    ismousedown: false,
    prevX: 0,
    prevY: 0,

    mousedown: function(e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        var t = this;

        t.prevX = x;
        t.prevY = y;

        t.ismousedown = true;

        // make sure that pencil is drawing shapes even 
        // if mouse is down but mouse isn't moving
        tempContext.lineCap = 'round';
        drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

        points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

        t.prevX = x;
        t.prevY = y;
    },


    mouseup: function(e) {
        this.ismousedown = false;
    },


    mousemove: function(e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        var t = this;

        if (t.ismousedown) {
            tempContext.lineCap = 'round';
            drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

            t.prevX = x;
            t.prevY = y;
        }
    }


};
/* ***********************************************
Line Handler 
*********************************************/

var lineHandler = {

    ismousedown: false,
    prevX: 0,
    prevY: 0,

    mousedown: function (e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        var t = this;

        t.prevX = x;
        t.prevY = y;

        t.ismousedown = true;
    },

    mouseup: function (e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        var t = this;
        if (t.ismousedown) {
            points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

            t.ismousedown = false;
        }
    },

    mousemove: function (e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        var t = this;

        if (t.ismousedown) {
            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);
        }
    }

};

/* ***********************************************
rect Handler 
*********************************************/
var rectHandler = {


    ismousedown: false,
    prevX: 0,
    prevY: 0,

    // -------------------------------------------------------------

    mousedown: function (e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        var t = this;
        
        t.prevX = x;
        t.prevY = y;

        t.ismousedown = true;
    },

    // -------------------------------------------------------------

    mouseup: function (e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        var t = this;
        if (t.ismousedown) {
            points[points.length] = ['rect', [t.prevX, t.prevY, x - t.prevX, y - t.prevY], drawHelper.getOptions()];

            t.ismousedown = false;
        }

    },

    // -------------------------------------------------------------

    mousemove: function (e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;
        
        var t = this;
        if (t.ismousedown) {
            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            drawHelper.rect(tempContext, [t.prevX, t.prevY, x - t.prevX, y - t.prevY]);
        }
    }

};

/* ***********************************************
Events handler 
*********************************************/

var selfId = parent.selfuserid;

var isTouch = 'createTouch' in document;

addEvent(canvas, isTouch ? 'touchstart' : 'mousedown', function (e) {
    if (isTouch) e = e.pageX ? e : e.touches.length ? e.touches[0] : { pageX: 0, pageY: 0 };

    var cache = is;

    console.log(" canvas coordinates x ->" , e.pageX , "||", canvas.offsetLeft);
    console.log(" canvas coordinates y ->" , e.pageY ," ||", canvas.offsetTop);

    if (cache.isLine){
 lineHandler.mousedown(e);
}
    else if (cache.isArc) {
arcHandler.mousedown(e);
}
    else if (cache.isRectangle){
 rectHandler.mousedown(e);
}
    else if (cache.isQuadraticCurve){
 quadraticHandler.mousedown(e);
}
    else if (cache.isBezierCurve){
 bezierHandler.mousedown(e);
}
    else if (cache.isDragLastPath || cache.isDragAllPaths){
 dragHelper.mousedown(e);
}
    else if (is.isPencil){
pencilHandler.mousedown(e);
}
    else if (is.isEraser){
 eraserHandler.mousedown(e);
}
    else if (is.isText){
 textHandler.mousedown(e);
}
else{
console.log(" none of the event matched ");
return;
}   
    drawHelper.redraw();
});


addEvent(canvas, isTouch ? 'touchend' : 'mouseup', function (e) {
    if (isTouch) e = e.pageX ? e : e.touches.length ? e.touches[0] : { pageX: 0, pageY: 0 };
    
    var cache = is;

    if (cache.isLine) lineHandler.mouseup(e);
    else if (cache.isArc) arcHandler.mouseup(e);
    else if (cache.isRectangle) rectHandler.mouseup(e);
    else if (cache.isQuadraticCurve) quadraticHandler.mouseup(e);
    else if (cache.isBezierCurve) bezierHandler.mouseup(e);
    else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mouseup(e);
    else if (is.isPencil) pencilHandler.mouseup(e);
    else if (is.isEraser) eraserHandler.mouseup(e);
    else if (is.isText) textHandler.mouseup(e);

    drawHelper.redraw();
});


addEvent(canvas, isTouch ? 'touchmove' : 'mousemove', function (e) {
    if (isTouch) e = e.pageX ? e : e.touches.length ? e.touches[0] : { pageX: 0, pageY: 0 };
    
    var cache = is;

    if (cache.isLine) lineHandler.mousemove(e);
    else if (cache.isArc) arcHandler.mousemove(e);
    else if (cache.isRectangle) rectHandler.mousemove(e);
    else if (cache.isQuadraticCurve) quadraticHandler.mousemove(e);
    else if (cache.isBezierCurve) bezierHandler.mousemove(e);
    else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mousemove(e);
    else if (is.isPencil) pencilHandler.mousemove(e);
    else if (is.isEraser) eraserHandler.mousemove(e);
    else if (is.isText) textHandler.mousemove(e);
});



var keyCode;



function onkeydown(e) {
    keyCode = e.keyCode;

    if (!isControlKeyPressed && keyCode === 17) {
        isControlKeyPressed = true;
    }
}

addEvent(document, 'keydown', onkeydown);



function onkeyup(e) {
    keyCode = e.keyCode;

    /*-------------------------- Ctrl + Z --------------------------*/
    
    if (isControlKeyPressed && keyCode === 90) {
        if (points.length) {
            points.length = points.length - 1;
            drawHelper.redraw();
        }
    }

    /*-------------------------- Ctrl + A --------------------------*/

    if (isControlKeyPressed && keyCode === 65) {
        dragHelper.global.startingIndex = 0;

        endLastPath();
        
        setSelection(find('drag-all-paths'), 'DragAllPaths');
    }

    /*-------------------------- Ctrl + C --------------------------*/
    
    if (isControlKeyPressed && keyCode === 67 && points.length) {
        copy();
    }

    /*-------------------------- Ctrl + V --------------------------*/
    if (isControlKeyPressed && keyCode === 86 && copiedStuff.length) {
        paste();
    }

    /*-------------------------- Ending the Control Key --------------------------*/
    
    if (keyCode === 17) {
        isControlKeyPressed = false;
    }
}

addEvent(document, 'keyup', onkeyup);


var lastPoint = [];

window.addEventListener('message', function(event) {

    console.log(" window message" , event);

    if (!event.data || !event.data.canvasDesignerSyncData) return;

    if (event.data.sender && event.data.sender == selfId) return;

    // drawing is shared here (array of points)
    points = event.data.canvasDesignerSyncData;

    // to support two-way sharing
    if (!lastPoint.length) {
        lastPoint = points.join('');
    }
    drawHelper.redraw(true);
}, false);

function syncPoints() {

    if (!lastPoint.length) {
        lastPoint = points.join('');
    }
    
    if (points.join('') != lastPoint) {
        syncData(points || []);
        lastPoint = points.join('');
    }
}

function syncData(data) {
    parent.postMessage({
        canvasDesignerSyncData: data,
        sender: selfId
    }, '*');
}


// parent post message is wokring 
// test this by 
// window.frames[0].parent.postMessage("hi", '*')