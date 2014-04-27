'use strict';

var assert = chai.assert,
    expect = chai.expect,
    should = chai.should();

describe('AM.Sprite', function () {
    describe('constructor', function () {
        it('should have a default element', function() {
            var sprite = new AM.Sprite(null, {});
            expect(sprite.element).to.equal(null);
        });
        it('should have a basic options', function() {
            var sprite = new AM.Sprite(null);
            expect(sprite.options).to.equal({});
        });
    });
});
