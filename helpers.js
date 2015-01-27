

var tokenize = {
  extglob: function(str, args) {
    var tok = {};
    tok.orig   = str;
    tok.match  = args[0];
    tok.before = args[1];
    tok.pre    = args[2];
    tok.out    = args[3];
    tok.inner  = args[4];
    tok.idx    = args[5];
    return tok;
  }
};

var renderers = {
  extglob: function(tok) {
    return tok.before + '(' + tok.inner + ')' + tok.pre;
  }
};

var wrap = renderers['extglob'];

function render(syntax) {
  // return fn[]
}

var fn = {
  extglob: {
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
};

var regex = {
  extglob: /([^?*+@!]*)([?*+@!]{1})(\(([^)]+)\))/g
};

var ch = {
  '?': '__fn_QM__',
  '*': '__fn_ST__',
  '+': '__fn_PL__',
  '!': '__fn_EX__',
  '@': '__fn_AT__',
};


function interpolate(str, syntax) {
  var parser = tokenize[syntax];
  var re = regex[syntax];

  return str.replace(re, function (_, before, ch) {
    var args = [].slice.call(arguments);
    var parse = parser(str, args);
    return fn[syntax][ch](parse);
  });
}

// function render (helpers, prop) {
//   var res = new Function('helpers', 'prop', 'return helpers[prop]');
//   console.log(res)
//   return res;
// }

var res = interpolate('a/b/c/!(d|e)/?(f|g)/h', 'extglob');
console.log(res)
