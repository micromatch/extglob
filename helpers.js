'use strict';

module.exports = process;

var regex = {
  extglob: /([?*+@!]{1}[\\]?)(\(([^)]+?)\))/,
  check: /[!?*+@][\(\[][^?]/
};

function tokenize(str, args) {
  var parts = str.split(args[0]);
  var tok = {};
  tok.ch = args[1];
  tok.match = args[0];
  tok.before = parts[0];
  tok.outter = args[2];
  tok.inner = args[3];
  tok.after = parts[1];
  tok.idx = args.index || args[4];
  tok.str = str;
  return tok;
}

var wrap = function (tok) {
  var prefix = !tok.before ? '(?!\\.)' : '';
  if (/\([^()]*$/.test(tok.before)) {
    return tok.post;
  }
  return prefix + '(?=.)' + (tok.before ? tok.before : '') + '__EXT_GLOB__' + tok.post;
};

var syntax = {
  '@': function ampr(tok) {
    tok.post = '(?:' + tok.inner + ')';
    return wrap(tok);
  },
  '?': function ques(tok) {
    tok.post = '(?:' + tok.inner + ')?';
    return wrap(tok);
  },
  '*': function star(tok) {
    tok.post = '(?:' + tok.inner + ')*';
    return wrap(tok);
  },
  '+': function plus(tok) {
    tok.post = '(?:' + tok.inner + ')+';
    return wrap(tok);
  },
  '!': function excl(tok) {
    tok.post = '(?:(?!' + tok.inner + ')[^/]*?)';
    return wrap(tok);
  }
};

function render(ch) {
  return syntax[ch];
}

function hasSyntax(str) {
  return regex.check.test(str);
}

function process(str) {
  if (!hasSyntax(str)) { return str; }
  var re = regex.extglob;

  var match = re.exec(str);
  var parse = tokenize(str, match)
  console.log(parse)

  var res = render(parse.ch)(parse);

  if ((parse.before + parse.match) === str) {
    str = res;
  } else {
    str = str.replace(parse.match, res);
  }

  // var result = str.replace(re, function (_) {
  //   console.log('args: => ', arguments);
  //   var parse = tokenize(str, arguments);
  //   return render(parse.ch)(parse);
  // });

  if (!hasSyntax(str)) {
    return str.split('__EXT_GLOB__').join('');
  }
  return process(str);
}

var esc = {};

var et = esc.et = function et(ch) {
  return esc.escTokens[ch];
};

esc.escape = function escape(str, tok, strip) {
  var to = esc.escTokens[tok];
  var re = regex.escapeRegex[tok];
  return str.replace(re, to);
};

esc.unescape = function unescape(str, toks, strip) {
  var len = toks.length;
  while (len--) {
    var tok = toks[len];
    var from = esc.escTokens[tok];
    var to = esc.unescTokens[from];
    var re = new RegExp(from, 'g');
    str = str.replace(re, strip ? '' : to);
  }
  return str;
};

esc.escTokens = {
  '?': '__ESC_QUES__',
  '@': '__ESC_AMPE__',
  '!': '__ESC_EXCL__',
  '+': '__ESC_PLUS__',
  '*': '__ESC_STAR__',
  '(': '__ESC_LT_PAREN__',
  ')': '__ESC_RT_PAREN__',
  '[': '__ESC_LT_BRACK__',
  ']': '__ESC_RT_BRACK__',
};

esc.unescTokens = {
  '__ESC_QUES__': '?',
  '__ESC_AMPE__': '@',
  '__ESC_EXCL__': '!',
  '__ESC_PLUS__': '+',
  '__ESC_STAR__': '*',
  '__ESC_LT_PAREN__': '(',
  '__ESC_RT_PAREN__': ')',
  '__ESC_LT_BRACK__': '[',
  '__ESC_RT_BRACK__': ']',
};
