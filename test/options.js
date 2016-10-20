'use strict';

var assert = require('assert');
var matcher = require('./support/match');
var extglob = require('..');

describe('options', function() {
  describe('options.nonull', function() {
    it('should return the pattern when no matches are found', function() {
      matcher.match(['ax'], 'a?(b*)', []);
      matcher.match(['ax'], 'a?(b*)', ['a?(b*)'], {nonull: true});
      matcher.match(['az'], 'a?(b*)', ['a?(b*)'], {nonull: true});
      matcher.match(['ag'], 'a?(b*)', ['a?(b*)'], {nonull: true});
    });
  });

  describe('options.failglob', function() {
    it('should throw an error when no matches are found', function(cb) {
      try {
        extglob.match(['ax'], 'a?(b*)', {failglob: true});
        return cb(new Error('expected an error'));
      } catch (err) {
        assert(/no matches/.test(err.message));
      }
      cb();
    });
  });

  describe('options.strict', function() {
    it('should throw an error when an opening brace is missing', function(cb) {
      assert(!extglob.isMatch('foo', 'a)'));
      try {
        assert(!extglob.isMatch('foo', 'a)', {strict: true}));
        return cb(new Error('expected an error'));
      } catch (err) {
        assert(/missing/.test(err.message));
      }
      cb();
    });
  });
});
