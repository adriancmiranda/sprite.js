'use strict';

AM.Sprite = function (element, options) {

	//|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//|
	//| Private properties
	//| only priveleged methods may view/edit/invoke
	//|
	//|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	var $this = this,
		$static = $this.constructor.static,
		_bgPoint = getBackgroundOffsetFrom(element),
		_bgUrl = getBackgroundImageFrom(element),
		_bgSize = getBackgroundSizeFrom(element),
		_fromToTimeout = 0,
		_delayTimeout = 0,
		_factor = 1,
		_requestID = null,
		_vars = {};

	//|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//|
	//| Public properties - Anyone may read/write
	//|
	//|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	$this.id = ($static.instances++);
	$this.element = element;
	$this.image = { url: _bgUrl, size: _bgSize, object: new Image(), x: _bgPoint.x, y: _bgPoint.y };
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
	$this.tileW = (num($this.options.tileW) || $this.element.clientWidth);
	$this.tileH = (num($this.options.tileH) || $this.element.clientHeight);
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
		// N/A yet.
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
		$static.animations[id] = { timeout:0, rAF:0 };
		params = Array.prototype.slice.call(arguments, 0);
		params.splice(0, 3);
		(function run() {
			$static.animations[id].timeout = window.setTimeout(function() {
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
