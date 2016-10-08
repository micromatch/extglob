'use strict';

var fs = require('fs');
var path = require('path');
var reduce = require('async-array-reduce');
var glob = require('./glob');

function generate(patterns, options, cb) {
  reduce(patterns, [], function(acc, pattern, next) {
    glob(pattern, options, function(err, files) {
      if (err) return next(err);
      acc[pattern] = files;
      next(null, acc);
    });
  }, cb);
}

  // var filename = path.resolve(__dirname, 'bash-results.json');
  // var data = JSON.stringify(result, null, 2) + '\n';
  // fs.writeFile(filename, data, cb);

var globs = [
  ['*/b* */c*'],
  '**/*',
  'a/*/+(c|g)/./d',
  'a/**/[cg]/../[cg]',
  'a/{b,c,d,e,f}/**/g',
  'a/b/**',
  '**/g',
  'a/abc{fed,def}/g/h',
  'a/abc{fed/g,def}/**/',
  'a/abc{fed/g,def}/**///**/',
  '**/a/**/',
  '+(a|b|c)/a{/,bc*}/**',
  '*/*/*/f',
  '**/f',
  'a/symlink/a/b/c/a/b/c/a/b/c//a/b/c////a/b/c/**/b/c/**',
  '{./*/*,/tmp/glob-test/*}',
  '{/tmp/glob-test/*,*}', // evil owl face! how you taunt me!
  'a/!(symlink)/*',
  'a/symlink/a/**/*'
];

var options = {
  foo: true,
  globstar: true,
  extglob: false,
  cwd: path.join(__dirname, '../fixtures')
};

generate(globs, options, function() {
  console.log(arguments)
})
