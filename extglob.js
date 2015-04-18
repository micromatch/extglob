
var isExtglob = require('is-extglob');

module.exports = extglob;

var re;

function extglob(str, esc) {
  if (!(re instanceof RegExp)) {
    re = regex();
  }

  var orig = str;
  var o = {}, i = 0;

  while (isExtglob(str)) {
    var match = re.exec(str);
    if (!match) break;

    var id = '__EXTGLOB_' + (i++) + '__';
    // o[id] = wrap(match[3], match[1], esc);
    o[id] = {
      prefix: match[1],
      inner: match[3]
    };
    str = str.split(match[0]).join(id);
  }
  var keys = Object.keys(o);
  var len = keys.length;
  while (len--) {
    var key = keys[len];
    var val = o[key];
    if (str === key) {
      console.log(str)
    }
    str = str.split(key).join(wrap(val.inner, val.prefix, esc));
  }

  return str;
}

function wrap(str, prefix, esc) {
  switch (prefix) {
    case '!':
      return '(?!' + str + ')[^/]' + (esc ? '%%%~' : '*?');
    case '@':
      return '(?:' + str + ')';
    case '+':
      return '(?:' + str + ')+';
    case '*':
      return '(?:' + str + ')' + (esc ? '%%' : '*')
    case '?':
      return '(?:' + str + ')' + (esc ? '%~' : '?')
    default:
      return str;
  }
}

/**
 * extglob regex.
 */

function regex() {
  return /(\\?[@?!+*$]\\?)(\(([^()]*?)\))/;
}
