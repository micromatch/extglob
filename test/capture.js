'use strict';

var capture = require('../').capture;
var assert = require('assert');

describe('.capture()', function() {
  it('should return null if no match', function() {
    assert.equal(capture('test/(a|b)', 'hi/123'), null);
  });

  it('should capture paren groups', function() {
    assert.deepEqual(capture('test/(a|b)/x.js', 'test/a/x.js'), ['a']);
    assert.deepEqual(capture('test/(a|b)/x.js', 'test/b/x.js'), ['b']);
  });

  it('should capture star groups', function() {
    assert.deepEqual(capture('test/a*(a|b)/x.js', 'test/a/x.js'), ['']);
    assert.deepEqual(capture('test/a*(a|b)/x.js', 'test/aa/x.js'), ['a']);
    assert.deepEqual(capture('test/a*(a|b)/x.js', 'test/ab/x.js'), ['b']);
    assert.deepEqual(capture('test/a*(a|b)/x.js', 'test/aba/x.js'), ['ba']);
  });

  it('should capture plus groups', function() {
    assert.deepEqual(capture('test/+(a|b)/x.js', 'test/a/x.js'), ['a']);
    assert.deepEqual(capture('test/+(a|b)/x.js', 'test/b/x.js'), ['b']);
    assert.deepEqual(capture('test/+(a|b)/x.js', 'test/ab/x.js'), ['ab']);
    assert.deepEqual(capture('test/+(a|b)/x.js', 'test/aba/x.js'), ['aba']);
  });

  it('should capture optional groups', function() {
    assert.deepEqual(capture('test/a?(a|b)/x.js', 'test/a/x.js'), ['']);
    assert.deepEqual(capture('test/a?(a|b)/x.js', 'test/ab/x.js'), ['b']);
    assert.deepEqual(capture('test/a?(a|b)/x.js', 'test/aa/x.js'), ['a']);
  });

  it('should capture @ groups', function() {
    assert.deepEqual(capture('test/@(a|b)/x.js', 'test/a/x.js'), ['a']);
    assert.deepEqual(capture('test/@(a|b)/x.js', 'test/b/x.js'), ['b']);
  });

  it('should capture negated groups', function() {
    assert.deepEqual(capture('test/!(a|b)/x.js', 'test/x/x.js'), ['x']);
    assert.deepEqual(capture('test/!(a|b)/x.js', 'test/y/x.js'), ['y']);
  });
});
