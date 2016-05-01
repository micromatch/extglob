'use strict';

var extglob = require('../..');

module.exports = function(args) {
  return extglob.isMatch(args[0], args[1]);
};
