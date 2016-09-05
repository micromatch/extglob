'use strict';

var utils = require('./utils');

module.exports = function(extglob) {
  extglob.parser

    /**
     * Parse extglobs: '!(foo)'
     */

    .pair('paren', /^([!@*?+])?\(/, /^\)(\w?)/)

    /**
     * Parse negations
     */

    .set('not', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\!(?!\()/);
      if (!m || !m[0]) return;

      var prev = this.prev();
      var node = pos({
        type: 'not',
        val: m[0],
      });

      // if nothing has been parsed, we know `!` is at the start,
      // so we need to wrap the result in a negation regex
      if (!parsed) {
        this.bos.val = '(?!^(?:';
        this.append = ')$).*)';
        node.val = '';
      }

      utils.define(node, 'parent', prev);
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
    .capture('dot', /^\./)
    .capture('text', new RegExp(utils.not('([!@*?+])?\\(|[*?.)\\\\]|\\[\\]\\]')))

};
