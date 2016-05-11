'use strict';

var extend = require('extend-shallow');
var snapdragon = require('snapdragon');

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

function extglobParser(options) {
  var parser = new snapdragon.Parser(extend({}, options));

  function set(name, re) {
    parser.set(name, function() {
      var pos = this.position();
      var m = this.match(re);
      if (!m) return;
      var inside = {
        braces: this.isInside('braces'),
        brackets: this.isInside('brackets'),
        parens: this.isInside('parens')
      };
      inside.any = (inside.braces || inside.brackets || inside.parens);
      if (name === 'globstar') {
        this.pattern.hasGlobstar = true;
      }

      return pos({
        type: name,
        inside: inside,
        val: m[0]
      });
    });
  }

  set('bracket.empty', /^\[\](?!.*\])/);
  set('bracket.literal', /^\[\]\]/);
  set('globname', /^\([*][.][*]\)/);
  set('globstar', /^[*]{2,}(?!\()/);
  set('qmark.or', /^(?=.)[?][|][?](?=.)/);
  set('slash', /^\//);
  set('comma', /^[,]/);

  if (!parser.options.globParser) {
    set('dot', /^[.]/);
    set('literal', /^[-\/\w\d,|]+/);

    parser.set('qmark', function() {
      var pos = this.position();
      var m = this.match(/^(.)?\?+(?![|])/);
      if (!m) return;
      return pos({
        type: 'qmark',
        prefix: m[1],
        val: m[0]
      });
    });
  }

  parser.set('escaped', function() {
    var pos = this.position();
    var m = this.match(/^\\(.)/);
    if (!m) return;
    var esc = m[1];
    return pos({
      type: 'escaped',
      val: m[0],
      esc: m[1]
    });
  });

  parser.set('negation', function() {
    var pos = this.position();
    var m = this.match(/^(?!\[)[!^](?!\()/);
    if (!m) return;

    if (this.nodes.length === 0) {
      this.isNegated = true;
    }
    return pos({
      type: 'negation',
      val: m[0]
    });
  });

  parser.set('bracket.open', function() {
    var pos = this.position();
    var m = this.match(/^\[([!^])?(.)?/);
    if (!m) return;
    var token = {
      type: 'bracket.open',
      prefix: m[1],
      inner: m[2],
      val: m[0]
    };
    this.stack.brackets.push(token);
    return pos(token);
  });

  parser.set('bracket.close', function() {
    var pos = this.position();
    var m = this.match(/^\]/);
    if (!m) return;

    var token = this.stack.brackets.pop() || {};
    var prefix = token.prefix;

    if (typeof prefix === 'undefined') {
      if (this.options.strictbrackets === true) {
        throw new Error('missing opening bracket');
      }
      token = {type: 'bracket.open', val: '['};
    }

    return pos({
      type: 'bracket.close',
      open: token,
      prefix: prefix,
      val: m[0]
    });
  });

  parser.set('parens.empty', function() {
    var pos = this.position();
    var m = this.match(/^\(\)/);
    if (!m) return;
    var token = {
      type: 'parens.empty',
      prefix: m[1],
      val: m[0]
    };
    this.stack.parens.push(token);
    return pos(token);
  });

  parser.set('extglob.open', function() {
    var pos = this.position();
    var m = this.match(/^([!^@*?+])\(/);
    if (!m) return;
    var token = {
      type: 'extglob.open',
      idx: this.nodes.length,
      parent: this.parent('parens'),
      prefix: m[1],
      val: m[0]
    };

    this.stack.parens.push(token);
    return pos(token);
  });

  parser.set('parens.open', function() {
    var pos = this.position();
    var m = this.match(/^(?![!^@*?+])\(/);
    if (!m) return;
    var token = {
      type: 'parens.open',
      val: m[0]
    };
    this.stack.parens.push(token);
    return pos(token);
  });

  parser.set('extglob.close', function() {
    var pos = this.position();
    var m = this.match(/^\)/);
    if (!m) return;

    var token = this.stack.parens.pop() || {};
    var prefix = token.prefix;
    var val = '';

    if (typeof prefix === 'undefined') {
      if (this.options.strictparens === true) {
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
  });

  parser.set('star', function() {
    var pos = this.position();
    var m = this.match(/^[*](?!\()/);
    if (!m) return;
    var val = m[0];
    return pos({
      type: 'star',
      val: val
    });
  });

  parser.set('plus', function() {
    var pos = this.position();
    var m = this.match(/^[+](?!\()/);
    if (!m) return;
    return pos({
      type: 'plus',
      val: m[0]
    });
  });

  return parser;
}

extglobParser.parse = function(pattern, options) {
  var parser = extglobParser(options);
  parser
    .use(parser.get('escaped'))
    .use(parser.get('negation'))
    .use(parser.get('dot'))

    .use(parser.get('bracket.literal'))
    .use(parser.get('bracket.empty'))
    .use(parser.get('bracket.open'))
    .use(parser.get('bracket.close'))

    .use(parser.get('parens.empty'))
    .use(parser.get('extglob.open'))
    .use(parser.get('parens.open'))
    .use(parser.get('extglob.close'))

    .use(parser.get('globstar'))
    .use(parser.get('globname'))
    .use(parser.get('star'))
    .use(parser.get('plus'))
    .use(parser.get('qmark.or'))
    .use(parser.get('qmark'))
    .use(parser.get('comma'))
    .use(parser.get('slash'))
    .use(parser.get('literal'));

  var first = pattern.charAt(0);
  if (first !== '.') {
    if (!/^([!^@*?+]\()/.test(pattern)) {
      parser.prefix = '(?!\\.)(?=.)';
    } else {
      parser.prefix = '';
    }
  }

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
  for (var key in parser.stack) {
    if (parser.stack.hasOwnProperty(key)) {
      parser.stack[key].forEach(function(token) {
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
 * expose `extglobParser`
 */

module.exports = extglobParser;
