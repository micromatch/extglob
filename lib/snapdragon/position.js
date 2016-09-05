'use strict';

/**
 * Store position for a node
 */

module.exports = function Position(start, state) {
  this.start = start;
  this.end = { column: state.column };
};
