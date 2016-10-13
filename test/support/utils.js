'use strict';

var util = require('util');
var isWindows = process.platform === 'win32';
exports.extend = require('extend-shallow');
exports.nc = require('noncharacters');

exports.escape = function(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string: ' + util.inspect(str));
  }
  var opts = exports.extend({}, options);
  if (!opts.expand && !opts.escape) return str;
  str = str.replace(/(\$\{([^{}]+?)\})/g, function(m, $1, $2) {
    return exports.nc[0] + $2 + exports.nc[2];
  });
  str = str.replace(/(\{)([^{,.}]+?)(\})/g, function(m, $1, $2, $3) {
    return exports.nc[1] + $2 + exports.nc[2];
  });
  str = str.replace(/\\\{|\{(?!.*\})/g, exports.nc[1]);
  str = str.replace(/\\\}/g, exports.nc[2]);
  str = str.replace(/\\\,/g, exports.nc[3]);
  if (!/\{/.test(str)) {
    return str.replace(/\}/g, exports.nc[2]);
  }
  return str;
};

exports.unescape = function(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string: ' + util.inspect(str));
  }
  var opts = exports.extend({}, options);
  if (!opts.expand && !opts.escape) return str;
  var pre = opts.noescape ? '' : '\\';
  str = str.split(exports.nc[0]).join(pre ? '\\$\\{' : '${');
  str = str.split(exports.nc[1]).join(pre + '{');
  str = str.split(exports.nc[2]).join(pre + '}');
  str = str.split(exports.nc[3]).join(',');
  return str.replace(/\\+/g, '\\');
};

exports.cleanResults = function(m) {
  // normalize discrepancies in ordering, duplication, and ending slashes.
  return m.map(function(m) {
    return m.replace(/\/+/g, '/').replace(/\/$/, '');
  }).sort(exports.alphaSort).reduce(function(set, f) {
    if (f !== set[set.length - 1]) {
      set.push(f);
    }
    return set;
  }, []).sort(exports.alphaSort).map(function(f) {
    return isWindows ? f.replace(/^[a-zA-Z]:\\\\/, '/').replace(/\\/g, '/') : f;
  });
};

exports.flatten = function(chunks) {
  var s = 0;
  chunks.forEach(function(c) {
    s += c.length;
  });
  var out = new Buffer(s);
  s = 0;
  chunks.forEach(function(c) {
    c.copy(out, s);
    s += c.length;
  });
  return out.toString().trim();
};

exports.alphaSort = function(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  return a > b ? 1 : a < b ? -1 : 0;
};
