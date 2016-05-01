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
    .set('boundary.start', function(node)  {
      return '\\b';
    })
    .set('boundary.end', function(node)  {
      return '\\b';
    })
    .set('negation', function(node)  {
      return '(?!^(?:';
    })
    .set('escaped', function(node)  {
      return node.val;
    })
    .set('parens.open', extglobOpen)
    .set('parens.empty', function(node)  {
      return '.?';
    })
    .set('extglob.open', extglobOpen)
    .set('extglob.close', function(node)  {
      return node.val;
    })
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
    .set('globstar', function(node) {
      return this.options.dot === true
        ? '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?'
        : '(?:(?!(?:\\\/|^)\\.).)*?';
    })
    .set('globname', function(node)  {
      return '([^.]*[.][^.]*)';
    })
    .set('star', function(node)  {
      if (node.prev && node.prev.esc) {
        return '*?';
      } else {
        return '[^/]*?';
      }
    })
    .set('plus', function(node)  {
      return node.val;
    })
    .set('qmark', function(node, nodes, idx)  {
      var prev = nodes[idx - 1];
      if (nodes.length === 1) {
        return '[^/]{0,' + node.val.length + '}';
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
    .set('dash', function(node)  {
      return '-';
    })
    .set('pipe', function(node)  {
      return '|';
    })
    .set('comma', function(node)  {
      return '|';
    })
    .set('dot', function(node, nodes, idx)  {
      var prev = nodes[idx - 1] || {};
      var val = prev.val || '';
      if (idx === 0 || /\/$/.test(val) || this.options.dot === true) {
        return '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))';
      }
      return '(?=.)\\' + node.val;
    })
    .set('slash', function(node)  {
      return '\\/';
    })
    .set('number', function(node)  {
      return node.val;
    })
    .set('text', function(node)  {
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
