'use strict';

var mm = require('minimatch');
var assert = require('assert');
var argv = require('minimist')(process.argv.slice(2));
var counts = {passing: 0, failing: 0};
var extglob = require('../..');

function tryCatch(counts, fn) {
  try {
    fn();
    counts.passing++;
  } catch (err) {
    if (!argv.count) throw err;
    counts.failing++;
  }
};

exports.isMatch = function(str, pattern, options) {
  if ('mm' in argv) {
    tryCatch(counts, function() {
      assert(mm.makeRe(pattern, options).test(pattern));
    });
    return;
  }

  tryCatch(counts, function() {
    assert(extglob.isMatch(str, pattern, options));
  });
}

exports.isNotMatch = function(str, pattern, options) {
  if ('mm' in argv) {
    tryCatch(counts, function() {
      assert(!mm.makeRe(pattern, options).test(pattern));
    });
    return;
  }

  tryCatch(counts, function() {
    assert(!extglob.isMatch(str, pattern, options));
  });
};

exports.match = function(arr, pattern, expected, msg) {
  if ('mm' in argv) {
    tryCatch(counts, function() {
      assert.deepEqual(mm.match(arr, pattern).sort(), expected.sort(), msg);
    });
    return;
  }

  tryCatch(counts, function() {
    var res = extglob.match(arr, pattern);
    assert.deepEqual(res.sort(), expected.sort(), msg);
  });
};

exports.counts = counts;
