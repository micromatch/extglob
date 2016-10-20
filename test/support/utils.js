'use strict';

exports.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

exports.alphaSort = function(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  return a > b ? 1 : a < b ? -1 : 0;
};
