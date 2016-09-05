'use strict';

var extend = require('extend-shallow');
var compilers = require('./lib/compilers');
var parsers = require('./lib/parsers');
var Extglob = require('./lib');
var makeReCache = {};
var regexCache = {};

/**
 * Convert the given `extglob` pattern into a regex-compatible string.
 *
 * ```js
 * var extglob = require('extglob');
 * var str = extglob('*.!(*a)');
 * console.log(str);
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

function extglob(str, options) {
  var matcher = new Extglob(options);

  matcher.use(compilers);
  matcher.use(parsers);

  var ast = matcher.parse(str);
  var res = matcher.compile(ast);
  return res;
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
  for (var prop in opts) {
    if (opts.hasOwnProperty(prop)) {
      key += ':' + prop + ':' + String(opts[prop]);
    }
  }

  if (makeReCache.hasOwnProperty(key)) {
    return makeReCache[key];
  }

  var res = extglob(pattern, opts);
  var re = typeof pattern === 'string'
    ? toRegex(res.output, opts)
    : pattern;

  makeReCache[key] = re;
  return re;
};

/**
 * Create a regex from the given `string` and `options`
 */

function toRegex(pattern, options) {
  var opts = extend({}, options);
  var key = pattern;
  for (var prop in opts) {
    if (opts.hasOwnProperty(prop)) {
      key += ':' + prop + ':' + String(opts[prop]);
    }
  }

  if (regexCache.hasOwnProperty(key)) {
    return regexCache[key];
  }

  var flags = opts.flags || '';
  if (opts.nocase === true && !/i/.test(flags)) {
    flags += 'i';
  }

  try {
    var res = '^(?:' + pattern + ')$';
    if (opts.isNegated) {
      res = utils.not(res);
    }

    var re = new RegExp(res, flags);
    regexCache[key] = re;
    return re;
  } catch (err) {
    if (opts.strict) throw err;
    return /$^/;
  }
}

/**
 * Expose `extglob`
 * @type {Function}
 */

module.exports = extglob;

/**
 * Expose `Extglob` constructor
 * @type {Function}
 */

module.exports.Extglob = Extglob;

/**
 * Expose `Compiler` and `Parser` constructors
 * @type {Function}
 */

module.exports.Compiler = require('./lib/extglob/compiler');
module.exports.Parser = require('./lib/extglob/parser');
