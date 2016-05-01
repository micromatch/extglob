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
  return new snapdragon.Parser(extend({}, options))
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
      var m = this.match(/^(?!\[)[!^](?!\()/);
      if (!m) return;

      if (this.nodes.length === 0) {
        this.isNegated = true;
      }
      return pos({
        type: 'negation',
        val: m[0]
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
      var m = this.match(/^\[\](?!.*\])/);
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
        val: m[0]
      };
      this.stack.brackets.push(token);
      return pos(token);
    })
    .use(function() {
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
      this.stack.parens.push(token);
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
        val: m[0]
      };
      this.stack.parens.push(token);
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
      this.stack.parens.push(token);
      return pos(token);
    })
    .use(function() {
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

}

extglobParser.parse = function(pattern, options) {
  var parser = extglobParser(options);
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
