'use strict';

require('mocha');
var assert = require('assert');
var forOwn = require('for-own');
var matcher = require('./support/matcher');
var negations = require('./_negations');

describe('running extglob against minimatch tests', function() {
  forOwn(negations, function(val, fixture) {
    if (fixture !== 'asd.jss.xyz') return;
    describe('"' + fixture + '"', function() {
      forOwn(val, function(expected, pattern) {
        var exp = expected === false ? ' not' : '';

        it('should' + exp + ' match "' + pattern + '"', function() {
          var actual = matcher.isMatch(fixture, pattern);
          if (actual === null) return;
          assert.equal(actual, expected, fixture + ' => ' + pattern);
        });
      });
    });
  });
});
