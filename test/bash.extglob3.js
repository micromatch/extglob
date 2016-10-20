'use strict';

require('mocha');
var match = require('./support/match');
var assert = require('assert');

// ported from http://www.bashcookbook.com/bashinfo/source/bash-4.3/tests/extglob3.tests
describe('bash extglob3 tests', function() {
  var startLine = 11;
  var tests = [
    [ 'ab/../', '@(ab|+([^/]))/..?(/)', true ],
    [ 'ab/../', '+([^/])/..?(/)', true ],
    [ 'ab/../', '@(ab|?b)/..?(/)', true ],
    [ 'ab/../', '+([^/])/../', true ],
    [ 'ab/../', '+([!/])/..?(/)', true ],
    [ 'ab/../', '@(ab|+([!/]))/..?(/)', true ],
    [ 'ab/../', '+([!/])/../', true ],
    [ 'ab/../', '+([!/])/..?(/)', true ],
    [ 'ab/../', '+([!/])/..@(/)', true ],
    [ 'ab/../', '+(ab)/..?(/)', true ],
    [ 'ab/../', '[!/][!/]/../', true ],
    [ 'ab/../', '@(ab|?b)/..?(/)', true ],
    [ 'ab/../', '[^/][^/]/../', true ],
    [ 'ab/../', '?b/..?(/)', true ],
    [ 'ab/../', '+(?b)/..?(/)', true ],
    [ 'ab/../', '+(?b|?b)/..?(/)', true ],
    [ 'ab/../', '@(?b|?b)/..?(/)', true ],
    [ 'ab/../', '@(a?|?b)/..?(/)', true ],
    [ 'ab/../', '?(ab)/..?(/)', true ],
    [ 'ab/../', '?(ab|??)/..?(/)', true ],
    [ 'ab/../', '@(??)/..?(/)', true ],
    [ 'ab/../', '@(??|a*)/..?(/)', true ],
    [ 'ab/../', '@(a*)/..?(/)', true ],
    [ 'ab/../', '+(??)/..?(/)', true ],
    [ 'ab/../', '+(??|a*)/..?(/)', true ],
    [ 'ab/../', '+(a*)/..?(/)', true ],
    [ 'x', '@(x)', true ]
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
