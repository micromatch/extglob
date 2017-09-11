// var mm = require('minimatch');
var extglob = require('./');

// var re = /^(?!a|b)[^/]*?\.md$/;
var re = extglob.makeRe('!(?:(a|b)*).md');
// var re = mm.makeRe('!(a|b)*.md');
var arr = ['a.js', 'a.md', 'b.md', 'c.md']
  .filter(function(ele) {
    return re.test(ele);
  });
console.log(arr);
