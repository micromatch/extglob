'use strict';

var path = require('path');
var extend = require('extend-shallow');
var isExtglob = require('is-extglob');
var spawn = require('cross-spawn');

/**
 * Globbing by bash.
 *
 * - `dotglob`: Includes filenames beginning with a `.` (dot) in the results of pathname expansion.
 * - `extglob`: Enable extended [pattern matching](http://wiki.bash-hackers.org/syntax/pattern) features.
 * - `failglob`: If set, patterns that fail to match filenames during pathname expansion result in an error message.
 * - `globstar`: Enable recursive globbing with `**`.
 * - `nocaseglob`: Enable case-insensitive matching in filenames when performing pathname expansion.
 * - `nullglob`: If set, Bash allows patterns which match no files to expand to a null string, rather than themselves.
 *
 * @param {String} `pattern`
 * @param {Object} `options`
 * @param {Function} `cb`
 * @return {Array}
 * @api public
 */

module.exports = function(pattern, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (Array.isArray(pattern)) {
    pattern = pattern.join(' ');
  }

  var valid = ['dotglob', 'extglob', 'failglob', 'globstar', 'nocaseglob', 'nullglob'];
  var opts = extend({}, options);
  var cmd = [];

  if (opts.nocase === true) opts.nocaseglob = true;
  if (opts.dot === true) opts.dotglob = true;
  if (!opts.hasOwnProperty('globstar') && pattern.indexOf('**') !== -1) {
    opts.globstar = true;
  }
  if (!opts.hasOwnProperty('extglob') && isExtglob(pattern)) {
    opts.extglob = true;
  }

  for (var key in opts) {
    if (opts.hasOwnProperty(key) && valid.indexOf(key) !== -1) {
      cmd.push('-O', key);
    }
  }

  cmd.push('-c', `for i in ${pattern}; do echo $i; done`);
  var bashPath = process.platform === 'darwin'
    ? '/usr/local/bin/bash'
    : 'bash';

  var cp = spawn(bashPath, cmd, options);
  var buf = new Buffer(0);

  cp.stdout.on('data', function(data) {
    buf = Buffer.concat([ buf, data ]);
  });

  cp.stderr.on('data', function(err) {
    cb(err);
  });

  cp.on('close', function(code) {
    if (code) {
      if (code === 1) {
        cb(null, []);
        return;
      }
      cb(code);
      process.exit(code);
    } else {

      var files = buf.toString()
        .split(/\r?\n/)
        .filter(Boolean);

      cb(null, files);
    }
  });
}
