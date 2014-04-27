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