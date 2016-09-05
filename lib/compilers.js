'use strict';

module.exports = function(extglob) {
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
      var prev = this.prev();
      if (prev.type === 'text') {
        return this.emit(node.val, node);
      }

      var val = '[^/]{' + node.val.length + '}';
      if (prev.type === 'bos' && !this.options.dot) {
        val = '(?!\\.)' + val;
      }
      return this.emit(val, node);
    })

    /**
     * Star: "*"
     */

    .set('star', function(node) {
      if (node.loose === true) {
        return this.emit('*', node);
      }
      return this.emit('[^/]*?', node);
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
     * Braces
     */

    .set('brace', function(node) {
      return this.mapVisit(node.nodes);
    })
    .set('brace.open', function(node) {
      return this.emit(node.val, node);
    })
    .set('brace.close', function(node) {
      return this.emit(node.val, node);
    })

    /**
     * Brackets
     */

    .set('bracket', function(node) {
      return this.mapVisit(node.nodes);
    })
    .set('bracket.open', function(node) {
      return this.emit(node.val, node);
    })
    .set('bracket.close', function(node) {
      return this.emit(node.val, node);
    })
    .set('bracket.literal', function(node) {
      return this.emit('[\\]]', node);
    })

    /**
     * end-of-string
     */

    .set('eos', function(node) {
      return this.emit(node.val, node);
    });
};
