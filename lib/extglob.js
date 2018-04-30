'use strict';

/**
 * Module dependencies
 */

const Snapdragon = require('snapdragon');
const capture = require('snapdragon-capture');
const define = require('define-property');

/**
 * Local dependencies
 */

const compilers = require('./compilers');
const parsers = require('./parsers');

/**
 * Customize Snapdragon parser and renderer
 */

function Extglob(options) {
  this.options = Object.assign({source: 'extglob'}, options);
  this.snapdragon = this.options.snapdragon || new Snapdragon(this.options);
  this.snapdragon.use(capture());
  this.snapdragon.patterns = this.snapdragon.patterns || {};
  this.compiler = this.snapdragon.compiler;
  this.parser = this.snapdragon.parser;

  compilers(this.snapdragon);
  parsers(this.snapdragon);

  /**
   * Override Snapdragon `.parse` method
   */

  define(this.snapdragon, 'parse', function(str, options) {
    const parsed = Snapdragon.prototype.parse.apply(this, arguments);
    parsed.input = str;

    // escape unmatched brace/bracket/parens
    const last = this.parser.stack.pop();
    if (last && this.options.strict !== true) {
      const node = last.nodes[0];
      node.val = '\\' + node.val;
      const sibling = node.parent.nodes[1];
      if (sibling.type === 'star') {
        sibling.loose = true;
      }
    }

    // add non-enumerable parser reference
    define(parsed, 'parser', this.parser);
    return parsed;
  });

  /**
   * Decorate `.parse` method
   */

  define(this, 'parse', function(ast, options) {
    return this.snapdragon.parse.apply(this.snapdragon, arguments);
  });

  /**
   * Decorate `.compile` method
   */

  define(this, 'compile', function(ast, options) {
    return this.snapdragon.compile.apply(this.snapdragon, arguments);
  });

}

/**
 * Expose `Extglob`
 */

module.exports = Extglob;
