'use strict';

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
		column = (vertical ? ~~(id / columns) : (id % columns));
		row = (vertical ? (id % columns) : ~~(id / columns));
		offsetX = (Math.round(width + marginX) * column);
		offsetY = (Math.round(height + marginY) * row);
		positions.push({
			column: column,
			row: row,
			x: (0 - offsetX),
			y: (0 - offsetY),
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
	var position = (
		getStyle(element, 'backgroundPosition') ||
		getStyle(element, 'backgroundPositionX') + ' ' + getStyle(element, 'backgroundPositionY')
	).replace(/left|top/gi, 0).split(' ');
	return { x: int(position[0]), y: int(position[1]) };
}

function getBackgroundImageFrom(element) {
	var url = (getStyle(element, 'backgroundImage') || '');
	return url.replace(/url\(|\)|"|'/g, '');
}

function getBackgroundSizeFrom(element) {
	var backgroundSize, pxRE, pcRE, size = { x:1, y:1 };
	backgroundSize = (getStyle(element, 'backgroundSize') || '').split(' ');
	pxRE = /^(0|[0-9]+.?[0-9]+?px)$/;
	pcRE = /^(0|[0-9]+.?[0-9]+?\%)$/;
	if (pxRE.test(backgroundSize[0])) {
		size.x = parseInt(backgroundSize[0]);
		size.y = parseInt(backgroundSize[0]);
	}
	if (pcRE.test(backgroundSize[0])) {
		size.x = (parseFloat(backgroundSize[0]) / 100) || 1;
		size.y = (parseFloat(backgroundSize[0]) / 100) || 1;
	}
	if (pxRE.test(backgroundSize[1])) {
		size.y = parseInt(backgroundSize[1]);
	}
	if (pcRE.test(backgroundSize[1])) {
		size.y = (parseFloat(backgroundSize[1]) / 100) || 1;
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
