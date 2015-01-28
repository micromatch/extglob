/*!
 * extglob <https://github.com/jonschlinkert/extglob>
 *
 * Copyright (c) 2015 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

module.exports = extglob;

function extglob(str) {
  if (!(extGlobRe instanceof RegExp)) {
    extGlobRe = extGlobRegex();
  }

  var matches = str.match(extGlobRe) || [];
  console.log(matches)
  var m = matches[0];

  switch(m) {
    case '$':
      return ''
    case '\\':
      return ''
    case '@':
      return ''
    case '!':
      return ''
    case '*':
      return ''
    case '+':
      return ''
    case '?':
      return ''

  }
  return m;
};

var extGlobRe;

function extGlobRegex() {
  if (!(extGlobRe instanceof RegExp)) {
    extGlobRe = /([^?*+@!]*)([?*+@!]{1})(\(([^)]+)\))/g;
  }
  // return /([?*+@!]{1})(\(([^)]+)\))/g;
  // return /([^?*+@!]*)([?*+@!]{1})(\(([^)]+)\))/g;
  return extGlobRe;
}




function extglob2(glob, type) {
  console.log('before:', glob)
  var re = /([^?*+@!]*)(\.)?([?*+@!]{1})(\(([^)]+)\))/;
  var match = re.exec(glob);

  if (match) {
    var prefix = match[2];
    var inner = match[4];
    if (inner.indexOf('{') !== -1) {
      return glob;
    }

    // inner = esc(inner.replace(/\*/g, '.*'));
    console.log(match)
    // var res = esc('[^/]*?');
    var res = '';
    switch(prefix) {
      case '?':
        res += esc('(?:' + inner + ')?');
        break;
      case '*':
      case '+':
        res += esc('(?:') + inner + ')';
        break;
      case '!':
        // res += esc('(?:' + inner + ')?')
        res += esc('((?!') + inner + esc(').*?)');
        break;
      case '@':
        break;
      default:
        return glob;
        break;
    }
    glob = glob.replace(match[0], res);

    console.log('after:', unesc(glob));
    return glob;
    // glob = glob.replace(match[0], '(' + inner + ')' + prefix);

  }

  return glob.replace(/(\.)?([?*+@!]{1})(\(([^)]+)\))/, function (match, $1, prefix, $3, $4) {
    // console.log('args:', [].slice.call(arguments))
    if (!prefix || !$3 || !$4 || $4.indexOf('{') !== -1) {
      return match;
    }
    var res;

    if (prefix === '?') { res = '(?:' + $4 + ')?'; }

    if (prefix === '*' || prefix === '+') {
      res = esc('(?:') + $4 + ')';
    }

    if (prefix === '!') {
      res = esc('((?!') + $4 + esc(').*?)');
    }
        console.log('after:', unesc(res));

    return res || match;
  });
}

// if (matches.indexOf('!(') !== -1 || matches.indexOf('?(') !== -1) {
//   res.push({
//     re: /([^*!?.\/]*?)(\!\(([^)]*)\))/g,
//     str: function (token, $1, $2, $3) {
//       // /^(?:(?=.)a[^/]*?(?:(?!x)[^/]*?))$/
//       // /^(?:a(?!\.)(?=.)[^\/]*?(?!x)[^\/]*?)$/
// console.log(arguments)
//       // return '(_QMARK_=.)' + $1 + '[^/]_SQ_(_QMARK_!' + $2 + ')_SQ_';
//       var len = $3.length;
//       if (len === 1) {
//         return token.replace($2, '[^' + $3 + ']');
//       }
//       return token.replace($2, '(_QMARK_!' + $3 + ')[^/]_SQ_');
//     }
//   });
// }

function parseGlob(str) {
  if (!(extGlobRe instanceof RegExp)) {
    extGlobRe = extGlobRegex();
  }

  var m = str.match(extGlobRe) || [];
  var before = m[1];
  var dot = null;

  if (before.slice(-1) === '.') {
    before = before.slice(0, m[1].length - 1);
    dot = '.';
  }

  return {
    match: m[0],
    before: before,
    dot: dot,
    prefix: m[2],
    outter: m[3],
    inner: m[4]
  }
}

// console.log(parseGlob('a/b/c/!(d|e)/f'))
// console.log(parseGlob('a/b/c/.!(d|e)/f'))

function interpolate(template, data) {
  if (arguments.length < 2) {
    return interpolate.bind(null, template);
  }

  var matches = [];

  template.replace(extGlobRegex(),
    function (_, before, pre, out, inner, idx) {
      matches.push({
        orig: template,
        match: _,
        before: before,
        pre: pre,
        out: out,
        inner: inner,
        idx: idx
      })
      // var foo;
      // if (inner && data) {
      //   return _.replace(pre, data[pre]);
      // }
      // return _;
    });
    return matches;
}

var ch = {
  '?': '__QM__',
  '*': '__ST__',
  '+': '__PL__',
  '!': '__EX__',
  '@': '__AT__',
};

var res = interpolate('a/b/c/!(d|e)/?(f|g)/h', ch)
console.log(res)

function parseEach (str) {


}
