'use strict';

require('mocha');
var match = require('./support/match');
var assert = require('assert');

// ported from http://www.bashcookbook.com/bashinfo/source/bash-4.3/tests/extglob1a.sub
describe('bash extglob1a tests', function() {
  var startLine = 11;
  var tests = [
    ['a', 'a*!(x)', true],
    ['ab', 'a*!(x)', true],
    ['ba', 'a*!(x)', false],
    ['ax', 'a*!(x)', true],
    ['a', 'a!(x)', true],
    ['ab', 'a!(x)', true],
    ['ba', 'a!(x)', false],
    ['ax', 'a!(x)', false],
    ['a', 'a*?(x)', true],
    ['ab', 'a*?(x)', true],
    ['ba', 'a*?(x)', false],
    ['ax', 'a*?(x)', true],
    ['a', 'a?(x)', true],
    ['ab', 'a?(x)', false],
    ['ba', 'a?(x)', false],
    ['ax', 'a?(x)', true]
  ];

  tests.forEach(function(test, i) {
    if (!Array.isArray(test)) return;
    var fixture = test[0];
    var pattern = test[1];
    var expected = test[2];
    var msg = 'should ' + (expected ? '' : 'not ') + 'match ' + pattern;

    it((startLine + i) + ' ' + msg, function() {
      assert.equal(match.isMatch(fixture, pattern), expected, msg);
    });
  });
});
