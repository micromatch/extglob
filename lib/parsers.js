'use strict';

var brackets = require('expand-brackets');
var define = require('define-property');
var regex = require('regex-not');

/**
 * Negation regex cache
 */

var cache = {};

/**
 * Characters to use in negation regex (we want to "not" match
 * characters that are matched by other parsers)
 */

var NOT_REGEX = '([!@*?+]?\\(|\\)|[*?.+\\\\]|\\[:?(?=.*\\])|:?\\])+';
var not = createRegex(NOT_REGEX);

/**
 * Extglob parsers
 */

module.exports = function(extglob) {

  /**
   * Use `expand-brackets` parsers
   */

  extglob.use(brackets.parsers);
  extglob.parser.sets.paren = extglob.parser.sets.paren || [];
  extglob.parser

    /**
     * Parse extglobs: '!(foo)'
     */

    .capturePair('paren', /^([!@*?+])?\(/, /^\)(\w?)/)

    /**
     * Parse negations
     */

    .capture('not', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\!(?!\()/);
      if (!m || !m[0]) return;

      var prev = this.prev();
      var node = pos({
        type: 'not',
        val: m[0]
      });

      // if nothing has been parsed, we know `!` is at the start,
      // so we need to wrap the result in a negation regex
      if (!parsed) {
        this.bos.val = '(?!^(?:';
        this.append = ')$).*';
        node.val = '';
      }

      define(node, 'parent', prev);
      prev.nodes.push(node);
      return node;
    })

    /**
     * Character parsers
     */

    .capture('escape', /^\\(.)/)
    .capture('qmark', /^\?+(?!\()/)
    .capture('star', /^\*(?!\()/)
    .capture('plus', /^\+(?!\()/)
    .capture('dot', /^\./)
    .capture('text', not);
};

/**
 * Create regex for `text` parser
 */

function createRegex(str) {
  if (cache.hasOwnProperty(str)) {
    return cache[str];
  }
  var opts = {contains: true, strictClose: false};
  var re = regex(str, opts);
  cache[str] = re;
  return re;
}

/**
 * Expose negation regex string
 */

module.exports.not = NOT_REGEX;
