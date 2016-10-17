'use strict';

var regex = require('regex-not');

/**
 * Cast `val` to an array
 * @return {Array}
 */

exports.arrayify = function(val) {
  if (!Array.isArray(val)) {
    return [val];
  }
  return val;
};

/**
 * Create the key to use for memoization. The key is generated
 * by iterating over the options and concatenating key-value pairs
 * to the pattern string.
 */

exports.createKey = function(pattern, options) {
  var key = pattern;
  if (typeof options === 'undefined') {
    return key;
  }
  for (var prop in options) {
    key += ';' + prop + '=' + String(options[prop]);
  }
  return key;
};

/**
 * Create the regex to use for matching text
 */

exports.createRegex = function(str) {
  var opts = {contains: true, strictClose: false};
  return regex(str, opts);
};
