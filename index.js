'use strict';

var extend = require('extend-shallow');
var snapdragon = require('snapdragon');
var makeReCache = {};
var regexCache = {};

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

  if (opts.literal === true) {
    return escapeRe(pattern);
  }

  var ast = extglob.parse(pattern, opts);
  var res = extglob.render(ast, opts);

  if (ast.hasOwnProperty('strictopen')) {
    opts.strictopen = ast.strictopen;
  }

  if (ast.hasOwnProperty('strictclose')) {
    opts.strictclose = ast.strictclose;
  }

  var open = opts.strictopen === false ? '' : '^';
  var close = opts.strictclose === false ? '' : '$';
  return open + ast.prefix + res.rendered + close;
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

extglob.parse = function(pattern, options) {
  var opts = extend({}, options);
  var parser = new snapdragon.Parser(opts);
  var sets = {bracket: [], brace: [], paren: []};

  var first = pattern.charAt(0);
  if (first !== '.') {
    if (!/^([!^@*?+]\()/.test(pattern)) {
      parser.prefix = '(?!\\.)(?=.)';
    } else {
      parser.prefix = '';
    }
  }

  parser
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\^(?=.)/);
      if (!m) return;
      return pos({
        type: 'boundary.start',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/(?=.\$)\$$/);
      if (!m) return;
      return pos({
        type: 'boundary.end',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^[!](?!\()/);
      if (!m) return;

      if (this.nodes.length === 0) {
        this.isNegated = true;
      }

      return pos({
        type: 'exclamation',
        val: m[0]
      });
    })
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
        type: 'brackets.literal',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\[\](?!.*\])/);
      if (!m) return;
      return pos({
        type: 'brackets.empty',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\[([!^]*)(.)/);
      if (!m) return;
      var token = {
        type: 'brackets.open',
        prefix: m[1],
        infix: m[2],
        sets: sets,
        val: m[0]
      };
      this.sets.brackets.push(token);
      return pos(token);
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\]/);
      if (!m) return;

      var token = this.sets.brackets.pop() || {};
      var prefix = token.prefix;

      if (typeof prefix === 'undefined') {
        if (parser.options.strictbrackets === true) {
          throw new Error('missing opening bracket');
        }
        token = {type: 'brackets.open', val: '['};
      }

      return pos({
        type: 'brackets.close',
        prev: token,
        prefix: prefix,
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\(\)/);
      if (!m) return;
      var token = {
        type: 'parens.empty',
        prefix: m[1],
        val: m[0]
      };
      this.sets.parens.push(token);
      return pos(token);
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^([!^@*?+])\(/);
      if (!m) return;
      var token = {
        type: 'extglob.open',
        idx: this.nodes.length,
        prefix: m[1],
        sets: sets,
        val: m[0]
      };
      this.sets.parens.push(token);
      return pos(token);
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^(?![!^@*?+])\(/);
      if (!m) return;
      var token = {
        type: 'parens.open',
        val: m[0]
      };
      this.sets.parens.push(token);
      return pos(token);
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\)/);
      if (!m) return;

      var token = this.sets.parens.pop() || {};
      var prefix = token.prefix;
      var val = '';

      if (typeof prefix === 'undefined') {
        if (parser.options.strictparens === true) {
          throw new Error('missing opening paren');
        }
        token = {type: 'parens.open', val: '('};
      }

      switch (prefix) {
        case '^':
        case '!':
          if (this.input) {
            var next = this.input.charAt(0);
            if (/\w/i.test(next)) {
              val = ')).*?)';
            } else if (next === '?') {
              val = ')\\b)[^/])';
            } else if (next === '*') {
              val = '(?=.))$).*)';
            } else {
              if (next === this.input) {
                var infix = this.nodes[token.idx + 1];
                if (infix && /[*+]/.test(infix.val)) {
                  this.strictclose = false;
                }
              }
              val = ')\\b).*)';
            }
          } else {
            val = ')$).*)';
          }
          break;
        case '+':
          val = ')+';
          break;
        case '*':
          val = ')*';
          break;
        case '?':
        case '@':
        default: {
          val = ')';
          break;
        }
      }

      return pos({
        type: 'extglob.close',
        prefix: prefix,
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
      var m = this.match(/^[*][.][*]/);
      if (!m) return;
      return pos({
        type: 'globname',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^[*](?!\()/);
      if (!m) return;
      var prev = this.nodes[this.nodes.length - 1];
      var val = m[0];
      return pos({
        type: 'star',
        prev: prev,
        val: val
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^[+](?!\()/);
      if (!m) return;
      var prev = this.nodes[this.nodes.length - 1];
      return pos({
        type: 'plus',
        prev: prev,
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^(?=.)[?][|][?](?=.)/);
      if (!m) return;
      return pos({
        type: 'qmark.or',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^(.)?\?+(?![|])/);
      if (!m) return;

      return pos({
        type: 'qmark',
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
      var m = this.match(/^[-]/);
      if (!m) return;
      return pos({
        type: 'dash',
        val: m[0]
      });
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^[,]/);
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

  var ast = parser.parse(pattern);
  if (ast.isNegated) {
    ast.nodes.push({
      type: 'end',
      val: ')$).*'
    });
  }

  fixMissingBrackets(parser);
  return ast;
};

/**
 * Fix missing => `[]`, `{}`, `()`
 */

function fixMissingBrackets(parser) {
  for (var key in parser.sets) {
    if (parser.sets.hasOwnProperty(key)) {
      parser.sets[key].forEach(function(token) {
        if (token.type === key + '.open') {
          if (parser.options['strict' + key] === true) {
            throw parser.error(['missing opening', key + ': "' + parser.parsed + '"'], token);
          }
          token.val = '\\' + token.val;
          token.esc = true;
        }
      });
    }
  }
}

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
  if (ast == null || typeof ast !== 'object') {
    throw new TypeError('expected ast to be an object');
  }

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

  var renderer = new snapdragon.Renderer(options)
    .set('boundary.start', function(node)  {
      return '\\b';
    })
    .set('boundary.end', function(node)  {
      return '\\b';
    })
    .set('exclamation', function(node)  {
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
    .set('brackets.empty', function(node)  {
      return '\\[\\]';
    })
    .set('brackets.literal', function(node)  {
      return '\\]';
    })
    .set('brackets.open', function(node)  {
      if (/^[\[\]]/.test(node.infix)) {
        node.infix = '\\' + node.infix;
      }
      return '[' + (node.prefix ? '^' : '') + node.infix;
    })
    .set('brackets.close', function(node)  {
      return node.val;
    })
    .set('globstar', function(node)  {
      return '(?:(?!(?:\\\/|^)\\.).)*?';
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

  return renderer.render(ast);
};

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
  var opts = extend({}, options);
  var key = pattern;

  if (/[*+]$/.test(pattern)) {
    opts.strictclose = false;
  }

  for (var prop in opts) {
    if (opts.hasOwnProperty(prop)) {
      key += ':' + String(opts[prop]);
    }
  }

  if (makeReCache.hasOwnProperty(key)) {
    return makeReCache[key];
  }

  var re = !(pattern instanceof RegExp)
    ? regex(extglob(pattern, opts), opts)
    : pattern;

  makeReCache[key] = re;
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
  arr = [].concat(arr);
  var opts = extend({}, options);
  var isMatch = extglob.matcher(pattern, opts);
  var len = arr.length;
  var idx = -1;
  var res = [];
  while (++idx < len) {
    var ele = arr[idx];
    if (isMatch(ele)) {
      res.push(ele);
    }
  }

  if (res.length === 0 && opts.nonull === true) {
    return [pattern];
  }

  return res;
};

/**
 * Create a regex from the given `string` and `options`
 */

function regex(str, options) {
  var opts = extend({}, options);
  var key = str;
  for (var prop in opts) {
    if (opts.hasOwnProperty(prop)) {
      key += ':' + String(opts[prop]);
    }
  }

  if (regexCache.hasOwnProperty(key)) {
    return regexCache[key];
  }

  var re = new RegExp(str, opts.flags);
  regexCache[key] = re;
  return re;
}

/**
 * Escape regex characters in the given string
 */

function escapeRe(str) {
  str = str.split('\\').join('');
  return str.replace(/[|{}()[\]^$+*?.]/g, '\\$&');
}

/**
 * Expose `extglob`
 */

module.exports = extglob;
