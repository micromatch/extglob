'use strict';

var argv = require('yargs-parser')(process.argv.slice(2));
var mm = require('multimatch');
var minimatch = require('minimatch');
var bash = require('./try-bash');
var utils = require('./utils');
var extglob = require('../..');

// use multimatch for the array/array scenario
function mi() {
  return mm.apply(null, arguments);
}

// label for debugging
mm.multimatch = true;
mi.minimatch = true;
extglob.extglob = true;
bash.bash = true;

/**
 * Decorate methods onto multimatch for parity with nanomatch
 */

mm.isMatch = function(files, patterns, options) {
  return mm(utils.arrayify(files), patterns, options).length > 0;
};

mm.contains = function(files, patterns, options) {
  return mm.isMatch(files, patterns, options);
};

mm.match = function(files, patterns, options) {
  return mm(utils.arrayify(files), patterns, options);
};

mm.makeRe = function(pattern, options) {
  return mi.makeRe(pattern, options);
};

/**
 * Decorate methods onto minimatch for parity with nanomatch
 */

mi.isMatch = function(file, pattern, options) {
  return minimatch(file, pattern, options);
};

mi.contains = function(files, patterns, options) {
  return mi.isMatch(files, patterns, options);
};

mi.match = function(files, pattern, options) {
  return minimatch.match(utils.arrayify(files), pattern, options);
};

mi.makeRe = function(pattern, options) {
  return minimatch.makeRe(pattern, options);
};

/**
 * Detect matcher based on argv, with nanomatch as default
 */

var matcher = argv.mm ? mm : (argv.mi ? mi : extglob);
if (argv.bash) {
  matcher = bash;
}

/**
 * Expose matcher
 */

module.exports = matcher;
module.exports.bash = bash;
module.exports.extglob = extglob;
module.exports.mm = mm;
module.exports.mi = mi;
