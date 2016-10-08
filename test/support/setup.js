'use strict';

var utils = require('./utils');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');

module.exports = function(fixtures) {
  var symlinkFrom = path.resolve(fixtures, '../..');
  var symlinkTo = path.resolve(fixtures, 'a/symlink/a/b/c');
  var bashOutput = {};

  var files = [
    'a/.abcdef/x/y/z/a',
    'a/a.a/x/y/z/a',
    'a/a.b/x/y/z/a',
    'a/a.c/x/y/z/a',
    'a/abcdef/g/h',
    'a/abcfed/g/h',
    'a/b/c/d',
    'a/bc/e/f',
    'a/c/d/c/b',
    'a/cb/e/f',
    'a/x/.y/b',
    'a/z/.y/b'
  ].map(function(filename) {
    return path.resolve(fixtures, filename);
  });

  it('should remove fixtures', function(cb) {
    rimraf(fixtures, cb);
  });

  describe('files', function() {
    files.forEach(function(filename) {
      it(`should generate ${filename}`, function(cb) {
        var filepath = path.resolve(fixtures, filename);
        mkdirp(path.dirname(filepath), '0755', function(err) {
          if (err) return cb(err);
          fs.writeFile(filepath, 'contents', cb);
        });
      });
    });
  });

  if (process.platform !== 'win32') {
    describe('symlink', function() {
      it('should symlink', function(cb) {
        mkdirp(path.dirname(symlinkTo), '0755', function(err) {
          if (err) return cb(err);
          fs.symlinkSync(symlinkFrom, symlinkTo, 'dir');
          cb();
        });
      });
    });
  }

  var names = ['foo', 'bar', 'baz', 'asdf', 'quux', 'qwer', 'rewq'];

  describe('generate names', function() {
    names.forEach(function(name) {
      var dir = path.join('/tmp/glob-test', name);
      it(`should write ${dir}`, function(cb) {
        mkdirp(dir, cb);
      });
    });
  });

  // generate the bash pattern test-fixtures if possible
  if (process.platform === 'win32') {
    console.error('Windows, using cached fixtures.');
    return;
  }

  var spawn = require('child_process').spawn;
  // put more patterns here.
  // anything that would be directly in `/` should be in `/tmp/glob-test`
  var globs = [
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
    'a/!(symlink)/**',
    'a/symlink/a/**/*'
  ];

  describe('generate globs', function() {
    globs.forEach(function(pattern) {
      it(`should generate fixture ${pattern}`, function(cb) {
        var args = [
          '-O',
          'globstar',
          '-O',
          'extglob',
          '-O',
          'nullglob',
          '-c for i in ' + pattern + '; do echo $i; done'
        ];

        var cp = spawn('bash', args, {cwd: fixtures});
        var actual = [];

        cp.stdout.on('data', function(c) {
          actual.push(c);
        });

        cp.stderr.pipe(process.stderr);
        cp.on('close', function(code) {
          actual = utils.flatten(actual);
          if (actual) {
            actual = utils.cleanResults(actual.split(/\r*\n/));
          } else {
            actual = [];
          }
          bashOutput[pattern] = actual;
          cb();
        });
      });
    });
  });

  describe('fixtures', function() {
    it('should save fixtures', function(cb) {
      var fname = path.resolve(__dirname, 'bash-results.json');
      var data = JSON.stringify(bashOutput, null, 2) + '\n';
      fs.writeFile(fname, data, cb);
    });
  });
};
