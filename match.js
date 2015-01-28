/*!
 * extglob <https://github.com/jonschlinkert/extglob>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

/**
 * Module dependencies
 */

var filter = require('arr-filter');

/**
 * Expose `extglob`
 */

module.exports = function (str, options) {
  if (typeof str !== 'string') {
    throw new Error('extglob expects a string');
  }
  return extglob(str, options);
};

/**
 * Expand `{foo,bar}` or `{1..5}` extglob in the
 * given `string`.
 *
 * @param  {String} `str`
 * @param  {Array} `arr`
 * @param  {Object} `options`
 * @return {Array}
 */

function extglob(str, arr, options) {
  if (str === '') {
    return [];
  }

  if (!Array.isArray(arr)) {
    options = arr;
    arr = [];
  }

  var opts = options || {};
  arr = arr || [];

  if (typeof opts.nodupes === 'undefined') {
    opts.nodupes = true;
  }

  var fn = opts.fn;

  if (typeof opts === 'function') {
    fn = opts;
    opts = {};
  }

  if (!(extGlobRe instanceof RegExp)) {
    extGlobRe = extGlobRegex();
  }

  var matches = extGlobRe.exec(str) || [];
  var amp = matches[0];
  var STATE_CHAR = CHAR_DEBUG[matches[1]];

  var res = str.replace(extGlobRe, function (_, ch, $2, $3, offset) {
    return splice(str, offset, ch, STATE_CHAR);
  });

  if (/[!$@*+]\(/.test(res)) {

    console.log(arguments)
  }

  return res;
}

/**
 * regex cache
 */

var extGlobRe;

/**
 * extglob regex.
 */

function extGlobRegex() {
  return /(\\?[@?!+*$]\\?)(\(([^)]+)\))/;
}

var CHAR_DEBUG = {
  '\\?': '__ESC_QMARK__',
  '?': 'ZERO_OR_ONE',
  '*': 'ZERO_OR_MORE',
  '+': 'ONE_OR_MORE',
  '@': 'ONE',
  '!': 'ANY_EXCEPT'
};

var CHAR_CLASS = {
  alnum: /[a-zA-Z0-9]/,
  alpha: /[a-zA-Z]/,
  blank: /[ \t]/,
  cntrl: /[\x00-\x1F\x7F]/,
  digit: /[0-9]/,
  graph: /[\x21-\x7E]/,
  lower: /[a-z]/,
  print: /[\x20-\x7E]/,
  punct: /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/,
  space: /[ \t\r\n\v\f]/,
  upper: /[A-Z]/,
  xdigit: /[A-Fa-f0-9]/
};

/**
 * Faster alternative to `String.replace()` when the
 * index of the token to be replaces can't be supplied
 */

function splice(str, i, token, replacement) {
  return str.slice(0, i - token.length - 1) + replacement
    + str.slice(i + token.length);
}

/**
 * Faster array map
 */

function map(arr, fn) {
  if (arr == null) {
    return [];
  }

  var len = arr.length;
  var res = [];
  var i = -1;

  while (++i < len) {
    res[i] = fn(arr[i], i);
  }

  return res;
}
