'use strict';

require('mocha');
var util = require('util');
var argv = require('minimist')(process.argv.slice(2));
var assert = require('assert');
var forOwn = require('for-own');
var minimatch = require('./minimatch');
var extglob = require('..');
var isMatch = extglob.isMatch;

if (argv.mm) {
  isMatch = require('minimatch');
}

describe('running extglob against minimatch tests', function() {
  describe('extglobs', function() {
    describe('negations', function() {
      var negations = minimatch.negations;
      forOwn(negations.cases, function(val, str) {
        describe('"' + str + '"', function() {
          var i = 0;
          forOwn(val, function(expected, pattern) {
            var exp = expected === false ? ' not' : '';
            it((i++) + ' "' + pattern + '" should' + exp + ' match', function() {
              var actual = isMatch(str, pattern, negations.options);
              assert.equal(actual, expected);
            });
          });
        });
      });
    });
  });
});
