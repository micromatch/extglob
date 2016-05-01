'use strict';

var util = require('util');
var extend = require('extend-shallow');
var isExtglob = require('is-extglob');
var renderer = require('./lib/renderer');
var parser = require('./lib/parser');
var extglobCache = {};
var makeReCache = {};
var regexCache = {};

/**
 * Convert the given `extglob` pattern into a regex-compatible string.
 *
 * ```js
 * var extglob = require('extglob');
 * var str = extglob('*.!(*a)');
 * console.log(str);
 * //=> "[^/]*?\.(?![^/]*?a)[^/]*?"
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

function extglob(pattern, options) {
  var opts = extend({}, options);
  var key = pattern;
  var close = '$';
  var open = '^';
  var res;

  for (var prop in opts) {
    if (opts.hasOwnProperty(prop)) {
      key += ':' + prop + ':' + String(opts[prop]);
    }
  }

  if (extglobCache.hasOwnProperty(key)) {
    return extglobCache[key];
  }

  if (opts.noextglob === true) {
    return (extglobCache[key] = escapeRegex(pattern));
  }

  if (pattern.charAt(0) === '^') {
    pattern = pattern.slice(1);
  }

  if (pattern.slice(-1) === '$') {
    pattern = pattern.slice(0, pattern.length -1);
  }

  var isExtglobPattern = isExtglob(pattern);
  if (!isExtglobPattern && opts.strictExtglob) {
    return (extglobCache[key] = escapeRegex(pattern));
  }

  var ast = extglob.parse(pattern, opts);
  var res = extglob.render(ast, opts);

  if (ast.strictopen === false || opts.strictopen === false) {
    open = '';
  }

  if (ast.strictclose === false || opts.strictclose === false) {
    close = '';
  }

  var rendered = open + ast.prefix + res.rendered + close;
  return (extglobCache[key] = rendered);
};

/**
 * Expose parse methods
 */

extglob.parser = parser;
extglob.parse = parser.parse;

/**
 * Expose render methods
 */

extglob.renderer = renderer;
extglob.render = renderer.render;
extglob.stringify = renderer.stringify;

/**
 * Takes an array of strings and an extglob pattern and returns a new
 * array that contains only the strings that match the pattern.
 *
 * ```js
 * var extglob = require('extglob');
 * console.log(extglob.match(['a.a', 'a.b', 'a.c'], '*.!(*a)'));
 * //=> ['a.b', 'a.c']
 * ```
 * @param {Array} `arr` Array of strings to match
 * @param {String} `pattern` Extglob pattern
 * @param {Object} `options`
 * @return {Array}
 * @api public
 */

extglob.match = function(arr, pattern, options) {
  arr = [].concat(arr);
  var opts = extend({}, options);
  var isMatch = extglob.matcher(pattern, opts);
  var len = arr.length;
  var idx = -1;
  var res = [];

  while (++idx < len) {
    var ele = arr[idx];
    if (isMatch(ele)) {
      res.push(ele);
    }
  }

  if (res.length === 0) {
    if (opts.failglob === true) {
      throw new Error('no matches found for "' + pattern + '"');
    }
    if (opts.nonull === true || opts.nullglob === true) {
      return [pattern.split('\\').join('')];
    }
  }
  return res;
};

/**
 * Returns true if the specified `string` matches the given
 * extglob `pattern`.
 *
 * ```js
 * var extglob = require('extglob');
 *
 * console.log(extglob.isMatch('a.a', '*.!(*a)'));
 * //=> false
 * console.log(extglob.isMatch('a.b', '*.!(*a)'));
 * //=> true
 * ```
 * @param {String} `string` String to match
 * @param {String} `pattern` Extglob pattern
 * @param {String} `options`
 * @return {Boolean}
 * @api public
 */

extglob.isMatch = function(str, pattern, options) {
  return extglob.makeRe(pattern, options).test(str);
};

/**
 * Takes an extglob pattern and returns a matcher function. The returned
 * function takes the string to match as its only argument.
 *
 * ```js
 * var extglob = require('extglob');
 * var isMatch = extglob.matcher('*.!(*a)');
 *
 * console.log(isMatch('a.a'));
 * //=> false
 * console.log(isMatch('a.b'));
 * //=> true
 * ```
 * @param {String} `pattern` Extglob pattern
 * @param {String} `options`
 * @return {Boolean}
 * @api public
 */

extglob.matcher = function(pattern, options) {
  var re = extglob.makeRe(pattern, options);
  return function(str) {
    return re.test(str);
  };
};

/**
 * Create a regular expression from the given extglob `pattern`.
 *
 * ```js
 * var extglob = require('extglob');
 * var re = extglob.makeRe('*.!(*a)');
 * console.log(re);
 * //=> /^[^\/]*?\.(?![^\/]*?a)[^\/]*?$/
 * ```
 * @param {String} `pattern` The extglob pattern to convert
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

extglob.makeRe = function(pattern, options) {
  var opts = extend({}, options);
  var key = pattern;

  if (/[*+]$/.test(pattern)) {
    opts.strictclose = false;
  }

  for (var prop in opts) {
    if (opts.hasOwnProperty(prop)) {
      key += ':' + prop + ':' + String(opts[prop]);
    }
  }

  if (makeReCache.hasOwnProperty(key)) {
    return makeReCache[key];
  }

  var re = !(pattern instanceof RegExp)
    ? toRegex(extglob(pattern, opts), opts)
    : pattern;

  makeReCache[key] = re;
  return re;
};

/**
 * Create a regex from the given `string` and `options`
 */

function toRegex(str, options) {
  var opts = extend({}, options);
  var key = str;
  for (var prop in opts) {
    if (opts.hasOwnProperty(prop)) {
      key += ':' + prop + ':' + String(opts[prop]);
    }
  }

  if (regexCache.hasOwnProperty(key)) {
    return regexCache[key];
  }

  var re = new RegExp(str, opts.flags);
  regexCache[key] = re;
  return re;
}

/**
 * Escape regex characters in the given string
 */

function escapeRegex(str) {
  if (typeof str === 'string') {
    return str.split('\\').join('').replace(/[-|$,\\#\s{}()\[\]+*?`~&.^]/g, '\\$&');
  }
  throw new TypeError('expected a string: ' + util.format(str));
}

/**
 * Expose `extglob`
 */

module.exports = extglob;
