'use strict';

var regex = require('regex-not');

/**
 * Get the last element from `array`
 * @param {Array} `array`
 * @return {*}
 */

exports.last = function(arr) {
  return arr[arr.length - 1];
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
    if (options.hasOwnProperty(prop)) {
      key += ';' + prop + '=' + String(options[prop]);
    }
  }
  return key;
};

/**
 * Create the regex to use for matching text
 */

exports.createRegex = function(str, cache) {
  if (cache.hasOwnProperty(str)) {
    return cache[str];
  }
  var opts = {contains: true, strictClose: false};
  var re = regex(str, opts);
  cache[str] = re;
  return re;
};
