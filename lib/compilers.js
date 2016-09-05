'use strict';

module.exports = function(extglob) {
  extglob.compiler

    /**
     * beginning-of-string
     */

    .set('bos', function(node) {
      return this.emit(node.val);
    })

    /**
     * Negation / escaping
     */

    .set('not', function(node) {
      return this.emit('');
    })
    .set('escape', function(node) {
      return this.emit(node.val);
    })

    /**
     * Text
     */

    .set('text', function(node) {
      return this.emit(node.val);
    })
    .set('dot', function(node) {
      return this.emit('\\' + node.val);
    })

    .set('qmark', function(node) {
      var prev = this.prev();
      if (prev.type === 'text') {
        return this.emit(node.val);
      }

      var val = `[^/]{${node.val.length}}`;
      if (prev.type === 'bos' && !this.options.dot) {
        val = '(?!\\.)' + val;
      }
      return this.emit(val);
    })

    .set('star', function(node) {
      if (node.clamp === true) {
        return this.emit('*');
      }
      return this.emit('[^/]*?');
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
          return this.emit('(?!');
        case '@':
        case '+':
        case '*':
        case '?':
          return this.emit('(');
        default: {
          return this.emit(node.val);
        }
      }
    })
    .set('paren.close', function(node) {
      switch (node.parent.prefix) {
        case '^':
        case '!':
          var next = node.rest.charAt(0);
          if ((next === '' || next === ')') && !node.suffix) {
            return this.emit('\\b)[^/]*?' + node.suffix);
          }

          return this.emit(')[^/]*?' + node.suffix);
        case '+':
          return this.emit(')+' + node.suffix);
        case '*':
          return this.emit(')*' + node.suffix);
        case '?':
          return this.emit(')?' + node.suffix);
        case '@':
        default: {
          return this.emit(')' + node.suffix);
        }
      }
      return this.emit(node.val + node.suffix);
    })

    /**
     * Braces
     */

    .set('brace', function(node) {
      return this.mapVisit(node.nodes);
    })
    .set('brace.open', function(node) {
      return this.emit(node.val);
    })
    .set('brace.close', function(node) {
      return this.emit(node.val);
    })

    /**
     * Brackets
     */

    .set('bracket', function(node) {
      return this.mapVisit(node.nodes);
    })
    .set('bracket.open', function(node) {
      return this.emit(node.val);
    })
    .set('bracket.close', function(node) {
      return this.emit(node.val);
    })
    .set('bracket.literal', function(node) {
      return this.emit('[\\]]');
    })

    /**
     * end-of-string
     */

    .set('eos', function(node) {
      return this.emit(node.val);
    })
};
