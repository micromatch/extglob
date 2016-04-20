'use strict';

var extend = require('extend-shallow');
var snapdragon = require('snapdragon');
var normalizedCache = {};
var cache = {};

/**
 * Convert the given `extglob` pattern into a regex-compatible string.
 *
 * ```js
 * var extglob = require('extglob');
 * var str = extglob('*.!(*a)');
 * console.log(str);
 * //=> "[^/]*?\.(?![^/]*?a)[^/]*?"
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

function extglob(pattern, options) {
  var opts = extend({}, options);
  if (opts.noextglob === true) {
    return pattern;
  }
  var ast = extglob.parse(normalize(pattern), opts);
  return extglob.render(ast, opts);
}

/**
 * Parse an extglob pattern into an AST that can be passed
 * to the [.render](#render) method.
 *
 * ```js
 * var extglob = require('extglob');
 * var ast = extglob.parse('!(foo|bar)');
 * ```
 * @param {String} `str` Extglob pattern
 * @param {Object} `options`
 * @return {Object} AST
 * @api public
 */

extglob.parse = function(str, options) {
  var parser = new snapdragon.Parser(options);
  var sets = [];

  parser
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\\(.)/);
      if (!m) return;
      return pos({
        type: 'escaped',
        val: m[0],
        esc: m[1]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^[.]/);
      if (!m) return;
      return pos({
        type: 'dot',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\[\]\]/);
      if (!m) return;
      return pos({
        type: 'bracket.literal',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\[\]/);
      if (!m) return;
      return pos({
        type: 'bracket.empty',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\[([!^])?(.)/);
      if (!m) return;
      return pos({
        type: 'bracket.open',
        val: m[0],
        prefix: m[1],
        inner: m[2]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\]/);
      if (!m) return;
      return pos({
        type: 'bracket.close',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\(\)/);
      if (!m) return;

      sets.push(m[1]);
      return pos({
        type: 'paren.empty',
        prefix: m[1],
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^([!^@*?+]?)\(/);
      if (!m) return;

      sets.push(m[1]);
      return pos({
        type: 'paren.open',
        prefix: m[1],
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\)/);
      if (!m) return;

      if (!sets.length) {
        throw new Error('missing opening parenthesis');
      }

      this.isOpen = false;
      var ch = sets.pop();
      var val = ')';

      switch (ch) {
        case '^':
        case '!':
          val = ')[^/]*?';
          break;
        case '+':
          val = ')+';
          break;
        case '*':
          val = ')*';
          break;
        case '?':
          val = ')';
          break;
        case '@':
        default: {
          val = ')';
          break;
        }
      }
      return pos({
        type: 'paren.close',
        val: val
      });
    })

    /**
     * Match `**` followed by anything by `(`
     */

    .use(function() {
      var pos = this.position();
      var m = this.match(/^[*]{2,}(?!\()/);
      if (!m) return;
      return pos({
        type: 'globstar',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^(?!\W)?[*](?!\()/);
      if (!m) return;

      return pos({
        type: 'star',
        prev: this.nodes[this.nodes.length - 1],
        prefix: m[1],
        val: m[0]
      });
    })
   .use(function() {
      var pos = this.position();
      var m = this.match(/^[|]/);
      if (!m) return;
      return pos({
        type: 'pipe',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^(.)?\?/);
      if (!m) return;

      return pos({
        type: 'qmark',
        val: m[1] || ''
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^[+]/);
      if (!m) return;
      return pos({
        type: 'plus',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^-/);
      if (!m) return;
      return pos({
        type: 'dash',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^,/);
      if (!m) return;
      return pos({
        type: 'comma',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\d+/);
      if (!m) return;
      return pos({
        type: 'number',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\w+/);
      if (!m) return;
      return pos({
        type: 'text',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\//);
      if (!m) return;
      return pos({
        type: 'slash',
        val: m[0]
      });
    });

  return parser.parse(str);
};

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

extglob.render = function(ast, options) {
  var renderer = new snapdragon.Renderer(options)
    .set('escaped', function(node)  {
      return node.val;
    })
    .set('paren.empty', function(node)  {
      return '.?';
    })
    .set('paren.open', function(node)  {
      switch (node.prefix) {
        case '!':
        case '^':
          return '(?!';
        case '@':
        case '+':
        case '*':
        case '?':
          return '(?:';
        default: {
          return node.val;
        }
      }
    })
    .set('paren.close', function(node)  {
      return node.val;
    })
    .set('bracket.empty', function(node)  {
      return '\\[\\]';
    })
    .set('bracket.literal', function(node)  {
      return '\\]';
    })
    .set('bracket.open', function(node)  {
      if (/^[\[\]]/.test(node.inner)) {
        node.inner = '\\' + node.inner;
      }
      return '[' + (node.prefix ? '^' : '') + node.inner;
    })
    .set('bracket.close', function(node)  {
      return node.val;
    })
    .set('globstar', function(node)  {
      return '(?:(?!(?:\\\/|^)\\.).)*?';
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
    .set('dot', function(node)  {
      return '\\' + node.val;
    })
    .set('qmark', function(node)  {
      return node.val ? (node.val + '?') : '?';
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
    .set('slash', function(node)  {
      return '\\/';
    })
    .set('number', function(node)  {
      return node.val;
    })
    .set('text', function(node)  {
      return node.val;
    });

  var obj = renderer.render(ast);
  var str = obj.rendered;

  str = str.replace(/^\?/, '');
  str = str.replace(/\?\?$/, '?');
  return str;
}

/**
 * Create a regular expression from the given extglob `pattern`.
 *
 * ```js
 * var extglob = require('extglob');
 * var re = extglob.makeRe('*.!(*a)');
 * console.log(re);
 * //=> /^[^\/]*?\.(?![^\/]*?a)[^\/]*?$/
 * ```
 * @param {String} `pattern` The extglob pattern to convert
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

extglob.makeRe = function(pattern, options) {
  if (cache[pattern]) return cache[pattern];

  options = options || {};

  if (/[*+]$/.test(pattern)) {
    options.strictClose = false;
  }
  if (/^[!^@*?+]/.test(pattern) && options.strictClose === false) {
    options.strictOpen = false;
  }

  var re = !(pattern instanceof RegExp)
    ? regex(extglob(pattern, options), options)
    : pattern;

  cache[pattern] = re;
  return re;
};

/**
 * Returns true if the specified `string` matches the given
 * extglob `pattern`.
 *
 * ```js
 * var extglob = require('extglob');
 *
 * console.log(extglob.isMatch('a.a', '*.!(*a)'));
 * //=> false
 * console.log(extglob.isMatch('a.b', '*.!(*a)'));
 * //=> true
 * ```
 * @param {String} `string` String to match
 * @param {String} `pattern` Extglob pattern
 * @param {String} `options`
 * @return {Boolean}
 * @api public
 */

extglob.isMatch = function(str, pattern, options) {
  return extglob.makeRe(pattern, options).test(str);
};

/**
 * Takes an extglob pattern and returns a matcher function. The returned
 * function takes the string to match as its only argument.
 *
 * ```js
 * var extglob = require('extglob');
 * var isMatch = extglob.matcher('*.!(*a)');
 *
 * console.log(isMatch('a.a'));
 * //=> false
 * console.log(isMatch('a.b'));
 * //=> true
 * ```
 * @param {String} `pattern` Extglob pattern
 * @param {String} `options`
 * @return {Boolean}
 * @api public
 */

extglob.matcher = function(pattern, options) {
  var re = extglob.makeRe(pattern, options);
  return function(str) {
    return re.test(str);
  };
};

/**
 * Takes an array of strings and an extglob pattern and returns a new
 * array that contains only the strings that match the pattern.
 *
 * ```js
 * var extglob = require('extglob');
 * console.log(extglob.match(['a.a', 'a.b', 'a.c'], '*.!(*a)'));
 * //=> ['a.b', 'a.c']
 * ```
 * @param {Array} `arr` Array of strings to match
 * @param {String} `pattern` Extglob pattern
 * @param {Object} `options`
 * @return {Array}
 * @api public
 */

extglob.match = function(arr, pattern, options) {
  arr = Array.isArray(arr) ? arr : [arr];
  var isMatch = extglob.matcher(pattern, options);
  var len = arr.length;
  var idx = -1;
  var res = [];
  while (++idx < len) {
    var ele = arr[idx];
    if (isMatch(ele)) {
      res.push(ele);
    }
  }
  return res;
};

/**
 * Create a regex from the given `string` and `options`
 */

function regex(str, options) {
  var opts = extend({}, options);
  var open = opts.strictOpen === false ? '' : '^';
  var close = opts.strictClose === false ? '' : '$';
  if (opts.contains === true) {
    return new RegExp(str, opts.flags);
  }
  return new RegExp(open + str + close, opts.flags);
}

/**
 * Pre-processs the extglob pattern
 */

function normalize(str) {
  if (normalizedCache[str]) return normalizedCache[str];

  str = str.replace(/^\^|\$$/g, '');
  str = str.split('?|?').join('?)|(?');

  var orig = str;
  var re = /([^!@*?+]*?)([!@*?+])\((([^*]*?)[*]?[.]([^)]*?))\)(.*)/;
  var prefix;
  var first;
  var m;

  while (m = re.exec(str)) {
    if (m[3] && /[*]?[.]\w/.test(m[3])) {
      str = str.replace(/[*][.]/g, '');
      str = m[1] + m[2] + '(' + m[4] + m[5] + ')' + m[6];
      prefix = m[2];
    } else {
      break;
    }
  }

  if (prefix) {
    str = str.replace(/[*]?([!@*?+])\(/g, '*.$1(');
  }

  normalizedCache[orig] = str;
  return str;
}

/**
 * Expose `extglob`
 */

module.exports = extglob;
