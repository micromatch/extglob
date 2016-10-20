'use strict';

var bash = require('bash-match');
var isWindows = require('is-windows');

function matcher() {
  if (isWindows()) return;
  return bash.apply(null, arguments);
}

matcher.match = function(fixtures, pattern) {
  if (isWindows()) return;
  try {
    return bash.match(fixtures, pattern);
  } catch (err) {}
  return null;
};

matcher.isMatch = function(fixtures, pattern) {
  if (isWindows()) return;
  try {
    return bash.isMatch(fixtures, pattern);
  } catch (err) {}
  return null;
};

/**
 * Expose `matcher`
 */

module.exports = matcher;
