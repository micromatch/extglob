'use strict';

var brackets = require('expand-brackets');

/**
 * Extglob compilers
 */

module.exports = function(extglob) {
  var star = '[^/]*?';

  /**
   * Use `expand-brackets` compilers
   */

  extglob.use(brackets.compilers);
  extglob.compiler

    /**
     * Negation: "!" | "^"
     */

    .set('not', function(node) {
      return this.emit('', node);
    })

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
      var val = this.options.dot ? '[^/\\\\]' : '[^/.\\\\]';
      var prev = this.prev();

      if (prev.type === 'text' && prev.val) {
        return this.emit(val, node);
      }

      if (node.val.length > 1) {
        val = '.{' + node.val.length + '}';
      }

      if (prev.type === 'bos' && !this.options.dot) {
        val = '(?!\\.)' + val;
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
      if (!this.output || (/[?*+]/.test(ch) && node.parent.type !== 'bracket')) {
        return this.emit('\\+', node);
      }
      var ch = this.output.slice(-1);
      if (/\w/.test(ch) && !node.inside) {
        return this.emit('+\\+?', node);
      }
      return this.emit('+', node);
    })

    /**
     * Star: "*"
     */

    .set('star', function(node) {
      if (this.output.slice(-1) === ']') {
        return this.emit('*?', node);
      }

      var prev = this.prev();
      var prefix = !this.dot && prev.type !== 'text' && prev.type !== 'escape'
        ? (this.options.dot ? '(?!(?:^|\\/)\\.{1,2}(?:$|\\/))(?=.)' : '(?!\\.)')
        : '';

      var val = prefix + star;
      var next = this.next();
      if (prev.type !== 'bos' && prev.type !== 'slash' && next.type !== 'eos') {
        val = '(' + val + ')?';
      }

      return this.emit(val, node);
    })

    /**
     * Parens
     */

    .set('paren', function(node) {
      return this.mapVisit(node.nodes);
    })
    .set('paren.open', function(node) {
      switch (node.parent.prefix) {
        case '!':
        case '^':
          return this.emit('(?!', node);
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
      switch (node.parent.prefix) {
        case '!':
        case '^':
          var next = node.rest.charAt(0);
          if (!node.suffix && (next === '' || next === ')' || next === '.')) {
            return this.emit('(?:\\b|$))[^/]*?', node);
          }
          return this.emit(')[^/]*?' + node.suffix, node);
        case '+':
          return this.emit(')+' + node.suffix, node);
        case '*':
          return this.emit(')*' + node.suffix, node);
        case '?':
          return this.emit(')?' + node.suffix, node);
        case '@':
        default: {
          return this.emit(')' + node.suffix, node);
        }
      }
    })

    /**
     * Text
     */

    .set('text', function(node) {
      return this.emit(node.val, node);
    });
};
