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

var mm = require('micromatch');

/**
 * Expose `extglob`
 */

module.exports = function (str) {
  if (typeof str !== 'string') {
    throw new Error('extglob expects a string');
  }
  if (!/[@?!+*]\(/.test(str)) {
    return str;
  }
  return extglob(str);
};

module.exports.match = function (arr, pattern) {
  var re = new RegExp(expand(pattern));
  var len = arr.length, i = 0;
  var res = [];

  while (len--) {
    var str = arr[i++];
    if (re.test(str)) {
      res.push(str);
    }
  }
  return res
};

module.exports.makeRe = function (pattern) {
 return new RegExp(expand(pattern));
};

function expand(str) {
  str = mm.expand(extglob(str)).glob;
  str = str.replace(/%~/g, '?');
  return str.replace(/%%/g, '*');
}


/**
 * Expand `{foo,bar}` or `{1..5}` extglob in the
 * given `string`.
 *
 * @param  {String} `str`
 * @param  {Array} `arr`
 * @param  {Object} `options`
 * @return {Array}
 */

function extglob(str, wrapped) {
  var last = false;
  var wrap = true;
  var res = '';

  if (!(extGlobRe instanceof RegExp)) {
    extGlobRe = extGlobRegex();
  }

  var matches = extGlobRe.exec(str);
  if (matches) {
    var ch = matches[1];
    var inner = matches[3];
    var parts = str.split(matches[0]);
    if (parts[0] === '' && parts[1] === '*') {
      return '(?:(?!^' + unescape(inner) + ').)%%$';
    }
    str = parts.join(wrapper(inner, ch));
  }

  if (last === false && /[!$@*+]\(/.test(str)) {
    str = extglob(str, true);
  } else {
    last = true;
    str = unescape('_LP_!\\._RP__LP_=._RP_' + str);
  }

  return last ? '^(?:' + str + ')$' : str;
}

/**
 * regex cache
 */

var extGlobRe;

/**
 * wrap the string
 */

function wrapper(str, ch) {
  var res = str;
  if (!ch) {
    return '_LP_!\\._RP__LP_=._RP_' + res;
  }

  if (ch === '!') {
    res = '_LP_:_LP_!' + str + '_RP_[^/]%%%~_RP_';

  } else if (ch === '@') {
    res = '_LP_:' + str + '_RP_';

  } else if (ch === '+') {
    res = '_LP_:' + str + '_RP_+';

  } else if (ch === '*') {
    res = '_LP_:' + str + '_RP_%%';

  } else if (ch === '?') {
    res = '_LP_:' + str + '_RP_%~';
  }
  return res;
}

/**
 * unescape parens
 */

function unescape(str) {
  str = str.split('_LP_').join('(?');
  str = str.split('_RP_').join(')');
  return str;
}

/**
 * extglob regex.
 */

function extGlobRegex() {
  return /(\\?[@?!+*$]\\?)(\(([^()]+)\))/;
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
