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
var argv = require('minimist')(process.argv.slice(2));
var mm = require('micromatch');
var extglob = require('./');

if ('mm' in argv) {
  mm = require('minimatch');
  mm.minimatch = true;
}

function makeRe(glob) {
  var str = extglob(glob, true);
  if (mm.minimatch) {
    glob = glob.split('%%').join('*');
    glob = glob.split('%~').join('?');
    str = glob;
  }
  return mm.makeRe(str);
}

function match(arr, pattern) {
  var re = makeRe(pattern);
  var res = [], len = arr.length;
  while (len--) {
    var ele = arr[len];
    if (re.test(ele)) {
      res.push(ele);
    }
  }
  return res;
}

describe('extglobs', function () {
  it('should match extended globs:', function () {
    match(['a/z', 'a/b'], 'a/!(z)').should.eql(['a/b']);
    match(['c/z/v'], 'c/z/v').should.eql(['c/z/v']);
    match(['c/a/v'], 'c/!(z)/v').should.eql(['c/a/v']);
    match(['c/z/v','c/a/v'], 'c/!(z)/v').should.eql(['c/a/v']);
    match(['c/z/v','c/a/v'], 'c/@(z)/v').should.eql(['c/z/v']);
    match(['c/z/v','c/a/v'], 'c/+(z)/v').should.eql(['c/z/v']);
    match(['c/z/v','c/a/v'], 'c/*(z)/v').should.eql(['c/z/v']);
    match(['c/z/v','z','zf','fz'], '?(z)').should.eql(['z']);
    match(['c/z/v','z','zf','fz'], '+(z)').should.eql(['z']);
    match(['c/z/v','z','zf','fz'], '*(z)').should.eql(['z']);
    match(['cz','abz','az'], 'a@(z)').should.eql(['az']);
    match(['cz','abz','az'], 'a*@(z)').should.eql(['az', 'abz']);
    match(['cz','abz','az'], 'a!(z)').should.eql(['abz']);
    match(['cz','abz','az'], 'a?(z)').should.eql(['az']);
    match(['cz','abz','az'], 'a+(z)').should.eql(['az']);
    match(['az','bz','axz'], 'a+(z)').should.eql(['az']);
    match(['cz','abz','az'], 'a*(z)').should.eql(['az']);
    match(['cz','abz','az'], 'a**(z)').should.eql(['az', 'abz']);
    match(['cz','abz','az'], 'a*!(z)').should.eql(['az', 'abz']);
  });

  it('should match extglobs in file paths:', function () {
    match(['a.js', 'a.md', 'a.js.js', 'c.js', 'a.', 'd.js.d'], '*.!(js)').should.eql(['d.js.d', 'a.', 'a.md'])
  });
});

describe('bash', function () {
  it('should match extended globs from the bash spec:', function () {
    match(['fofo'], '*(f*(o))').should.eql(['fofo']);
    match(['ffo'], '*(f*(o))').should.eql(['ffo']);
    match(['foooofo'], '*(f*(o))').should.eql(['foooofo']);
    match(['foooofof'], '*(f*(o))').should.eql(['foooofof']);
    match(['fooofoofofooo'], '*(f*(o))').should.eql(['fooofoofofooo']);
    match(['foooofof'], '*(f+(o))').should.eql([]);
    match(['xfoooofof'], '*(f*(o))').should.eql([]);
    match(['foooofofx'], '*(f*(o))').should.eql([]);
    match(['ofxoofxo'], '*(*(of*(o)x)o)').should.eql(['ofxoofxo']);
    match(['ofooofoofofooo'], '*(f*(o))').should.eql([]);
    match(['foooxfooxfoxfooox'], '*(f*(o)x)').should.eql(['foooxfooxfoxfooox']);
    match(['foooxfooxofoxfooox'], '*(f*(o)x)').should.eql([]);
    match(['foooxfooxfxfooox'], '*(f*(o)x)').should.eql(['foooxfooxfxfooox']);
    match(['ofxoofxo'], '*(*(of*(o)x)o)').should.eql(['ofxoofxo']);
    match(['ofoooxoofxo'], '*(*(of*(o)x)o)').should.eql(['ofoooxoofxo']);
    match(['ofoooxoofxoofoooxoofxo'], '*(*(of*(o)x)o)').should.eql(['ofoooxoofxoofoooxoofxo']);
    match(['ofoooxoofxoofoooxoofxoo'], '*(*(of*(o)x)o)').should.eql(['ofoooxoofxoofoooxoofxoo']);
    match(['ofoooxoofxoofoooxoofxofo'], '*(*(of*(o)x)o)').should.eql([]);
    match(['ofoooxoofxoofoooxoofxooofxofxo'], '*(*(of*(o)x)o)').should.eql(['ofoooxoofxoofoooxoofxooofxofxo']);
    match(['aac'], '*(@(a))a@(c)').should.eql(['aac']);
    match(['aac'], '*(@(a))b@(c)').should.eql([]);
    match(['ac'], '*(@(a))a@(c)').should.eql(['ac']);
    match(['c'], '*(@(a))a@(c)').should.eql([]);
    match(['aaac', 'foo'], '*(@(a))a@(c)').should.eql(['aaac']);
    match(['baaac'], '*(@(a))a@(c)').should.eql([]);
    match(['abcd'], '?@(a|b)*@(c)d').should.eql(['abcd']);
    match(['abcd'], '@(ab|a*@(b))*(c)d').should.eql(['abcd']);
    match(['acd'], '@(ab|a*(b))*(c)d').should.eql(['acd']);
    match(['abbcd'], '@(ab|a*(b))*(c)d').should.eql(['abbcd']);
    match(['effgz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))').should.eql(['effgz']);
    match(['efgz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))').should.eql(['efgz']);
    match(['egz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))').should.eql(['egz']);
    match(['egzefffgzbcdij'], '*(b+(c)d|e*(f)g?|?(h)i@(j|k))').should.eql(['egzefffgzbcdij']);
    match(['egz'], '@(b+(c)d|e+(f)g?|?(h)i@(j|k))').should.eql([]);
    match(['ofoofo'], '*(of+(o))').should.eql(['ofoofo']);
    match(['oxfoxoxfox'], '*(oxf+(ox))').should.eql(['oxfoxoxfox']);
    match(['oxfoxfox'], '*(oxf+(ox))').should.eql([]);
    match(['ofoofo'], '*(of+(o)|f)').should.eql(['ofoofo']);
    match(['foofoofo'], '@(foo|f|fo)*(f|of+(o))').should.eql(['foofoofo']);
    match(['oofooofo'], '*(of|oof+(o))').should.eql(['oofooofo']);
    match(['fffooofoooooffoofffooofff'], '*(*(f)*(o))').should.eql(['fffooofoooooffoofffooofff']);
    match(['fofoofoofofoo'], '*(fo|foo)').should.eql(['fofoofoofofoo']);
    match(['foo'], '!(x)').should.eql(['foo']);
    match(['foo'], '!(x)*').should.eql(['foo']);
    match(['foo', 'bar'], '!(foo)').should.eql(['bar']);
    match(['foo', 'bar'], '!(foo)*').should.eql(['bar']);
    match(['foo/bar'], 'foo/!(foo)').should.eql(['foo/bar']);
    match(['foobar', 'baz'], '!(foo)*').should.eql(['baz']);
    // match(['moo.cow', 'a.b'], '!(*.*).!(*.*)').should.eql(['a.b', 'moo.cow']);
    match(['mad.moo.cow'], '!(*.*).!(*.*)').should.eql([]);
    match(['mucca.pazza'], 'mu!(*(c))?.pa!(*(z))?').should.eql([]);
    match(['ooo'], '!(f)').should.eql(['ooo']);
    match(['ooo'], '*(!(f))').should.eql(['ooo']);
    match(['ooo'], '+(!(f))').should.eql(['ooo']);
    match(['f'], '!(f)').should.eql([]);
    match(['f'], '*(!(f))').should.eql([]);
    match(['f'], '+(!(f))').should.eql([]);
    match(['foot'], '@(!(z*)|*x)').should.eql(['foot']);
    match(['zoot'], '@(!(z*)|*x)').should.eql([]);
    match(['foox'], '@(!(z*)|*x)').should.eql(['foox']);
    match(['zoox'], '@(!(z*)|*x)').should.eql(['zoox']);
    match(['foob'], '!(foo)b*').should.eql([]);
    match(['fa', 'fb', 'f', 'fo'], '!(f(o))').should.eql(['f', 'fb', 'fa']);
    match(['fa', 'fb', 'f', 'fo'], '!(f!(o))').should.eql(['fo']);
    // match(['fff'], '!(f)').should.eql(['fff']);
    // match(['foobb'], '!(foo)b*').should.eql(['foobb']);
    // match(['foo'], '*(!(foo))').should.eql(['foo']);
    // match(['foo'], '+(!(f))').should.eql(['foo']);
    // match(['foo'], '*(!(f))').should.eql(['foo']);
    // match(['foo'], '!(f)').should.eql(['foo']);
    // match(['fff'], '+(!(f))').should.eql(['fff']);
    // match(['fff'], '*(!(f))').should.eql(['fff']);
  });
});
