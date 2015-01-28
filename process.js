var braces = require('braces');
var expand = require('expand-range');

module.exports = process;

var tokenizers = {
  extglob: function(str, args) {
    var tok = {};
    tok.orig   = str;
    tok.match  = args[0];
    tok.before = args[1];
    tok.pre    = args[2];
    tok.outter = args[3];
    tok.inner  = args[4];
    tok.idx    = args[5];
    return tok;
  },
  braces: function(str, args) {
    var tok = {};
    tok.orig   = str;
    tok.match  = args[0];
    tok.before = args[1];
    tok.outter = args[2] + args[3];
    tok.inner  = args[4];
    tok.idx    = args[5];
    return tok;
  }
};

var renderers = {
  extglob: function(tok) {
    return tok.before + '(' + tok.inner + ')' + tok.pre;
  },
  braces: function(tok) {
    var res = expand(tok.inner, {makeRe: true})[0];
    if (res === tok.inner || res.charAt(0) !== '(' && res.charAt(0) !== '[') {
      res = tok.outter;
    }
    return tok.before + res;
  }
};

var fn = {
  extglob: function (wrap) {
    return {
      '?': function(tok) {
        return wrap(tok);
      },
      '*': function(tok) {
        return wrap(tok);
      },
      '+': function(tok) {
        return wrap(tok);
      },
      '!': function(tok) {
        return wrap(tok);
      },
      '@': function(tok) {
        return wrap(tok);
      }
    }
  },
  braces: function (wrap) {
    return {
      '{': function (tok) {
        return wrap(tok);
      }
    }
  }
};

var regex = {
  extglob: /([^?*+@!]*)([?*+@!]{1})(\(([^)]+)\))/g,
  braces: /([^{]*)(\{)(([^{}]+?)\})/g,
};

var ch = {
  glob: ['*'],
  extglob: ['(', '['],
  braces: ['{'],
};

function has (str, ch) {
  return !!~str.indexOf(ch);
}

function check(str, syntax) {
  var delims = ch[syntax];
  var len = delims.length;

  while (len--) {
    if (has(str, delims[len])) {
      return true;
    }
  }
  return false;
}

function render(syntax, ch) {
  var wrap = renderers[syntax];
  return fn[syntax](wrap)[ch];
}

function process(str) {
  var hasSyntax = check(str, 'extglob');
  if (!hasSyntax) { return str; }

  var parser = tokenizers['extglob'];
  var re = regex['extglob'];

  return str.replace(re, function (_, before, ch) {
    var args = [].slice.call(arguments);

    var parse = parser(str, args);
    return render('extglob', ch)(parse);
  });
}

// var str = 'a/**/b/{c,d,{1..9}}/!(d|e)/?(f|g)/{h,i}';

// console.log(process(str, 'extglob'));
// console.log(process(str, 'extglob'));
