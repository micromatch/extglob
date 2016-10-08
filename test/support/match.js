'use strict';

var path = require('path');
var spawn = require('cross-spawn');
var utils = require('./utils');

function match(str, pattern, options) {
  var cmd = pattern;

  if (!/echo/.test(cmd)) {
    cmd = `shopt -s extglob && shopt -s nullglob && [[ ${str} == ${pattern} ]] && echo true || echo false`;
  }

  var cp = spawn.sync('bash', ['-c', cmd], options);
  var err = cp.stderr.toString().trim();
  if (err) {
    console.error(cmd);
    throw new Error(err);
  }

  var res = cp.stdout.toString().trim();
  if (res === 'true') {
    return true;
  }
  return false;
}

/**
 * Escape characters that behave differently in bash than node (like spaces, which are
 * valid path characters in node.js but indicate a delimiter in Bash)
 */

function escape(buf) {
  return buf.split(/\\? /).join('_SPACE_')
    .replace(/([\[\]])/g, '\\$1')
    .replace(/(\$\{)([^{}]+)(\})/g, function(m, $1, $2, $3) {
      return utils.nc[0] + $2 + utils.nc[2];
    });
}

/**
 * Expose `bash`
 */

module.exports = match;

console.log(match('a/b', 'a/{a,b}*'))
