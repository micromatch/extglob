'use strict';

var util = require('util');
var Snapdragon = require('snapdragon');
var utils = require('./utils');

function Extglob(options) {
  Snapdragon.call(this, options);
  this.options = utils.extend({}, this.options, {source: 'extglob'});
}

Extglob.prototype.parse = function(str, options) {
  this.options = utils.extend({}, this.options, options);
  var parsed = this.parser.parse(str, this.options);

  // escape unmatched brace/bracket/parens
  var last = this.parser.stack.pop();
  if (last) {
    var node = last.nodes[0];
    node.val = '\\' + node.val;
    var sibling = node.parent.nodes[1];
    if (sibling.type === 'star') {
      sibling.loose = true;
    }
  }

  // add non-enumerable parser reference
  utils.define(parsed, 'parser', this.parser);
  return parsed;
};

/**
 * Inherit `Snapdragon`
 */

util.inherits(Extglob, Snapdragon);

/**
 * Expose `Extglob`
 */

module.exports = Extglob;
