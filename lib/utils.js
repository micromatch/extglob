'use strict';

const regex = require('regex-not');
const Cache = require('fragment-cache');

/**
 * Utils
 */

const utils = module.exports;
const cache = utils.cache = new Cache();

/**
 * Cast `val` to an array
 * @return {Array}
 */

utils.arrayify = function(val) {
  if (!Array.isArray(val)) {
    return [val];
  }
  return val;
};

/**
 * Memoize a generated regex or function
 */

utils.memoize = function(type, pattern, options, fn) {
  const key = utils.createKey(type + pattern, options);

  if (cache.has(type, key)) {
    return cache.get(type, key);
  }

  const val = fn(pattern, options);
  if (options && options.cache === false) {
    return val;
  }

  cache.set(type, key, val);
  return val;
};

/**
 * Create the key to use for memoization. The key is generated
 * by iterating over the options and concatenating key-value pairs
 * to the pattern string.
 */

utils.createKey = function(pattern, options) {
  let key = pattern;
  if (typeof options === 'undefined') {
    return key;
  }
  for (const prop in options) {
    key += ';' + prop + '=' + String(options[prop]);
  }
  return key;
};

/**
 * Create the regex to use for matching text
 */

utils.createRegex = function(str) {
  const opts = {contains: true, strictClose: false};
  return regex(str, opts);
};
