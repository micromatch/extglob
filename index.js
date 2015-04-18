/*!
 * extglob <https://github.com/jonschlinkert/extglob>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * Module dependencies
 */

var mm = require('micromatch');

/**
 * Expose `extglob`
 */

module.exports = function (str, options) {
  if (typeof str !== 'string') {
    throw new Error('extglob expects a string');
  }
  if (!isExtglob(str)) {
    return str;
  }
  return extglob(str, options);
};

module.exports.match = function (arr, pattern) {
  var re = makeRe(pattern);
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

module.exports.makeRe = makeRe;

function makeRe(pattern) {
 return new RegExp(expand(pattern));
}

function expand(str) {
  str = mm.expand(extglob(str)).glob;
  return unescapeChars(str);
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

function extglob(str) {
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

  var last = false;
  if (last === false && isExtglob(str)) {
    str = extglob(str, true);
  } else {
    last = true;
    str = unescape(wrapper(str, null));
  }
  return str;
}

/**
 * regex cache
 */

var extGlobRe;

/**
 * wrap the string
 */

function wrapper(str, ch) {
  switch(ch) {
    case null:
      return str;
    case '!':
      return '_LP_:_LP_!' + str + '_RP_[^/]%%%~_RP_';
    case '@':
      return '_LP_:' + str + '_RP_';
    case '+':
      return '_LP_:' + str + '_RP_+';
    case '*':
      return '_LP_:' + str + '_RP_%%';
    case '?':
      return '_LP_:' + str + '_RP_%~';
  }
  return str;
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
 * unescape parens
 */

function unescapeChars(str) {
  str = str.split('%~').join('?');
  str = str.split('%%').join('*');
  return str;
}

/**
 * Does the string have an extglob?
 */

function isExtglob(str) {
  return /[@?!+*]\(/.test(str);
}

/**
 * extglob regex.
 */

function extGlobRegex() {
  return /(\\?[@?!+*$]\\?)(\(([^()]+)\))/;
}
