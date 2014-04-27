if (exports) {
	/**
	 * Source files
	 */
	var am = exports.source = {
		sprite: {
			'name': 'sprite',
			'files': [
				'source/helpers/Polyfills.js',
				'source/helpers/Utils.js',
				'source/display/Sprite.js'
			]
		}
	};

	/**
	 * @usage am.mergeFilesFor('karma');
	 * @return Array
	 */
	exports.mergeFilesFor = function() {
		var files = [];
		Array.prototype.slice.call(arguments, 0).forEach(function(filegroup) {
			am[filegroup].forEach(function(file) {
				// replace @ref
				var match = file.match(/^\@(.*)/);
				if (match) {
					files = files.concat(am[match[1]]);
				} else {
					files.push(file);
				}
			});
		});
		return files;
	};
}
