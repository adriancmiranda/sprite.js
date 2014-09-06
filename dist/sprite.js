/**
 * Sprite
 * @description Sprite is a small JavaScript library for simple but powerful sprite based animations.
 * @version v0.0.2
 * @author Adrian C. Miranda
 * @link https://github.com/adriancmiranda/sprite.js
 * @license MIT
 */
(function (window, document, AM, undefined) {
    //| .-------------------------------------------------------------------.
    //| | NAMING CONVENTIONS:                                               |
    //| |-------------------------------------------------------------------|
    //| | Singleton-literals and prototype objects      | PascalCase        |
    //| |-------------------------------------------------------------------|
    //| | Functions and public variables                | camelCase         |
    //| |-------------------------------------------------------------------|
    //| | Global variables and constants                | UPPERCASE         |
    //| |-------------------------------------------------------------------|
    //| | Private variables                             | _underscorePrefix |
    //| '-------------------------------------------------------------------'
    //|
    //| Comment syntax for the entire project follows JSDoc:
    //| @see http://code.google.com/p/jsdoc-toolkit/wiki/TagReference
    //'
    'use strict';
    (function () {
        var i, lastTime, vendors, rAF, cAF, cRF;
        lastTime = 0;
        vendors = ['ms', 'moz', 'webkit', 'o'];
        for (i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
            rAF = vendors[i] + 'RequestAnimationFrame';
            cAF = vendors[i] + 'CancelAnimationFrame';
            cRF = vendors[i] + 'CancelRequestAnimationFrame';
            window.requestAnimationFrame = window[rAF];
            window.cancelAnimationFrame = window[cAF] || window[cRF];
        }
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback, element) {
                var currTime, timeToCall, id;
                currTime = new Date().getTime();
                timeToCall = Math.max(0, 16 - (currTime - lastTime));
                id = window.setTimeout(function () {
                    callback(currTime + timeToCall, element);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                window.clearTimeout(id);
            };
        }
    }());
    function getDefinitionName(value, strict) {
        if (value === false) {
            return 'Boolean';
        }
        if (value === '') {
            return 'String';
        }
        if (value === 0) {
            return 'Number';
        }
        if (value && value.constructor) {
            var name = (value.constructor.toString() || Object.prototype.toString.apply(value)).replace(/^.*function([^\s]*|[^\(]*)\([^\x00]+$/, '$1').replace(/^(\[object\s)|]$/g, '').replace(/\s+/, '') || 'Object';
            if (strict !== true) {
                if (!/^(Boolean|RegExp|Number|String|Array|Date)$/.test(name)) {
                    return 'Object';
                }
            }
            return name;
        }
        return value;
    }
    function typeOf(value, strict) {
        var type = typeof value;
        if (value === false) {
            return 'boolean';
        }
        if (value === '') {
            return 'string';
        }
        if (value && type === 'object') {
            type = getDefinitionName(value, strict);
            type = String(type).toLowerCase();
        }
        if (type === 'number' && !window.isNaN(value) && window.isFinite(value)) {
            if (strict === true && window.parseFloat(value) === window.parseInt(value, 10)) {
                return value < 0 ? 'int' : 'uint';
            }
            return 'number';
        }
        return value ? type : value;
    }
    function num(value, ceiling) {
        value = window.parseFloat(value);
        value = window.isNaN(value) || !window.isFinite(value) ? 0 : value;
        if (ceiling === true) {
            value = window.parseInt(value * 10000, 10) / 10000;
        }
        return value;
    }
    function bool(value) {
        if (typeOf(value) === 'string') {
            return /^(true|(^[1-9][0-9]*$)$|yes|y|sim|s|on)$/gi.test(value);
        }
        return !!value;
    }
    function int(value) {
        return 0 | window.parseInt(value, 10);
    }
    function uint(value) {
        value = int(value);
        return value < 0 ? 0 : value;
    }
    function data(element, key, value) {
        if (!typeOf(element)) {
            return null;
        }
        if (!typeOf(value)) {
            return element.getAttribute('data-' + key);
        }
        element.setAttribute('data-' + key, value);
    }
    function merge(defaults, options, element) {
        var option, output = {};
        options = typeOf(options) === 'object' ? options : {};
        for (option in defaults) {
            var dataset = data(element, option);
            if (options.hasOwnProperty(option) || dataset) {
                output[option] = options[option] || dataset;
            } else {
                output[option] = defaults[option];
            }
        }
        return output;
    }
    function gridLayout(length, columns, width, height, marginX, marginY, vertical) {
        var id, row, column, offsetX, offsetY, positions = [];
        for (id = 0; id < length; id++) {
            column = vertical ? ~~(id / columns) : id % columns;
            row = vertical ? id % columns : ~~(id / columns);
            offsetX = Math.round(width + marginX) * column;
            offsetY = Math.round(height + marginY) * row;
            positions.push({
                column: column,
                row: row,
                x: 0 - offsetX,
                y: 0 - offsetY,
                frame: id,
                label: ''
            });
        }
        return positions;
    }
    function getStyle(element, property) {
        if (window.getComputedStyle) {
            return window.getComputedStyle(element, null)[property];
        }
        return element.currentStyle[property];
    }
    function getBackgroundOffsetFrom(element) {
        var position = (getStyle(element, 'backgroundPosition') || getStyle(element, 'backgroundPositionX') + ' ' + getStyle(element, 'backgroundPositionY')).replace(/left|top/gi, 0).split(' ');
        return {
            x: int(position[0]),
            y: int(position[1])
        };
    }
    function getBackgroundImageFrom(element) {
        var url = getStyle(element, 'backgroundImage') || '';
        return url.replace(/url\(|\)|"|'/g, '');
    }
    function getBackgroundSizeFrom(element) {
        var backgroundSize, pxRE, pcRE, size;
        backgroundSize = (getStyle(element, 'backgroundSize') || '').split(' ');
        pxRE = /^(0|[0-9]+.?[0-9]+?px)$/;
        pcRE = /^(0|[0-9]+.?[0-9]+?\%)$/;
        size = {
            x: 1,
            y: 1
        };
        if (pxRE.test(backgroundSize[0])) {
            size.x = parseInt(backgroundSize[0]);
            size.y = parseInt(backgroundSize[0]);
        }
        if (pcRE.test(backgroundSize[0])) {
            size.x = parseFloat(backgroundSize[0]) / 100 || 1;
            size.y = parseFloat(backgroundSize[0]) / 100 || 1;
        }
        if (pxRE.test(backgroundSize[1])) {
            size.y = parseInt(backgroundSize[1]);
        }
        if (pcRE.test(backgroundSize[1])) {
            size.y = parseFloat(backgroundSize[1]) / 100 || 1;
        }
        return size;
    }
    function bound(value, min, max) {
        value = num(value);
        min = num(min);
        max = num(max);
        return value > max ? max : value < min ? min : value;
    }
    function mod(value, min, max) {
        value = num(value);
        min = num(min);
        max = num(max);
        value = value % max;
        return num(value < min ? value + max : value);
    }
    // Externalize
    AM.Utils = AM.Utils || {};
    AM.Utils.getDefinitionName = getDefinitionName;
    AM.Utils.typeOf = typeOf;
    AM.Utils.num = num;
    AM.Utils.bool = bool;
    AM.Utils.int = int;
    AM.Utils.uint = uint;
    AM.Utils.data = data;
    AM.Utils.merge = merge;
    AM.Utils.gridLayout = gridLayout;
    AM.Utils.getStyle = getStyle;
    AM.Utils.getBackgroundOffsetFrom = getBackgroundOffsetFrom;
    AM.Utils.getBackgroundImageFrom = getBackgroundImageFrom;
    AM.Utils.getBackgroundSizeFrom = getBackgroundSizeFrom;
    AM.Utils.bound = bound;
    AM.Utils.mod = mod;
    AM.Sprite = function (element, options) {
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //|
        //| Private properties
        //| only priveleged methods may view/edit/invoke
        //|
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        var $this = this, $static = $this.constructor.static, _bgPoint = getBackgroundOffsetFrom(element), _bgUrl = getBackgroundImageFrom(element), _bgSize = getBackgroundSizeFrom(element), _fromToTimeout = 0, _delayTimeout = 0, _factor = 1, _requestID = null, _vars = {};
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //|
        //| Public properties - Anyone may read/write
        //|
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        $this.id = $static.instances++;
        $this.element = element;
        $this.image = {
            url: _bgUrl,
            size: _bgSize,
            object: new Image(),
            x: _bgPoint.x,
            y: _bgPoint.y
        };
        $this.options = merge($static.defaults, options, $this.element);
        $this.responsive = bool($this.options.responsive);
        $this.fps = num($this.options.fps);
        $this.totalFrames = Math.max(1, uint($this.options.totalFrames));
        $this.columns = uint($this.options.columns);
        $this.rows = uint($this.options.rows);
        if ($this.totalFrames === 1) {
            $this.totalFrames = $this.columns * $this.rows;
        }
        $this.currentFrame = bound($this.options.currentFrame, 1, $this.totalFrames);
        $this.vertical = bool($this.options.vertical);
        $this.tileW = num($this.options.tileW) || $this.element.clientWidth;
        $this.tileH = num($this.options.tileH) || $this.element.clientHeight;
        $this.column = num($this.currentFrame % $this.rows);
        $this.row = ~~($this.currentFrame / $this.columns);
        $this.timeline = gridLayout($this.totalFrames, $this.vertical ? $this.rows : $this.columns, $this.tileW, $this.tileH, 0, 0, $this.vertical);
        $this.duration = $this.totalFrames / $this.fps;
        $this.lastFrame = $this.currentFrame;
        $this.targetNextFrame = 0;
        $this.targetFrame = 0;
        $this.offsetX = _bgPoint.x;
        $this.offsetY = _bgPoint.y;
        $this.reverse = false;
        $this.running = false;
        $this.looping = false;
        $this.yoyo = false;
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //|
        //| Privileged methods:
        //| may be invoked publicly and may access private items
        //| may not be changed; may be replaced with public flavors
        //|
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        $this.load = function (vars) {
            vars = typeOf(vars) === 'object' ? vars : {};
            $this.image.object.src = $this.image.url;
            $this.image.object.onload = function () {
                $this.image.width = $this.image.object.width;
                $this.image.height = $this.image.object.height;
                if (typeof vars.onLoad === 'function') {
                    vars.onLoad.apply($this, vars.onLoadParams);
                }
            };
        };
        $this.refresh = function () {
            $this.tileW = num($this.options.tileW) || $this.element.clientWidth;
            $this.tileH = num($this.options.tileH) || $this.element.clientHeight;
            $this.timeline = gridLayout($this.totalFrames, $this.vertical ? $this.rows : $this.columns, $this.tileW, $this.tileH, 0, 0, $this.vertical);
            drawFrame($this.currentFrame);
        };
        $this.play = function (frame, vars) {
            $this.pause();
            if (typeOf(frame, true) === 'uint') {
                _vars = typeOf(vars) === 'object' ? vars : {};
                $this.targetFrame = bound(frame, 1, $this.totalFrames);
                $this.reverse = $this.currentFrame > $this.targetFrame;
                _factor = $this.reverse ? -1 : 1;
            } else {
                $this.targetFrame = 0;
            }
            if (typeof _vars.onInit === 'function') {
                _vars.onInit.apply($this, _vars.onInitParams);
            }
            addDelay(num(_vars.delay));
        };
        $this.pause = function () {
            removeDelay();
            clearAnimation(_requestID);
            _requestID = null;
        };
        $this.togglePause = function () {
            $this[_requestID ? 'pause' : 'play']();
        };
        $this.stop = function () {
            removeDelay();
            drawFrame(0);
            $this.pause();
        };
        $this.playToBeginAndStop = function (vars) {
            $this.play(0, vars);
        };
        $this.playToEndAndStop = function (vars) {
            $this.play($this.totalFrames, vars);
        };
        $this.gotoRandomFrame = function () {
            $this.gotoAndStop(~~(Math.random() * $this.totalFrames) + 1);
        };
        $this.fromTo = function (from, to, vars) {
            vars = typeOf(vars) === 'object' ? vars : {};
            window.clearTimeout(_fromToTimeout);
            _fromToTimeout = 0;
            _fromToTimeout = window.setTimeout(function () {
                delete vars.delay;
                $this.gotoAndStop(from);
                $this.play(to, vars);
            }, num(vars.delay));
        };
        $this.gotoAndPlay = function (frame) {
            removeDelay();
            drawFrame(frame);
            $this.play();
        };
        $this.gotoAndStop = function (frame) {
            removeDelay();
            drawFrame(frame);
            $this.pause();
        };
        $this.nextFrame = function () {
            $this.jumpFrames(0 + 1);
        };
        $this.prevFrame = function () {
            $this.jumpFrames(0 - 1);
        };
        $this.jumpFrames = function (amount) {
            $this.gotoAndStop($this.currentFrame + int(amount));
        };
        $this.loopBetween = function (from, to, yoyo, vars) {
            from = bound(from, 1, $this.totalFrames);
            to = bound(to, 0, $this.totalFrames);
            $this.gotoAndStop(from);
            $this.running = true;
            $this.looping = true;
            $this.yoyo = bool(yoyo);
            $this.targetNextFrame = from;
            if (to === 0) {
                to = $this.totalFrames;
            }
            $this.play(to, vars);
        };
        $this.cancelLooping = function () {
            $this.running = false;
            $this.looping = false;
            $this.yoyo = false;
        };
        $this.toString = function () {
            return 'AM[Sprite ' + $this.id + ']';
        };
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //|
        //| Private functions
        //| only priveleged methods may view/edit/invoke
        //|
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        function addDelay(delay) {
            removeDelay();
            _delayTimeout = window.setTimeout(function () {
                _requestID = setAnimation(onUpdateFrames, $this.element, $this.fps);
                if (typeof _vars.onStart === 'function') {
                    _vars.onStart.apply($this, _vars.onStartParams);
                }
                $this.running = true;
            }, delay);
        }
        function removeDelay() {
            window.clearTimeout(_delayTimeout);
            $this.running = false;
            _delayTimeout = 0;
        }
        function setAnimation(callback, element, fps) {
            var params, id;
            if (typeOf(callback) !== 'function') {
                return;
            }
            if (typeOf(element) === 'number') {
                fps = element;
                element = null;
            }
            id = ++$static.animationID;
            fps = 1000 / bound(fps || 10, 1, 60);
            $static.animations[id] = {
                timeout: 0,
                rAF: 0
            };
            params = Array.prototype.slice.call(arguments, 0);
            params.splice(0, 3);
            (function run() {
                $static.animations[id].timeout = window.setTimeout(function () {
                    $static.animations[id].rAF = window.requestAnimationFrame(run, element);
                    callback.apply(null, params);
                }, fps);
            }());
            return id;
        }
        function clearAnimation(id) {
            if (typeOf($static.animations[id])) {
                window.clearTimeout($static.animations[id].timeout);
                window.cancelAnimationFrame($static.animations[id].rAF);
                delete $static.animations[id];
            }
        }
        function drawFrame(frame) {
            $this.lastFrame = $this.currentFrame;
            $this.currentFrame = mod(uint(frame), 1, $this.totalFrames);
            $this.row = $this.timeline[$this.currentFrame - 1].row;
            $this.column = $this.timeline[$this.currentFrame - 1].column;
            $this.offsetX = $this.timeline[$this.currentFrame - 1].x + $this.image.x;
            $this.offsetY = $this.timeline[$this.currentFrame - 1].y + $this.image.y;
            $this.element.style.backgroundPosition = $this.offsetX + 'px ' + $this.offsetY + 'px';
        }
        function onUpdateFrames() {
            if (typeof _vars.onUpdate === 'function') {
                _vars.onUpdate.apply($this, _vars.onUpdateParams);
            }
            if ($this.currentFrame < $this.targetFrame) {
                drawFrame($this.currentFrame + _factor);
            } else if ($this.currentFrame > $this.targetFrame) {
                drawFrame($this.currentFrame + _factor);
            } else if ($this.currentFrame === $this.targetFrame) {
                if ($this.looping) {
                    if ($this.yoyo) {
                        $this.loopBetween($this.currentFrame, $this.targetNextFrame, $this.yoyo, _vars);
                    } else {
                        $this.loopBetween($this.targetNextFrame, $this.currentFrame, $this.yoyo, _vars);
                    }
                } else {
                    $this.pause();
                    if (typeof _vars.onComplete === 'function') {
                        _vars.onComplete.apply($this, _vars.onCompleteParams);
                    }
                }
            }
        }
    };
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //
    // Static - Anyone may read/write
    //
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    AM.Sprite.static = {
        instances: 0,
        animationID: 0,
        animations: {},
        defaults: {
            responsive: false,
            fps: 24,
            totalFrames: 1,
            currentFrame: 1,
            vertical: false,
            tileW: 0,
            tileH: 0,
            columns: 0,
            rows: 0
        }
    };
    // FIX: By far the worst solution, but for now resolved
    AM.cacheResizer = window.onresize;
    window.onresize = function () {
        for (var id = 0; id < AM.Sprite.static.instanceList.length; id++) {
            if (AM.Sprite.static.instanceList[id].responsive) {
                AM.Sprite.static.instanceList[id].refresh();
            }
        }
        if (AM.cacheResizer) {
            AM.cacheResizer();
        }
    };
}(this, this.document, this.AM = this.AM || {}));