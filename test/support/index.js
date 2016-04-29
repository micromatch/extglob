'use strict';

var util = require('util');
var mm = require('minimatch');
var assert = require('assert');
var argv = require('minimist')(process.argv.slice(2));
var extglob = require('../..');

module.exports = function(cache) {
  var support = {};
  var counts = {passing: 0, failing: 0};

  function tryCatch(counts, fn) {
    try {
      fn();
      counts.passing++;
    } catch (err) {
      if (argv.th !== true) {
        // throw err;
      }
      // console.log(err);
      counts.failing++;
    }
  };

  support.isMatch = function(str, pattern, options, msg) {
    if (typeof options === 'string') {
      msg = options;
      options = {};
    }

    if ('mm' in argv) {
      tryCatch(counts, function() {
        assert(mm.makeRe(pattern, options).test(pattern));
      });
      return;
    }

    tryCatch(counts, function() {
      assert(extglob.isMatch(str, pattern, options), msg);
    });
  }

  support.isNotMatch = function(str, pattern, options, msg) {
    if (typeof options === 'string') {
      msg = options;
      options = {};
    }

    if ('mm' in argv) {
      tryCatch(counts, function() {
        assert(!mm.makeRe(pattern, options).test(pattern), msg);
      });
      return;
    }

    tryCatch(counts, function() {
      assert(!extglob.isMatch(str, pattern, options), msg);
    });
  };

  support.match = function(arr, pattern, expected, options, msg) {
    var args = [].slice.call(arguments);
    var units = cache[pattern] || (cache[pattern] = []);
    units.push({
      fixtures: arr,
      expected: expected,
      options: options || {},
      message: msg || ''
    });

    if (typeof options === 'string') {
      msg = options;
      options = {};
    }

    if ('mm' in argv) {
      tryCatch(counts, function() {
        assert.deepEqual(mm.match(arr, pattern, options).sort(), expected.sort(), msg);
      });
      return;
    }

    tryCatch(counts, function() {
      var res = extglob.match(arr, pattern, options);
      assert.deepEqual(res.sort(), expected.sort(), msg);
    });
  };

  support.throws = function(arr, pattern, expected, options, msg) {
    if (typeof options === 'string') {
      msg = options;
      options = {};
    }

    try {
      var res = extglob.match(arr, pattern, options);
    } catch (err) {
      assert.strictEqual(err.message, msg);
    }
  };

  support.counts = counts;
  return support;
};
