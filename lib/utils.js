'use strict';

exports.define = require('define-property');
exports.extend = require('extend-shallow');
exports.repeat = require('repeat-string');

/**
 * Get the last element from `array`
 * @param {Array} `array`
 * @return {*}
 */

exports.last = function(arr) {
  return arr[arr.length - 1];
};

exports.not = function(str) {
  return `^((?!(?:${str})).)*`;
};
