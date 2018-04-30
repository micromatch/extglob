'use strict';

const brackets = require('expand-brackets');
const utils = require('./utils');

/**
 * Characters to use in text regex (we want to "not" match
 * characters that are matched by other parsers)
 */

const TEXT_REGEX = '([!@*?+]?\\(|\\)|[*?.+\\\\]|\\[:?(?=.*\\])|:?\\])+';
const not = utils.createRegex(TEXT_REGEX);

/**
 * Extglob parsers
 */

function parsers(extglob) {
  extglob.state = extglob.state || {};

  /**
   * Use `expand-brackets` parsers
   */

  extglob.use(brackets.parsers);
  extglob.parser.sets.paren = extglob.parser.sets.paren || [];
  extglob.parser

    /**
     * Extglob open: "*("
     */

    .set('paren.open', function() {
      const pos = this.position();
      const m = this.match(/^([!@*?+])?\(/);
      if (!m) return;

      const prev = this.prev();
      const prefix = m[1];
      const val = m[0];

      const open = pos({
        type: 'paren.open',
        val
      });

      const node = pos({
        type: 'paren',
        prefix,
        nodes: []
      });

      // if nested negation extglobs, just cancel them out to simplify
      if (prefix === '!' && prev.type === 'paren' && prev.prefix === '!') {
        prev.prefix = '@';
        node.prefix = '@';
      }

      this.pushNode(node, prev);
      this.pushNode(open, node);
      this.push('paren', node);
    })

    /**
     * Extglob close: ")"
     */

    .set('paren.close', function() {
      const parsed = this.parsed;
      const pos = this.position();
      const m = this.match(/^\)/);
      if (!m) return;

      const parent = this.pop('paren');
      const node = pos({
        type: 'paren.close',
        rest: this.input,
        parsed,
        val: m[0]
      });

      if (!this.isType(parent, 'paren')) {
        if (this.options.strict) {
          throw new Error('missing opening paren: "("');
        }
        node.escaped = true;
        return node;
      }

      node.prefix = parent.prefix;
      this.pushNode(node, parent);
    })

    /**
     * Escape: "\\."
     */

    .set('escape', function() {
      const pos = this.position();
      const m = this.match(/^\\(.)/);
      if (!m) return;

      return pos({
        type: 'escape',
        val: m[0],
        ch: m[1]
      });
    })

    /**
     * Question marks: "?"
     */

    .set('qmark', function() {
      const parsed = this.parsed;
      const pos = this.position();
      const m = this.match(/^\?+(?!\()/);
      if (!m) return;
      extglob.state.metachar = true;
      return pos({
        type: 'qmark',
        rest: this.input,
        parsed,
        val: m[0]
      });
    })

    /**
     * Character parsers
     */

    .capture('star', /^\*(?!\()/)
    .capture('plus', /^\+(?!\()/)
    .capture('dot', /^\./)
    .capture('text', not);
};

/**
 * Expose text regex string
 */

module.exports.TEXT_REGEX = TEXT_REGEX;

/**
 * Extglob parsers
 */

module.exports = parsers;
