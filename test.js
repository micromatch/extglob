/*!
 * extglob <https://github.com/jonschlinkert/extglob>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/* deps:mocha */
require('should');
var path = require('path');
var success = require('success-symbol');
var green = require('ansi-green');
var argv = require('minimist')(process.argv.slice(2));
var mm = require('micromatch');
var extglob = require('./');

if ('mm' in argv) {
  mm = require('minimatch');
  mm.minimatch = true;
}

function makeRe(glob) {
  var str = extglob(glob, {escape: true});
  if (mm.minimatch) {
    glob = glob.split('%%').join('*');
    glob = glob.split('%~').join('?');
    str = glob;
  }
  return mm.makeRe(str);
}

function match(arr, pattern, expected) {
  var re = makeRe(pattern);
  var res = [], len = arr.length;
  while (len--) {
    var ele = arr[len];
    if (re.test(ele)) {
      res.push(ele);
    }
  }
  if (res.length) {
    console.log('    ' + green('✓'), pattern);
  }
  var actual = res.sort();
  return actual.should.eql(expected.sort());
}

describe('extglobs', function () {
  it('should match extended globs:', function () {
    match(['a/z', 'a/b'], 'a/!(z)', ['a/b']);
    match(['c/z/v'], 'c/z/v', ['c/z/v']);
    match(['c/a/v'], 'c/!(z)/v', ['c/a/v']);
    match(['c/z/v','c/a/v'], 'c/!(z)/v', ['c/a/v']);
    match(['c/z/v','c/a/v'], 'c/@(z)/v', ['c/z/v']);
    match(['c/z/v','c/a/v'], 'c/+(z)/v', ['c/z/v']);
    match(['c/z/v','c/a/v'], 'c/*(z)/v', ['c/z/v']);
    match(['c/z/v','z','zf','fz'], '?(z)', ['z']);
    match(['c/z/v','z','zf','fz'], '+(z)', ['z']);
    match(['c/z/v','z','zf','fz'], '*(z)', ['z']);
    match(['cz','abz','az'], 'a@(z)', ['az']);
    match(['cz','abz','az'], 'a*@(z)', ['az', 'abz']);
    match(['cz','abz','az'], 'a!(z)', ['abz']);
    match(['cz','abz','az'], 'a?(z)', ['az']);
    match(['cz','abz','az'], 'a+(z)', ['az']);
    match(['az','bz','axz'], 'a+(z)', ['az']);
    match(['cz','abz','az'], 'a*(z)', ['az']);
    match(['cz','abz','az'], 'a**(z)', ['az', 'abz']);
    match(['cz','abz','az'], 'a*!(z)', ['az', 'abz']);
  });

  it('should match extglobs in file paths:', function () {
    match(['a.js', 'a.md', 'a.js.js', 'c.js', 'a.', 'd.js.d'], '*.!(js)', ['d.js.d', 'a.', 'a.md']);
    match(['a.js', 'a.md', 'a.js.js', 'c.js', 'a.', 'd.js.d'], '*!(.js)', ['d.js.d', 'a.', 'a.md']);
  });

  it('should support exclusion patterns:', function () {
    var arr = ['a.a', 'a.b', 'a.a.a', 'c.a', 'a.', 'd.a.d'];
    match(arr, '*.+(b|d)', ['d.a.d', 'a.b']);
    match(arr, '*.!(a)', ['d.a.d', 'a.', 'a.b']);
    match(arr, '*.!(*a)', ['d.a.d', 'a.', 'a.b']);
  });

  it('should match exactly one of the given pattern:', function () {
    var arr = ['aa.aa', 'a.bb', 'a.aa.a', 'cc.a', 'a.a', 'c.a', 'dd.aa.d', 'b.a'];
    match(arr, '@(b|a)\.@(a)', ['a.a', 'b.a']);
  });

  it.skip('should support multiple exclusion patterns in one extglob:', function () {
    var arr = ['a.a', 'a.b', 'a.c.d', 'c.c', 'a.', 'd.d', 'e.e', 'f.f'];
    match(arr, '!(*.a|*.b|*.c)', ['a.c.d', 'a.', 'd.d', 'e.e', 'f.f']);
  });
});

describe('bash', function () {
  it('should match extended globs from the bash spec:', function () {
    match(['fofo'], '*(f*(o))', ['fofo']);
    match(['ffo'], '*(f*(o))', ['ffo']);
    match(['foooofo'], '*(f*(o))', ['foooofo']);
    match(['foooofof'], '*(f*(o))', ['foooofof']);
    match(['fooofoofofooo'], '*(f*(o))', ['fooofoofofooo']);
    match(['foooofof'], '*(f+(o))', []);
    match(['xfoooofof'], '*(f*(o))', []);
    match(['foooofofx'], '*(f*(o))', []);
    match(['ofxoofxo'], '*(*(of*(o)x)o)', ['ofxoofxo']);
    match(['ofooofoofofooo'], '*(f*(o))', []);
    match(['foooxfooxfoxfooox'], '*(f*(o)x)', ['foooxfooxfoxfooox']);
    match(['foooxfooxofoxfooox'], '*(f*(o)x)', []);
    match(['foooxfooxfxfooox'], '*(f*(o)x)', ['foooxfooxfxfooox']);
    match(['ofxoofxo'], '*(*(of*(o)x)o)', ['ofxoofxo']);
    match(['ofoooxoofxo'], '*(*(of*(o)x)o)', ['ofoooxoofxo']);
    match(['ofoooxoofxoofoooxoofxo'], '*(*(of*(o)x)o)', ['ofoooxoofxoofoooxoofxo']);
    match(['ofoooxoofxoofoooxoofxoo'], '*(*(of*(o)x)o)', ['ofoooxoofxoofoooxoofxoo']);
    match(['ofoooxoofxoofoooxoofxofo'], '*(*(of*(o)x)o)', []);
    match(['ofoooxoofxoofoooxoofxooofxofxo'], '*(*(of*(o)x)o)', ['ofoooxoofxoofoooxoofxooofxofxo']);
    match(['aac'], '*(@(a))a@(c)', ['aac']);
    match(['aac'], '*(@(a))b@(c)', []);
    match(['ac'], '*(@(a))a@(c)', ['ac']);
    match(['c'], '*(@(a))a@(c)', []);
    match(['aaac', 'foo'], '*(@(a))a@(c)', ['aaac']);
    match(['baaac'], '*(@(a))a@(c)', []);
    match(['abcd'], '?@(a|b)*@(c)d', ['abcd']);
    match(['abcd'], '@(ab|a*@(b))*(c)d', ['abcd']);
    match(['acd'], '@(ab|a*(b))*(c)d', ['acd']);
    match(['abbcd'], '@(ab|a*(b))*(c)d', ['abbcd']);
    match(['effgz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', ['effgz']);
    match(['efgz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', ['efgz']);
    match(['egz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', ['egz']);
    match(['egzefffgzbcdij'], '*(b+(c)d|e*(f)g?|?(h)i@(j|k))', ['egzefffgzbcdij']);
    match(['egz'], '@(b+(c)d|e+(f)g?|?(h)i@(j|k))', []);
    match(['ofoofo'], '*(of+(o))', ['ofoofo']);
    match(['oxfoxoxfox'], '*(oxf+(ox))', ['oxfoxoxfox']);
    match(['oxfoxfox'], '*(oxf+(ox))', []);
    match(['ofoofo'], '*(of+(o)|f)', ['ofoofo']);
    match(['foofoofo'], '@(foo|f|fo)*(f|of+(o))', ['foofoofo']);
    match(['oofooofo'], '*(of|oof+(o))', ['oofooofo']);
    match(['fffooofoooooffoofffooofff'], '*(*(f)*(o))', ['fffooofoooooffoofffooofff']);
    match(['fofoofoofofoo'], '*(fo|foo)', ['fofoofoofofoo']);
    match(['foo'], '!(x)', ['foo']);
    match(['foo'], '!(x)*', ['foo']);
    match(['foo', 'bar'], '!(foo)', ['bar']);
    match(['foo', 'bar'], '!(foo)*', ['bar']);
    match(['foo/bar'], 'foo/!(foo)', ['foo/bar']);
    match(['foobar', 'baz'], '!(foo)*', ['baz']);
    match(['moo.cow', 'a.b'], '!(*\\.*).!(*\\.*)', ['a.b', 'moo.cow']);
    match(['moo.cow', 'a.b'], '!(*.*).!(*.*)', ['a.b', 'moo.cow']);
    // match(['mad.moo.cow'], '^!(*.*).!(*.*)', []);
    match(['mucca.pazza'], 'mu!(*(c))?.pa!(*(z))?', []);
    match(['ooo'], '!(f)', ['ooo']);
    match(['ooo'], '*(!(f))', ['ooo']);
    match(['ooo'], '+(!(f))', ['ooo']);
    match(['f'], '!(f)', []);
    match(['f'], '*(!(f))', []);
    match(['f'], '+(!(f))', []);
    match(['foot'], '@(!(z*)|*x)', ['foot']);
    match(['zoot'], '@(!(z*)|*x)', []);
    match(['foox'], '@(!(z*)|*x)', ['foox']);
    match(['zoox'], '@(!(z*)|*x)', ['zoox']);
    match(['foob'], '!(foo)b*', []);
    match(['fa', 'fb', 'f', 'fo'], '!(f(o))', ['f', 'fb', 'fa']);
    match(['fa', 'fb', 'f', 'fo'], '!(f!(o))', ['fo']);
    // match(['fff'], '!(f)', ['fff']);
    // match(['foobb'], '!(foo)b*', ['foobb']);
    // match(['foo'], '*(!(foo))', ['foo']);
    // match(['foo'], '+(!(f))', ['foo']);
    // match(['foo'], '*(!(f))', ['foo']);
    // match(['foo'], '!(f)', ['foo']);
    // match(['fff'], '+(!(f))', ['fff']);
    // match(['fff'], '*(!(f))', ['fff']);
  });
});
