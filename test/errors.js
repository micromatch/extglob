'use strict';

var assert = require('assert');
var extglob = require('..');

describe('errors', function() {
  it('should throw an error when extglob() receives an invalid pattern', function(cb) {
    try {
      assert(extglob());
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected pattern to be a string');
    }
    cb();
  });

  it('should throw an error when extglob.isMatch() receives an invalid pattern', function(cb) {
    try {
      assert(extglob.isMatch());
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected pattern to be a string');
    }
    cb();
  });

  it('should throw an error when extglob.makeRe() receives an invalid pattern', function(cb) {
    try {
      assert(extglob.makeRe());
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected pattern to be a string');
    }
    cb();
  });

  it('should throw an error when extglob.create() receives an invalid pattern', function(cb) {
    try {
      assert(extglob.create());
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected pattern to be a string');
    }
    cb();
  });

  it('should throw an error when extglob.isMatch() receives an invalid string', function(cb) {
    try {
      assert(extglob.isMatch(null, '*'));
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected a string');
    }
    cb();
  });

  it('should throw an error when extglob.match() receives an invalid pattern', function(cb) {
    try {
      assert(extglob.match());
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected pattern to be a string');
    }
    cb();
  });
});
