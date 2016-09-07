'use strict';

var utils = require('./utils');

module.exports = function(extglob) {
  var star = '[^/]*?';

  extglob.compiler

    /**
     * beginning-of-string
     */

    .set('bos', function(node) {
      return this.emit(node.val, node);
    })

    /**
     * Negation / escaping
     */

    .set('not', function(node) {
      return this.emit('', node);
    })
    .set('escape', function(node) {
      return this.emit(node.val, node);
    })

    /**
     * Text
     */

    .set('text', function(node) {
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
      var prefix = this.options.dot ? '[^/]' : '[^/.]';
      var prev = this.prev();

      if (prev.type === 'text' && prev.val) {
        return this.emit(node.val, node);
      }

      var val = prefix + '{' + node.val.length + '}';
      if (prev.type === 'bos' && !this.options.dot) {
        val = '(?!\\.)' + val;
      }
      return this.emit(val, node);
    })

    /**
     * Star: "*"
     */

    .set('star', function(node) {
      var prevCh = this.output[this.output.length - 1];
      if (prevCh === ']') {
        return this.emit('*?', node);
      }

      var nextCh = node.rest.charAt(0);
      var isAlpha = prevCh && /[\w.]/.test(prevCh) && nextCh && /[\w.]/.test(nextCh);
      var prefix = !this.dot && !isAlpha && node.rest
        ? (this.options.dot ? '(?!(?:^|\\/)\\.{1,2}(?:$|\\/))(?=.)' : '(?!\\.)')
        : '';

      return this.emit(prefix + star, node);
    })

    /**
     * Plus: "+"
     */

    .set('plus', function(node) {
      var ch = this.output[this.output.length - 1];
      if (!this.output || (/[?*+]/.test(ch) && node.parent.type !== 'bracket')) {
        return this.emit('\\+', node);
      }
      if (/\w/.test(ch) && !node.inside) {
        return this.emit('+\\+?', node);
      }
      return this.emit('+', node);
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
        case '^':
        case '!':
          var next = node.rest.charAt(0);
          if ((next === '' || next === ')' || next === '.') && !node.suffix) {
            return this.emit('\\b)[^/]*?' + node.suffix, node);
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
     * end-of-string
     */

    .set('eos', function(node) {
      return this.emit(node.val, node);
    });
};
