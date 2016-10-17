'use strict';

var assert = require('assert');
var matcher = require('./matcher');
var compare = require('./compare');
var utils = require('./utils');

module.exports = function(fixtures, pattern, expected, options, msg) {
  if (!Array.isArray(expected)) {
    var tmp = expected;
    expected = options;
    options = tmp;
  }

  if (typeof options === 'string') {
    msg = options;
    options = {};
  }

  msg = msg ? (pattern + ' ' + msg) : pattern;
  var actual = matcher.match(utils.arrayify(fixtures), pattern, options);
  expected.sort(compare);
  actual.sort(compare);

  assert.deepEqual(actual, expected, msg);
};

module.exports.match = function(fixtures, pattern, expected, options, msg) {
  if (!Array.isArray(expected)) {
    var tmp = expected;
    expected = options;
    options = tmp;
  }

  if (typeof options === 'string') {
    msg = options;
    options = {};
  }

  msg = msg ? (pattern + ' ' + msg) : pattern;

  var actual = matcher.match(utils.arrayify(fixtures), pattern, options);
  expected.sort(compare);
  actual.sort(compare);

  assert.deepEqual(actual, expected, msg);
};

module.exports.isMatch = function() {
  return matcher.isMatch.apply(null, arguments);
};
module.exports.makeRe = function() {
  return matcher.makeRe.apply(null, arguments);
};
