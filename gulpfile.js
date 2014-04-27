(function (gulp, gulpLoadPlugins, pkg) {
	'use strict';
	//|**
	//|
	//| Gulpfile
	//|
	//| This file is the streaming build system
	//|
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
	//| - http://code.google.com/p/jsdoc-toolkit/wiki/TagReference
	//|
	//| For performance reasons we're only matching one level down:
	//| - 'test/spec/{,*/}*.js'
	//|
	//| Use this if you want to recursively match all subfolders:
	//| - 'test/spec/**/*.js'
	//|
	//'*/
	var $ = gulpLoadPlugins({ pattern: '*', lazy: false }),
		_ = { dist: './dist', test: './test' },
		source = require('./.amrc').source,
		module = 'sprite',
		inline = '// <%= pkg.name %>@v<%= pkg.version %>, <%= pkg.license[0].type %> licensed. <%= pkg.homepage %>\n',
		extended = [
		'/**',
		' * <%= pkg.title %>',
		' * @description <%= pkg.description %>',
		' * @version v<%= pkg.version %>',
		' * @author <%= pkg.author.name %>',
		' * @link <%= pkg.homepage %>',
		' * @license <%= pkg.license[0].type %>',
		' */\n'
	].join('\n');

	//|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//| ✓ validate
	//'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	gulp.task('jsonlint', function() {
		var stream = gulp.src([
			'package.json',
			'bower.json',
			'.bowerrc',
			'.jshintrc',
			'.jscs.json'
		])
		.pipe($.plumber())
		.pipe($.jsonlint())
		.pipe($.jsonlint.reporter())
		.pipe($.notify({
			message: '<%= options.date %> ✓ jsonlint: <%= file.relative %>',
			templateOptions: {
				date: new Date()
			}
		}));
		return stream;
	});

	gulp.task('jshint', function () {
		var stream = gulp.src(wrap(source[module].files, source[module].name))
		.pipe($.plumber())
		.pipe($.notify({
			message: '<%= options.date %> ✓ jshint: <%= file.relative %>',
			templateOptions: {
				date: new Date()
			}
		}))
		.pipe($.concat(source[module].name + '.js'))
		.pipe($.removeUseStrict())
		.pipe($.jshint('.jshintrc'))
		.pipe($.jshint.reporter('default'))
		.pipe($.jscs());
		return stream;
	});

	gulp.task('mocha', function () {
		var stream = gulp.src(_.test + '/**/*.js')
		.pipe($.plumber())
		.pipe($.mocha({ reporter: 'list' }));
		return stream;
	});

	//|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//| ✓ compress
	//'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	gulp.task('src', ['validate'], function () {
		var stream = gulp.src(wrap(source[module].files, source[module].name))
		.pipe($.plumber())
		.pipe($.notify({
			message: '<%= options.date %> ✓ src: <%= file.relative %>',
			templateOptions: {
				date: new Date()
			}
		}))
		.pipe($.concat(source[module].name + '.js'))
		.pipe($.removeUseStrict())
		.pipe($.header(extended, { pkg: pkg }))
		.pipe($.size())
		.pipe(gulp.dest(_.dist));
		return stream;
	});

	gulp.task('min', ['src'], function () {
		var min = gulp.src(_.dist + '/' + source[module].name + '.js')
		.pipe($.plumber())
		.pipe($.notify({
			message: '<%= options.date %> ✓ min: <%= file.relative %>',
			templateOptions: {
				date: new Date()
			}
		}))
		.pipe($.rename(source[module].name + '.min.js'))
		.pipe($.uglify())
		.pipe($.header(inline, { pkg: pkg }))
		.pipe($.size())
		.pipe(gulp.dest(_.dist));
		return min;
	});

	//|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//| ✓ versioning
	//'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	gulp.task('bump', function () {
		var bumpType = process.env.BUMP || 'patch';
		var stream = gulp.src(['package.json', 'bower.json'])
		.pipe($.bump({ type: bumpType }))
		.pipe(gulp.dest('./'));
		return stream;
	});

	gulp.task('tag', ['bump', 'min'], function () {
		var version = 'v' + pkg.version;
		var message = 'Release ' + version;
		var stream = gulp.src('./')
		.pipe($.git.commit(message))
		.pipe($.git.tag(version, message))
		.pipe($.git.push('origin', 'master', '--tags'))
		.pipe($.gulp.dest('./'));
		return stream;
	});

	gulp.task('npm', ['tag'], function (done) {
		var process = require('child_process')
		.spawn('npm', ['publish'], { stdio: 'inherit' })
		.on('close', done);
	});

	//|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//| ✓ default
	//'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	gulp.task('clean', function () {
		var stream = gulp.src(_.dist, { read: false })
		.pipe($.plumber())
		.pipe($.clean());
		return stream;
	});

	gulp.task('default', function() {
		gulp.start('min');
	});

	//|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//| ✓ shortcuts
	//'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	gulp.task('validate', ['jsonlint', 'jshint']);
	gulp.task('release', ['npm']);
	gulp.task('test', ['mocha']);
	gulp.task('ci', ['min']);

	//|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//| ✓ utils
	//'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	function wrap(src) {
		src.unshift('source/AM.prefix');
		src.push('source/AM.suffix');
		return src;
	}

}(require('gulp'), require('gulp-load-plugins'), require('./package.json')));
