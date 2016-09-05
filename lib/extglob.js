'use strict';

var Compiler = require('./snapdragon/compiler');
var Parser = require('./snapdragon/parser');
var utils = require('./utils');

function Extglob(options) {
  this.options = options || {};
}

Extglob.prototype.use = function(fn) {
  fn.call(this, this);
  return this;
};

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

  return parsed;
};

Extglob.prototype.compile = function(ast, options) {
  this.options = utils.extend({}, this.options, options);
  return this.compiler.compile(ast, this.options);
};

Object.defineProperty(Extglob.prototype, 'parser', {
  configurable: true,
  set: function(parser) {
    utils.define(this, '_parser', parser);
  },
  get: function() {
    if (typeof this._parser === 'undefined') {
      utils.define(this, '_parser', new Parser(this.options));
    }
    return this._parser;
  }
});

Object.defineProperty(Extglob.prototype, 'compiler', {
  configurable: true,
  set: function(compiler) {
    utils.define(this, '_compiler', compiler);
  },
  get: function() {
    if (typeof this._compiler === 'undefined') {
      utils.define(this, '_compiler', new Compiler(this.options));
    }
    return this._compiler;
  }
});

/**
 * Expose `Extglob`
 */

module.exports = Extglob;
