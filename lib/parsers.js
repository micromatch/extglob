'use strict';

var utils = require('./utils');

module.exports = function(extglob) {
  extglob.parser
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

      if (!parsed) {
        this.bos.val = '(?!^(?:';
        this.append = ')$).*)';
        node.val = '';
      }

      utils.define(node, 'parent', prev);
      prev.nodes.push(node);
      return node;
    })
    .capture('escape', /^\\(.)/)
    .capture('dot', /^\./)
    .capture('star', /^\*(?!\()/, null, special)
    .capture('qmark', /^\?+(?!\()/)
    .capture('bracket.literal', /^\[\]\]/)
    .capture('text', new RegExp(utils.not('([!@*?+])?\\(|[*?.)]|\\[\\]\\]')))

  extglob.parser
    // .pair('bracket', /^\[/, /^\]/)
    .pair('paren', /^([!@*?+])?\(/, /^\)(\w?)/)

};

function special(node, prev) {
  this.ast.specialChars = true;
  node.specialChars = true;
}
