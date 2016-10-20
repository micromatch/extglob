'use strict';

require('mocha');
var match = require('./support/match');
var assert = require('assert');

// ported from http://www.bashcookbook.com/bashinfo/source/bash-4.3/tests/extglob1.sub
describe('bash extglob1 tests', function() {
  var startLine = 11;
  var tests = [
    ['a.c', '+([[:alpha:].])', true],
    ['a.c', '+([[:alpha:].])+([[:alpha:].])', true],
    ['a.c', '*([[:alpha:].])', true],
    ['a.c', '*([[:alpha:].])*([[:alpha:].])', true],
    ['a.c', '?([[:alpha:].])?([[:alpha:].])?([[:alpha:].])', true],
    ['a.c', '@([[:alpha:].])@([[:alpha:].])@([[:alpha:].])', true],
    ['.', '!([[:alpha:].])', false],
    ['.', '?([[:alpha:].])', true],
    ['.', '@([[:alpha:].])', true],
    ['.', '*([[:alpha:].])', true],
    ['.', '+([[:alpha:].])', true]
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
