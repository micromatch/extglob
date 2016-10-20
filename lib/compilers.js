'use strict';

var brackets = require('expand-brackets');

/**
 * Extglob compilers
 */

module.exports = function(extglob) {
  var star = extglob.options.star || '.*?';

  /**
   * Use `expand-brackets` compilers
   */

  extglob.use(brackets.compilers);
  extglob.compiler

    /**
     * Escaped: "\\*"
     */

    .set('escape', function(node) {
      return this.emit(node.val, node);
    })

    /**
     * Dot: "."
     */

    .set('dot', function(node) {
      return this.emit('\\' + node.val, node);
    })

    /**
     * Question mark: "?"
     */

    .set('qmark', function(node) {
      var val = '[^\\\\/.]';
      var prev = this.prev();

      if (node.parsed.slice(-1) === '(') {
        var ch = node.rest.charAt(0);
        if (ch !== '!' && ch !== '=' && ch !== ':') {
          return this.emit(val, node);
        }
        return this.emit(node.val, node);
      }

      if (prev.type === 'text' && prev.val) {
        return this.emit(val, node);
      }

      if (node.val.length > 1) {
        val += '{' + node.val.length + '}';
      }
      return this.emit(val, node);
    })

    /**
     * Plus: "+"
     */

    .set('plus', function(node) {
      var prev = node.parsed.slice(-1);
      if (prev === ']' || prev === ')') {
        return this.emit(node.val, node);
      }
      var ch = this.output.slice(-1);
      if (!this.output || (/[?*+]/.test(ch) && node.parent.type !== 'bracket')) {
        return this.emit('\\+', node);
      }
      if (/\w/.test(ch) && !node.inside) {
        return this.emit('+\\+?', node);
      }
      return this.emit('+', node);
    })

    /**
     * Star: "*"
     */

    .set('star', function(node) {
      var prev = this.prev();
      var prefix = prev.type !== 'text' && prev.type !== 'escape'
        ? '(?!\\.)'
        : '';

      return this.emit(prefix + star, node);
    })

    /**
     * Parens
     */

    .set('paren', function(node) {
      node.prev = this.prev();
      return this.mapVisit(node.nodes);
    })
    .set('paren.open', function(node) {
      switch (node.parent.prefix) {
        case '!':
        case '^':
          return this.emit('(?:(?!(?:', node);
        case '@':
        case '+':
        case '*':
        case '?':
          return this.emit('(', node);
        default: {
          return this.emit(node.val, node);
        }
      }
    })
    .set('paren.close', function(node) {
      if (!node.parent.prev) {
        return this.emit('\\' + node.val, node);
      }

      switch (node.prefix) {
        case '!':
        case '^':
          var rest = node.rest;
          var val = !this.options.bash
            ? '))' + star + ')'
            : ').)*$)';

          var boundary = !rest || /^[).]/.test(rest);
          if (!node.suffix && !this.options.bash && boundary) {
            val = '$' + val;
          }

          return this.emit(val, node);
        case '+':
          return this.emit(')+', node);
        case '*':
          return this.emit(')*', node);
        case '?':
          return this.emit(')?', node);
        case '@':
        default: {
          return this.emit(')', node);
        }
      }
    })

    /**
     * Text
     */

    .set('text', function(node) {
      var val = node.val.replace(/[\[\]]/g, '\\$&');
      return this.emit(val, node);
    });
};
