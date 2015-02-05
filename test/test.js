/*!
 * extglob <https://github.com/jonschlinkert/extglob>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var should = require('should');
var argv = require('minimist')(process.argv.slice(2));
var extglob = require('..');

if ('mm' in argv) {
  extglob = require('minimatch');
}

describe('extglobs', function () {
  it('should match extended globs:', function () {
    extglob.match(['a/z', 'a/b'], 'a/!(z)').should.eql(['a/b']);
    extglob.match(['c/z/v'], 'c/z/v').should.eql(['c/z/v']);
    extglob.match(['c/a/v'], 'c/!(z)/v').should.eql(['c/a/v']);
    extglob.match(['c/z/v','c/a/v'], 'c/!(z)/v').should.eql(['c/a/v']);
    extglob.match(['c/z/v','c/a/v'], 'c/@(z)/v').should.eql(['c/z/v']);
    extglob.match(['c/z/v','c/a/v'], 'c/+(z)/v').should.eql(['c/z/v']);
    extglob.match(['c/z/v','c/a/v'], 'c/*(z)/v').should.eql(['c/z/v']);
    extglob.match(['c/z/v','z','zf','fz'], '?(z)').should.eql(['z']);
    extglob.match(['c/z/v','z','zf','fz'], '+(z)').should.eql(['z']);
    extglob.match(['c/z/v','z','zf','fz'], '*(z)').should.eql(['z']);
    extglob.match(['cz','abz','az'], 'a@(z)').should.eql(['az']);
    extglob.match(['cz','abz','az'], 'a*@(z)').should.eql(['abz', 'az']);
    extglob.match(['cz','abz','az'], 'a!(z)').should.eql(['abz']);
    extglob.match(['cz','abz','az'], 'a?(z)').should.eql(['az']);
    extglob.match(['cz','abz','az'], 'a+(z)').should.eql(['az']);
    extglob.match(['cz','abz','az'], 'a*(z)').should.eql(['az']);
    extglob.match(['cz','abz','az'], 'a**(z)').should.eql(['abz', 'az']);
    extglob.match(['cz','abz','az'], 'a*!(z)').should.eql(['abz', 'az']);
  });

  it('should match extglobs in file paths:', function () {
    extglob.match(['a.js', 'a.md', 'a.js.js', 'c.js', 'a.', 'd.js.d'], '*.!(js)').should.eql(['a.md', 'a.', 'd.js.d'])
  });
});

describe('bash', function () {
  it('should match extended globs from the bash spec:', function () {
    extglob.match(['fofo'], '*(f*(o))').should.eql(['fofo']);
    extglob.match(['ffo'], '*(f*(o))').should.eql(['ffo']);
    extglob.match(['foooofo'], '*(f*(o))').should.eql(['foooofo']);
    extglob.match(['foooofof'], '*(f*(o))').should.eql(['foooofof']);
    extglob.match(['fooofoofofooo'], '*(f*(o))').should.eql(['fooofoofofooo']);
    extglob.match(['foooofof'], '*(f+(o))').should.eql([]);
    extglob.match(['xfoooofof'], '*(f*(o))').should.eql([]);
    extglob.match(['foooofofx'], '*(f*(o))').should.eql([]);
    extglob.match(['ofxoofxo'], '*(*(of*(o)x)o)').should.eql(['ofxoofxo']);
    extglob.match(['ofooofoofofooo'], '*(f*(o))').should.eql([]);
    extglob.match(['foooxfooxfoxfooox'], '*(f*(o)x)').should.eql(['foooxfooxfoxfooox']);
    extglob.match(['foooxfooxofoxfooox'], '*(f*(o)x)').should.eql([]);
    extglob.match(['foooxfooxfxfooox'], '*(f*(o)x)').should.eql(['foooxfooxfxfooox']);
    extglob.match(['ofxoofxo'], '*(*(of*(o)x)o)').should.eql(['ofxoofxo']);
    extglob.match(['ofoooxoofxo'], '*(*(of*(o)x)o)').should.eql(['ofoooxoofxo']);
    extglob.match(['ofoooxoofxoofoooxoofxo'], '*(*(of*(o)x)o)').should.eql(['ofoooxoofxoofoooxoofxo']);
    extglob.match(['ofoooxoofxoofoooxoofxoo'], '*(*(of*(o)x)o)').should.eql(['ofoooxoofxoofoooxoofxoo']);
    extglob.match(['ofoooxoofxoofoooxoofxofo'], '*(*(of*(o)x)o)').should.eql([]);
    extglob.match(['ofoooxoofxoofoooxoofxooofxofxo'], '*(*(of*(o)x)o)').should.eql(['ofoooxoofxoofoooxoofxooofxofxo']);
    extglob.match(['aac'], '*(@(a))a@(c)').should.eql(['aac']);
    extglob.match(['ac'], '*(@(a))a@(c)').should.eql(['ac']);
    extglob.match(['c'], '*(@(a))a@(c)').should.eql([]);
    extglob.match(['aaac'], '*(@(a))a@(c)').should.eql(['aaac']);
    extglob.match(['baaac'], '*(@(a))a@(c)').should.eql([]);
    extglob.match(['abcd'], '?@(a|b)*@(c)d').should.eql(['abcd']);
    extglob.match(['abcd'], '@(ab|a*@(b))*(c)d').should.eql(['abcd']);
    extglob.match(['acd'], '@(ab|a*(b))*(c)d').should.eql(['acd']);
    extglob.match(['abbcd'], '@(ab|a*(b))*(c)d').should.eql(['abbcd']);
    extglob.match(['effgz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))').should.eql(['effgz']);
    extglob.match(['efgz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))').should.eql(['efgz']);
    extglob.match(['egz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))').should.eql(['egz']);
    extglob.match(['egzefffgzbcdij'], '*(b+(c)d|e*(f)g?|?(h)i@(j|k))').should.eql(['egzefffgzbcdij']);
    extglob.match(['egz'], '@(b+(c)d|e+(f)g?|?(h)i@(j|k))').should.eql([]);
    extglob.match(['ofoofo'], '*(of+(o))').should.eql(['ofoofo']);
    extglob.match(['oxfoxoxfox'], '*(oxf+(ox))').should.eql(['oxfoxoxfox']);
    extglob.match(['oxfoxfox'], '*(oxf+(ox))').should.eql([]);
    extglob.match(['ofoofo'], '*(of+(o)|f)').should.eql(['ofoofo']);
    extglob.match(['foofoofo'], '@(foo|f|fo)*(f|of+(o))').should.eql(['foofoofo']);
    extglob.match(['oofooofo'], '*(of|oof+(o))').should.eql(['oofooofo']);
    extglob.match(['fffooofoooooffoofffooofff'], '*(*(f)*(o))').should.eql(['fffooofoooooffoofffooofff']);
    extglob.match(['fofoofoofofoo'], '*(fo|foo)').should.eql(['fofoofoofofoo']);
    extglob.match(['foo'], '!(x)').should.eql(['foo']);
    extglob.match(['foo'], '!(x)*').should.eql(['foo']);
    extglob.match(['foo'], '!(foo)').should.eql([]);
    extglob.match(['foo'], '!(foo)*').should.eql(['foo']);
    extglob.match(['foo/bar'], 'foo/!(foo)').should.eql(['foo/bar']);
    extglob.match(['foobar'], '!(foo)*').should.eql(['foobar']);
    // extglob.match(['moo.cow'], '!(*.*).!(*.*)').should.eql(['moo.cow']);
    extglob.match(['mad.moo.cow'], '!(*.*).!(*.*)').should.eql([]);
    extglob.match(['mucca.pazza'], 'mu!(*(c))?.pa!(*(z))?').should.eql([]);
    extglob.match(['ooo'], '!(f)').should.eql(['ooo']);
    extglob.match(['ooo'], '*(!(f))').should.eql(['ooo']);
    extglob.match(['ooo'], '+(!(f))').should.eql(['ooo']);
    extglob.match(['f'], '!(f)').should.eql([]);
    extglob.match(['f'], '*(!(f))').should.eql([]);
    extglob.match(['f'], '+(!(f))').should.eql([]);
    extglob.match(['foot'], '@(!(z*)|*x)').should.eql(['foot']);
    extglob.match(['zoot'], '@(!(z*)|*x)').should.eql([]);
    extglob.match(['foox'], '@(!(z*)|*x)').should.eql(['foox']);
    extglob.match(['zoox'], '@(!(z*)|*x)').should.eql(['zoox']);
    extglob.match(['foob'], '!(foo)b*').should.eql([]);
    // extglob.match(['fff'], '!(f)').should.eql(['fff']);
    // extglob.match(['foobb'], '!(foo)b*').should.eql(['foobb']);
    // extglob.match(['foo'], '*(!(foo))').should.eql(['foo']);
    // extglob.match(['foo'], '+(!(f))').should.eql(['foo']);
    // extglob.match(['foo'], '*(!(f))').should.eql(['foo']);
    // extglob.match(['foo'], '!(f)').should.eql(['foo']);
    // extglob.match(['fff'], '+(!(f))').should.eql(['fff']);
    // extglob.match(['fff'], '*(!(f))').should.eql(['fff']);
  });
});
