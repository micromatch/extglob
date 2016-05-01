'use strict';

var extend = require('extend-shallow');
var renderer = require('./lib/renderer');
var parser = require('./lib/parser');
var utils = require('./lib/utils');
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
  if (opts.noextglob === true) {
    return pattern;
  }

  if (opts.literal === true) {
    return escapeRe(pattern);
  }

  var ast = extglob.parse(pattern, opts);
  var res = extglob.render(ast, opts);

  if (ast.hasOwnProperty('strictopen')) {
    opts.strictopen = ast.strictopen;
  }

  if (ast.hasOwnProperty('strictclose')) {
    opts.strictclose = ast.strictclose;
  }

  var open = opts.strictopen === false ? '' : '^';
  var close = opts.strictclose === false ? '' : '$';
  return open + ast.prefix + res.rendered + close;
}

/**
 * Expose parser and render methods
 */

extglob.parser = parser;
extglob.parse = parser.parse;
extglob.renderer = renderer;
extglob.stringify = renderer.stringify;
extglob.render = renderer.render;

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
      key += ':' + String(opts[prop]);
    }
  }

  if (makeReCache.hasOwnProperty(key)) {
    return makeReCache[key];
  }

  var re = !(pattern instanceof RegExp)
    ? regex(extglob(pattern, opts), opts)
    : pattern;

  makeReCache[key] = re;
  return re;
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

  if (res.length === 0 && opts.nonull === true) {
    return [pattern];
  }

  return res;
};

/**
 * Create a regex from the given `string` and `options`
 */

function regex(str, options) {
  var opts = extend({}, options);
  var key = str;
  for (var prop in opts) {
    if (opts.hasOwnProperty(prop)) {
      key += ':' + String(opts[prop]);
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

function escapeRe(str) {
  str = str.split('\\').join('');
  return str.replace(/[|{}()[\]^$+*?.]/g, '\\$&');
}

/**
 * Expose `extglob`
 */

module.exports = extglob;
