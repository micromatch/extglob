'use strict';

/**
 * Module dependencies
 */

var debug = require('debug')('extglob');
var extend = require('extend-shallow');
var toRegex = require('to-regex');

/**
 * Local dependencies
 */

var compilers = require('./lib/compilers');
var parsers = require('./lib/parsers');
var Extglob = require('./lib/extglob');
var utils = require('./lib/utils');
var cache = {};

/**
 * Convert the given `extglob` pattern into a regex-compatible string. Returns
 * an object with the compiled result and the parsed AST.
 *
 * ```js
 * var extglob = require('extglob');
 * console.log(extglob('*.!(*a)'));
 * //=> '(?!\\.)[^/]*?\\.(?!(?!\\.)[^/]*?a\\b).*?'
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

function extglob(pattern, options) {
  debug('initializing from <%s>', __filename);
  var res = extglob.create(pattern, options);
  return res.output;
}

/**
 * Takes an array of strings and an extglob pattern and returns a new
 * array that contains only the strings that match the pattern.
 *
 * ```js
 * var extglob = require('extglob');
 * console.log(extglob.match(['a.a', 'a.b', 'a.c'], '*.!(*a)'));
 * //=> ['a.b', 'a.c']
 * ```
 * @param {Array} `list` Array of strings to match
 * @param {String} `pattern` Extglob pattern
 * @param {Object} `options`
 * @return {Array}
 * @api public
 */

extglob.match = function(list, pattern, options) {
  var isMatch = extglob.matcher(pattern, options);

  list = [].concat(list);
  var len = list.length;
  var idx = -1;
  var res = [];

  while (++idx < len) {
    var ele = list[idx];

    if (isMatch(ele)) {
      res.push(ele);
    }
  }

  if (res.length === 0) {
    if (options && options.failglob === true) {
      throw new Error('no matches found for "' + pattern + '"');
    }
    if (options && (options.nonull === true || options.nullglob === true)) {
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
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }
  if (typeof pattern !== 'string') {
    throw new TypeError('expected pattern to be a string');
  }

  var key = utils.createKey('isMatch:' + pattern, options);
  var matcher;

  options = options || {};
  if (!options || (options.cache !== false && cache.hasOwnProperty(key))) {
    matcher = cache[key];
  } else {
    matcher = cache[key] = extglob.matcher(pattern, options);
  }

  return matcher(str);
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
  if (typeof pattern !== 'string') {
    throw new TypeError('expected pattern to be a string');
  }

  var re = extglob.makeRe(pattern, options);
  return function(str) {
    return re.test(str);
  };
};

/**
 * Convert the given `extglob` pattern into a regex-compatible string. Returns
 * an object with the compiled result and the parsed AST.
 *
 * ```js
 * var extglob = require('extglob');
 * console.log(extglob.create('*.!(*a)').output);
 * //=> '(?!\\.)[^/]*?\\.(?!(?!\\.)[^/]*?a\\b).*?'
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

extglob.create = function(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('expected pattern to be a string');
  }

  var key = utils.createKey('create:' + pattern, options);
  options = options || {};
  if (!options || (options.cache !== false && cache.hasOwnProperty(key))) {
    return cache[key];
  }

  var ext = new Extglob(options);
  var ast = ext.parse(pattern, options);
  var res = ext.compile(ast, options);
  if (!options || options.cache !== false) {
    cache[key] = res;
  }
  return res;
};

/**
 * Create a regular expression from the given `pattern` and `options`.
 *
 * ```js
 * var extglob = require('extglob');
 * var re = extglob.makeRe('*.!(*a)');
 * console.log(re);
 * //=> /^[^\/]*?\.(?![^\/]*?a)[^\/]*?$/
 * ```
 * @param {String} `pattern` The pattern to convert to regex.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

extglob.makeRe = function(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('expected pattern to be a string');
  }

  var key = utils.createKey('makeRe:' + pattern, options);
  var regex;

  options = options || {};
  if (!options || (options.cache !== false && cache.hasOwnProperty(key))) {
    return cache[key];
  }

  var opts = extend({strictErrors: false}, options);
  if (opts.strictErrors === true) {
    opts.strict = true;
  }

  var res = extglob.create(pattern, opts);
  regex = toRegex(res.output, opts);
  if (opts.cache !== false) {
    cache[key] = regex;
  }
  return regex;
};

/**
 * Expose `Extglob` constructor, parsers and compilers
 */

extglob.Extglob = Extglob;
extglob.compilers = compilers;
extglob.parsers = parsers;

/**
 * Expose `extglob`
 * @type {Function}
 */

module.exports = extglob;
