'use strict';

var utils = require('./utils');
var regex = require('regex-not');
var define = require('define-property');
var brackets = require('expand-brackets');
var cache = {};

module.exports = function(extglob) {
  var str = '([!@*?+])?\\(|[*?.+)\\\\]|\\[\\]\\]|[\\[\\]]';
  var not = createRegex(str);

  /**
   * Parsers
   */

  // extglob.parser.sets.paren = extglob.parser.sets.paren || [];
  extglob.use(brackets.parsers);
  extglob.parser

    /**
     * Parse extglobs: '!(foo)'
     */

    .capturePair('paren', /^([!@*?+])?\(/, /^\)(\w?)/)

    /**
     * Open
     */

    // .capture('paren.open', function() {
    //   var pos = this.position();
    //   var m = this.match(/^([!@*?+])?\(/);
    //   if (!m) return;

    //   var open = pos({
    //     type: 'paren.open',
    //     val: m[0]
    //   });

    //   var prev = this.prev();
    //   var last = utils.last(prev.nodes);
    //   if (last.type === 'paren.open') {
    //     open.type = 'paren.inner';
    //     define(open, 'parent', prev);
    //     prev.nodes.push(open);
    //     return;
    //   }

    //   var node = pos({
    //     type: 'paren',
    //     nodes: [open]
    //   });

    //   define(node, 'parent', prev);
    //   define(open, 'parent', node);
    //   this.push('paren', node);
    //   prev.nodes.push(node);
    // })

    /**
     * Close
     */

    // .capture('paren.close', function() {
    //   var parsed = this.parsed;
    //   var pos = this.position();
    //   var m = this.match(/^\)(\w?)/);
    //   if (!m) return;

    //   var prev = this.prev();
    //   var last = utils.last(prev.nodes);
    //   var node = pos({
    //     type: 'paren.close',
    //     rest: this.input,
    //     val: m[0]
    //   });

    //   if (last.type === 'paren.open') {
    //     node.type = 'paren.inner';
    //     define(node, 'parent', prev);
    //     prev.nodes.push(node);
    //     return;
    //   }

    //   var paren = this.pop('paren');
    //   if (!this.isType(paren, 'paren')) {
    //     if (this.options.strict) {
    //       throw new Error('missing opening "("');
    //     }
    //     node.type = 'paren.inner';
    //     node.escaped = true;
    //     return node;
    //   }

    //   paren.nodes.push(node);
    //   define(node, 'parent', paren);
    // })

    /**
     * Parse negations
     */

    .capture('not', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\!(?!\()/);
      if (!m || !m[0]) return;

      var prev = this.prev();
      var node = pos({
        type: 'not',
        val: m[0]
      });

      // if nothing has been parsed, we know `!` is at the start,
      // so we need to wrap the result in a negation regex
      if (!parsed) {
        this.bos.val = '(?!^(?:';
        this.append = ')$).*';
        node.val = '';
      }

      define(node, 'parent', prev);
      prev.nodes.push(node);
      return node;
    })

    /**
     * Character parsers
     */

    .capture('bracket.literal', /^\[\]\]/)
    .capture('escape', /^\\(.)/)
    .capture('qmark', /^\?+(?!\()/)
    .capture('star', /^\*(?!\()/)
    .capture('plus', /^\+(?!\()/)
    .capture('dot', /^\./)
    .capture('text', function() {
      if (this.isInside('paren')) return;
      var pos = this.position();
      var m = this.match(not);
      if (!m || !m[0]) return;
      return pos({
        type: 'text',
        val: m[0]
      });
    })
    .capture('paren.inner', function() {
      if (!this.isInside('paren')) return;
      var pos = this.position();
      var m = this.match(not);
      if (!m || !m[0]) return;
      return pos({
        type: 'paren.inner',
        val: m[0]
      });
    })
};


function createRegex(str) {
  if (cache.hasOwnProperty(str)) {
    return cache[str];
  }
  var opts = {contains: true, strictClose: false};
  var re = regex(str, opts);
  cache[str] = re;
  return re;
}
