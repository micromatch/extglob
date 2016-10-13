'use strict';

require('mocha');
var argv = require('yargs-parser')(process.argv.slice(2));
var assert = require('assert');
var forOwn = require('for-own');
var reference = require('./reference/');
var bash = require('./support/bash');
var extglob = require('..');
var isMatch = extglob.isMatch;

if (argv.mm) {
  isMatch = require('minimatch');
}

describe('running extglob against minimatch tests', function() {
  describe('extglobs', function() {
    describe('negations', function() {
      var negations = reference.negations;
      forOwn(negations.cases, function(val, fixture) {
        // if (fixture !== 'foo.js.js') return;
        describe('"' + fixture + '"', function() {
          var i = 0;

          forOwn(val, function(expected, pattern) {

            var exp = expected === false ? ' not' : '';
            it((i++) + 'should' + exp + ' match "' + pattern + '"', function() {
              var actual = isMatch(fixture, pattern, negations.options);
              try {
                if (argv.bash && bash.isMatch(fixture, pattern) !== expected) {
                  console.log(fixture, pattern);
                }
              } catch (err) {}
              assert.equal(actual, expected, pattern);
            });
          });
        });
      });
    });
  });
});
