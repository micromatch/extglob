'use strict';

var extend = require('extend-shallow');
var snapdragon = require('snapdragon');

/**
 * Render a string from an extglob AST.
 *
 * ```js
 * var extglob = require('extglob');
 * var ast = extglob.parse('!(foo|bar)');
 * var str = extglob.render(ast);
 * ```
 * @param {Object} `ast` Extglob pattern
 * @param {Object} `options`
 * @return {String} Returns a regex-compatible string.
 * @api public
 */

function extglobRenderer(options) {
  function extglobOpen(node)  {
    switch (node.prefix) {
      case '!':
      case '^':
        return '(?:(?!(?:';
      case '@':
      case '+':
      case '*':
      case '?':
        return '(?:';
      default: {
        return node.val;
      }
    }
  }

  return new snapdragon.Renderer(extend({}, options))
    .set('negation', function(node)  {
      return '(?!^(?:';
    })
    .set('escaped', function(node)  {
      return node.val;
    })

    /**
     * Parens
     */

    .set('parens.open', extglobOpen)
    .set('parens.empty', function(node)  {
      return '.?';
    })
    .set('extglob.open', extglobOpen)
    .set('extglob.close', function(node)  {
      return node.val;
    })

    /**
     * Brackets
     */

    .set('bracket.empty', function(node)  {
      return '\\[\\]';
    })
    .set('bracket.literal', function(node)  {
      return '\\]';
    })
    .set('bracket.open', function(node)  {
      if (node.inner && /^[\[\]]/.test(node.inner)) {
        node.inner = '\\' + node.inner;
      }
      return '[' + (node.prefix ? '^' : '') + node.inner;
    })
    .set('bracket.close', function(node)  {
      return node.val;
    })

    /**
     * Globs
     */

    .set('globstar', function(node) {
      return this.options.dot === true
        ? '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?'
        : '(?:(?!(?:\\\/|^)\\.).)*?';
    })
    .set('globname', function(node)  {
      return '(?:[^.]*[.][^.]*)';
    })
    .set('star', function(node)  {
      var prev = this.prev();
      if (prev.esc) {
        return '*?';
      } else {
        return '[^/]*?';
      }
    })

    /**
     * Special chars
     */

    .set('qmark', function(node, nodes, idx)  {
      var prev = this.prev();
      if (nodes.length === 1) {
        return '[^/]{' + node.val.length + '}';
      }
      if (typeof prev === 'undefined' || prev.type === 'extglob.close') {
        return node.prefix || '';
      }
      if (prev.type === 'escaped') {
        return '[^/]';
      }
      if (prev.val === '*') {
        return '[^/]';
      }
      return node.val;
    })
    .set('qmark.or', function(node)  {
      return '?)|(?:';
    })
    .set('dot', function(node, nodes, idx)  {
      var prev = this.prev();
      var val = prev.val || '';
      if (idx === 0 || /\/$/.test(val) || this.options.dot === true) {
        return '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))';
      }
      return '(?=.)\\' + node.val;
    })
    .set('comma', function(node)  {
      return '|';
    })
    .set('slash', function(node)  {
      return '\\/';
    })

    /**
     * Literals
     */

    .set('literal', function(node)  {
      return node.val;
    })
    .set('plus', function(node)  {
      return node.val;
    })
    .set('end', function(node)  {
      return node.val;
    });
};

extglobRenderer.render = function(ast, options) {
  if (ast == null || typeof ast !== 'object') {
    throw new TypeError('expected ast to be an object');
  }
  var renderer = extglobRenderer(options);
  return renderer.render(ast);
};

extglobRenderer.stringify = function(ast, options) {
  var result = extglobRenderer.render(ast, options);
  return result.rendered;
};

/**
 * expose `extglobRenderer`
 */

module.exports = extglobRenderer;
