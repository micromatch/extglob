'use strict';

var extend = require('extend-shallow');
var snapdragon = require('snapdragon');
var regexCache = {};
var makeReCache = {};
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

  var normalized = set('normalized', normalize, pattern, opts);
  var ast = extglob.parse(normalized, opts);
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
  var sets = {bracket: [], brace: [], paren: []};
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
      var m = this.match(/^\[([!^]*)(.)/);
      if (!m) return;
      var token = {
        type: 'bracket.open',
        prefix: m[1],
        infix: m[2],
        sets: sets,
        val: m[0]
      };
      sets.bracket.push(token);
      return pos(token);
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\]/);
      if (!m) return;

      var token = sets.bracket.pop() || {};
      var prefix = token.prefix;

      if (typeof prefix === 'undefined') {
        if (parser.options.strict === true) {
          throw new Error('missing opening bracket');
        }
        token = {type: 'bracket.open', val: '['};
      }

      return pos({
        type: 'bracket.close',
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
        type: 'paren.empty',
        prefix: m[1],
        val: m[0]
      };
      sets.paren.push(token);
      return pos(token);
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^([!^@*?+])\(/);
      if (!m) return;
      var token = {
        type: 'extglob.open',
        prefix: m[1],
        sets: sets,
        val: m[0]
      };
      sets.paren.push(token);
      return pos(token);
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^(?![!^@*?+])\((\??[!:])?/);
      if (!m) return;
      var token = {
        type: 'paren.open',
        prefix: m[1],
        sets: sets,
        val: m[0]
      };
      sets.paren.push(token);
      return pos(token);
    })
    .use(function() {
      var pos = this.position();
      var m = this.match(/^\)/);
      if (!m) return;

      var token = sets.paren.pop() || {};
      var prefix = token.prefix;
      var val = ')';

      if (typeof prefix === 'undefined') {
        if (parser.options.strict === true) {
          throw new Error('missing opening brace');
        }
        token = {type: 'brace.open', val: '('};
      }

      switch (prefix) {
        case '^':
        case '!':
          if (/\w/i.test(this.input.charAt(0))) {
            val = '))[^/]*?';
          } else {
            val = ')\\b)[^/]*?';
          }
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
          break;
        }
      }

      return pos({
        type: 'extglob.close',
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
      var m = this.match(/^(.)?\?+/);
      if (!m) return;
      var re = /(?=^|\W(?=.))[?]+(?![(])/;
      return pos({
        type: 'qmark',
        esc: re.test(m[0]),
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
      var m = this.match(/^[+]/);
      if (!m) return;
      return pos({
        type: 'plus',
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

  var ast = parser.parse(str);

  /**
   * Fix missing => `[]`, `{}`, `()`
   */

  for (var key in sets) {
    if (sets.hasOwnProperty(key)) {
      sets[key].forEach(function(token) {
        if (token.type === key + '.open') {
          token.val = '\\' + token.val;
          token.esc = true;
        }
      });
    }
  }
  return ast;
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
  function extglobOpen(node)  {
    switch (node.prefix) {
      case '!':
      case '^':
        return '(?!(?:';
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
    .set('escaped', function(node)  {
      return node.val;
    })
    .set('paren.empty', function(node)  {
      return '.?';
    })
    .set('paren.open', extglobOpen)
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
      if (/^[\[\]]/.test(node.infix)) {
        node.infix = '\\' + node.infix;
      }
      return '[' + (node.prefix ? '^' : '') + node.infix;
    })
    .set('bracket.close', function(node)  {
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
    .set('qmark', function(node, nodes, i)  {
      if (nodes.length === 1) {
        return '[^/]{0,' + node.val.length + '}';
      }

      var prev = nodes[i - 1];
      if (typeof prev === 'undefined' || prev.type === 'extglob.close') {
        return node.prefix || '';
      }
      return node.val;
    })
    .set('plus', function(node)  {
      return node.val;
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
    .set('dot', function(node)  {
      return '\\' + node.val;
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

  var res = renderer.render(ast);
  var str = res.rendered;
  if (renderer.options.literal === true) {
    str = escapeRe(renderer.original);
  }
  return str;
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
  options = options || {};
  var key = pattern;

  if (/[*+]$/.test(pattern)) {
    options.strictClose = false;
    key += ':false';
  }

  if (/^[!^@*?+]/.test(pattern) && options.strictClose === false) {
    options.strictOpen = false;
    key += ':false';
  }

  key += options.literal;
  if (makeReCache.hasOwnProperty(key)) {
    return makeReCache[key];
  }

  var re = !(pattern instanceof RegExp)
    ? regex(extglob(pattern, options), options)
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
  var contains = opts.contains;
  var regex;

  var key = str + ':' + open + ':' + close + ':' + contains;
  if (regexCache.hasOwnProperty(key)) {
    return regexCache[key];
  }

  if (contains === true) {
    regex = new RegExp(str, opts.flags);
  } else {
    regex = new RegExp(open + str + close, opts.flags);
  }

  regexCache[key] = regex;
  return regex;
}

/**
 * Cache patterns
 *
 * @param {String} `type` Pattern "type"
 * @param {Function} `fn` Function to call when the pattern isn't cached yet
 * @param {String} `pattern`
 * @param {String} `options`
 */

function set(type, fn, pattern, options) {
  var obj = cache[type] || (cache[type] = {});
  if (obj.hasOwnProperty(pattern)) {
    return obj[pattern];
  }
  obj[pattern] = fn(pattern, options);
  return obj[pattern];
}

/**
 * Pre-processs the extglob pattern
 */

function normalize(str) {
  str = str.replace(/^\^|\$$/g, '\\b');
  str = str.split('?|?').join('?)|(?');

  var re = /([^!@*?+]*?)([!@*?+])\((([^*]*?)[*]?[.]([^)]*?))\)(.*)/;
  var prefix;
  var m;

  while ((m = re.exec(str))) {
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
  return str;
}

function escapeRe(str) {
  str = str.split('\\').join('');
  return str.replace(/[|{}()[\]^$+*?.]/g, '\\$&');
}

/**
 * Expose `extglob`
 */

module.exports = extglob;
