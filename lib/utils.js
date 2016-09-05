'use strict';

exports.define = require('define-property');
exports.extend = require('extend-shallow');

/**
 * Create a negation regex from the given string
 * @param {String} `str`
 * @return {RegExp}
 */

exports.not = function(str) {
  return '^((?!(?:' + str + ')).)*';
};
