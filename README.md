![sprite.js](http://i.imgur.com/CEEbHaw.gif)

> __sprite.js__ is a small JavaScript library for simple but powerful sprite based animations.
It takes an element, and changes the background position to create an animation effect.

[![build status][travis_build_status_image]][travis_build_status_url] [![dependencies status][david_dependencies_status_image]][david_dependencies_status_url] [![devDependency status][david_devdependencies_status_image]][david_devdependencies_status_url]

<!-- travis -->
[travis_build_status_image]: https://travis-ci.org/adriancmiranda/sprite.js.png?branch=master
[travis_build_status_url]: https://travis-ci.org/adriancmiranda/sprite.js "build status"

<!-- david dependencies -->
[david_dependencies_status_image]: https://david-dm.org/adriancmiranda/sprite.js.png?theme=shields.io
[david_dependencies_status_url]: https://david-dm.org/adriancmiranda/sprite.js "dependencies status"

<!-- david devDependencies -->
[david_devdependencies_status_image]: https://david-dm.org/adriancmiranda/sprite.js/dev-status.png?theme=shields.io
[david_devdependencies_status_url]: https://david-dm.org/adriancmiranda/sprite.js#info=devDependencies "devDependencies status"

## Performance

__sprite.js__ is chained to the _`requestAnimationFrame`_ (with a polyfill for older browsers) and optimized for speed and garbage collection. What __sprite.js__ does, cannot be done faster.
That being said, animating the element background is not the fastest possible way how to do this kind of animations (canvas solutions are faster), but it is sure as hell the most simple one, and compatible with everything from IE6 and up.

## Dependencies

__sprite.js__ has no dependencies.

## Compatibility

Works everywhere.

## Documentation

Documentation is centralized in the _[gh-page](http://adriancmiranda.github.io/sprite.js)_, which makes it way easier to maintain and keep always up to date. _Only available in Portuguese yet, but there is an of examples collection available [here](https://github.com/adriancmiranda/sprite.js/tree/master/examples)._

## How to install __sprite.js__ in your project

```bash
bower install --save-dev sprite=adriancmiranda/sprite.js
```

## How to build your own __sprite.js__

Clone a copy of the main __sprite.js__ git repo by running:

```bash
git clone git@github.com:adriancmiranda/sprite.js.git && cd sprite.js
```

Run the build script:

```bash
npm run build
```

The built version of __sprite.js__ will be put in the `dist/` subdirectory, along with the minified copy and associated map file.

## License
[MIT](https://github.com/adriancmiranda/generator-gulp-requirejs/blob/master/LICENSE "MIT LICENSE")
