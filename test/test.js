/*!
 * extglob <https://github.com/jonschlinkert/extglob>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('mocha');
require('should');
var assert = require('assert');
var support = require('./support');
var counts = support.counts;
var isNotMatch = support.isNotMatch;
var isMatch = support.isMatch;
var match = support.match;

describe('extglobs', function() {
  after(function() {
    console.log();
    console.log('    failing:', counts.failing);
    console.log('    passing:', counts.passing);
  });

  it('should match extended globs:', function() {
    match(['a/z', 'a/b'], 'a/!(z)', ['a/b']);
    match(['c/z/v'], 'c/z/v', ['c/z/v']);
    match(['c/a/v'], 'c/!(z)/v', ['c/a/v']);
    match(['c/z/v', 'c/a/v'], 'c/!(z)/v', ['c/a/v']);
    match(['c/z/v', 'c/a/v'], 'c/@(z)/v', ['c/z/v']);
    match(['c/z/v', 'c/a/v'], 'c/+(z)/v', ['c/z/v']);
    match(['c/z/v', 'c/a/v'], 'c/*(z)/v', ['c/z/v']);
    match(['c/z/v', 'z', 'zf', 'fz'], '?(z)', ['z']);
    match(['c/z/v', 'z', 'zf', 'fz'], '+(z)', ['z']);
    match(['c/z/v', 'z', 'zf', 'fz'], '*(z)', ['z']);
    match(['cz', 'abz', 'az'], 'a@(z)', ['az']);
    match(['cz', 'abz', 'az'], 'a*@(z)', ['az', 'abz']);
    match(['cz', 'abz', 'az'], 'a!(z)', ['abz']);
    match(['cz', 'abz', 'az'], 'a?(z)', ['az']);
    match(['cz', 'abz', 'az'], 'a+(z)', ['az']);
    match(['az', 'bz', 'axz'], 'a+(z)', ['az']);
    match(['cz', 'abz', 'az'], 'a*(z)', ['az']);
    match(['cz', 'abz', 'az'], 'a**(z)', ['az', 'abz']);
    match(['cz', 'abz', 'az'], 'a*!(z)', ['az', 'abz']);
  });

  it('should match extglobs in file paths:', function() {
    match(['a.js', 'a.md', 'a.js.js', 'c.js', 'a.', 'd.js.d'], '*.!(js)', ['d.js.d', 'a.', 'a.md']);
    match(['a.js', 'a.md', 'a.js.js', 'c.js', 'a.', 'd.js.d'], '*!(.js)', ['d.js.d', 'a.', 'a.md']);
    match(['a.js', 'a.md', 'a.js.js', 'c.js', 'a.', 'd.js.d'], '!(*.js)', ['d.js.d', 'a.', 'a.md']);
  });

  it('should support exclusion patterns:', function() {
    var arr = ['a.a', 'a.b', 'a.a.a', 'c.a', 'a.', 'd.a.d', 'a.bb', 'a.ccc'];
    match(arr, '*.+(b|d)', ['d.a.d', 'a.b', 'a.bb']);
    match(arr, '*.!(a)', ['d.a.d', 'a.', 'a.b', 'a.bb', 'a.ccc']);
    match(arr, '*.!(*a)', ['d.a.d', 'a.', 'a.b', 'a.bb', 'a.ccc']);
    match(arr, 'a.!(*a)', ['a.', 'a.b', 'a.bb', 'a.ccc']);
  });

  it('should support qmark matching', function() {
    var arr = ['a', 'aa', 'ab', 'aaa', 'abcdefg'];
    match(arr, '?', ['a']);
    match(arr, '??', ['a', 'aa', 'ab']);
    match(arr, '???', ['a', 'aa', 'ab', 'aaa']);
  });

  it('should match exactly one of the given pattern:', function() {
    var arr = ['aa.aa', 'a.bb', 'a.aa.a', 'cc.a', 'a.a', 'c.a', 'dd.aa.d', 'b.a'];
    match(arr, '(b|a)\\.(a)', ['a.a', 'b.a']);
    match(arr, '@(b|a)\\.@(a)', ['a.a', 'b.a']);
  });

  it('should work with globs', function() {
    var arr = ['123abc', 'ab', 'abcdef', 'abcfefg', 'abef', 'abcfef', 'abd', 'acd'];
    match(arr, 'ab*(e|f)', ['ab', 'abef']);
    match(arr, 'ab?*(e|f)', ['ab', 'abef']);
    match(arr, 'ab*d+(e|f)', ['abcdef']);
    match(arr, 'ab**(e|f)', ['ab', 'abcdef', 'abcfefg', 'abcfef', 'abef', 'abd']);
    match(arr, 'ab*+(e|f)', ['abcdef', 'abcfef', 'abef']);
    match(arr, 'ab**(e|f)g', ['abcfefg']);
    match(arr, 'ab***ef', ['abcdef', 'abcfef', 'abef']);
    match(arr, 'ab**', ['ab', 'abcdef', 'abcfef', 'abcfefg', 'abd', 'abef']);
    match(arr, '*?(a)bc', ['123abc']);
    match(arr, 'a(b*(foo|bar))d', ['abd']);
    match(arr, '(a+|b)+', ['ab', 'abcdef', 'abcfefg', 'abef', 'abcfef', 'abd', 'acd']);
    match(arr, '(a+|b)*', ['ab', 'abcdef', 'abcfefg', 'abef', 'abcfef', 'abd', 'acd']);
    match(['/dev/udp/129.22.8.102/45'], '/dev\\/@(tcp|udp)\\/*\\/*', ['/dev/udp/129.22.8.102/45']);
    match(['12', '1', '12abc'], '0|[1-9]*([0-9])', ['1', '12'], 'Should match valid numbers');
    match(['07', '0377', '09'], '+([0-7])', ['0377', '07'], 'Should match octal numbers');
  });

  it('stuff from korn\'s book', function() {
    isMatch('paragraph', 'para@(chute|graph)');
    isNotMatch('paramour', 'para@(chute|graph)');
    isMatch('para991', 'para?([345]|99)1');
    isNotMatch('para381', 'para?([345]|99)1');
    isNotMatch('paragraph', 'para*([0-9])');
    isMatch('para', 'para*([0-9])');
    isMatch('para13829383746592', 'para*([0-9])');
    isNotMatch('paragraph', 'para*([0-9])');
    isNotMatch('para', 'para+([0-9])');
    isMatch('para987346523', 'para+([0-9])');
    isMatch('paragraph', 'para!(*.[0-9])');
    isMatch('para.38', 'para!(*.[00-09])');
    isMatch('para.graph', 'para!(*.[0-9])');
    isMatch('para39', 'para!(*.[0-9])');
  });

  it('tests derived from those in rosenblatt\'s korn shell book', function() {
    match(['', '137577991', '2468'], '*(0|1|3|5|7|9)', ['', '137577991']);
    match(['file.c', 'file.C', 'file.cc', 'file.ccc'], '*.c?(c)', ['file.c', 'file.cc']);

    // extglob tests say that 'Makefile' should match on this one, but I can't see why it would.
    match(['parse.y', 'shell.c', 'Makefile', 'Makefile.in'], '!(*.c|*.h|Makefile.in|config*|README)', ['parse.y', 'Makefile.in']);
    match(['VMS.FILE;', 'VMS.FILE;0', 'VMS.FILE;1', 'VMS.FILE;139', 'VMS.FILE;1N'], '*\\;[1-9]*([0-9])', ['VMS.FILE;1', 'VMS.FILE;139']);
  });

  it('tests derived from the pd-ksh test suite', function() {
    match(['abcx', 'abcz', 'bbc'], '!([[*])*', ['abcx', 'abcz', 'bbc']);
    match(['abcx', 'abcz', 'bbc'], '[a*(]*z', ['abcz']);
    match(['abcx', 'abcz', 'bbc'], '+(a|b\\[)*', ['abcx', 'abcz']);
    match(['abd', 'acd'], 'a+(b|c)d', ['abd', 'acd']);
    match(['abd', 'acd', 'ac', 'ab'], 'a!(@(b|B))', ['acd', 'abd', 'ac']);
    match(['abd', 'acd'], 'a!(@(b|B))d', ['acd']);
    match(['abd', 'acd'], 'a[b*(foo|bar)]d', ['abd']);
  });

  it('simple kleene star tests', function() {
    isNotMatch('foo', '*(a|b\\[)');
    isMatch('foo', '*(a|b\\[)|f*');
  });

  it('this doesn\'t work in bash either (per bash extglob.tests notes)', function() {
    isNotMatch('*(a|b[)', '*(a|b\\[)');
    isMatch('*(a|b[)', '\\*\\(a\\|b\\[\\)');
    isMatch('*(a|b[)', '*(a|b\\[)', {literal: true});
  });

  it('should support multiple exclusion patterns in one extglob:', function() {
    var arr = ['a.a', 'a.b', 'a.c', 'a.c.d', 'c.c', 'a.', 'd.d', 'e.e', 'f.f', 'a.abcd'];
    match(arr, '*.(a|b|@(ab|a*@(b))*(c)d)', ['a.a', 'a.b', 'a.abcd']);
    match(arr, '!(*.a|*.b|*.c)', ['a.c.d', 'a.', 'd.d', 'e.e', 'f.f', 'a.abcd']);
    match(arr, '*!(.a|.b|.c)', ['a.c.d', 'a.', 'd.d', 'e.e', 'f.f', 'a.abcd']);
    match(arr, '*.!(a|b|c)', ['a.c.d', 'a.', 'd.d', 'e.e', 'f.f', 'a.abcd']);
  });

  it('should correctly match empty parens', function() {
    var arr = ['def', 'ef'];
    match(arr, '()ef', ['def', 'ef']);
  });

  it('should match escaped parens', function() {
    var arr = ['a(b', 'a((b', 'a((((b', 'ab'];
    match(arr, 'a(b', ['a(b']);
    match(arr, 'a(*b', ['ab', 'a(b', 'a((b', 'a((((b']);
  });

  it('should match escaped backslashes', function() {
    var arr = ['a\\b', 'a/b', 'ab'];
    match(arr, 'a\\\\b', ['a\\b']);
  });

  it('should match escaped slashes', function() {
    var arr = ['a\\b', 'a/b', 'ab'];
    match(arr, 'a/b', ['a/b']);
  });

  it('should match common regex patterns', function() {
    var arr = ['a c', 'a1c', 'a123c', 'a.c', 'a.xy.zc', 'a.zc', 'abbbbc', 'abbbc', 'abbc', 'abc', 'abq', 'axy zc', 'axy', 'axy.zc', 'axyzc'];

    match(arr, 'ab*c', ['abbbbc', 'abbbc', 'abbc', 'abc']);
    match(arr, 'ab+bc', ['abbbbc', 'abbbc', 'abbc']);
    match(arr, 'ab?bc', ['abbc', 'abc']);
    match(arr, '^abc$', ['abc']);
    match(arr, 'a.c', ['a.c']);
    match(arr, 'a.*c', ['a.c', 'a.xy.zc', 'a.zc']);
    match(arr, 'a*c', ['a c', 'a.c', 'a1c', 'a123c', 'abbbbc', 'abbbc', 'abbc', 'abc', 'axyzc', 'axy zc', 'axy.zc', 'a.xy.zc', 'a.zc']);
    match(arr, 'a\\w+c', ['a1c', 'a123c', 'abbbbc', 'abbbc', 'abbc', 'abc', 'axyzc'], 'Should match word characters');
    match(arr, 'a[a-z]+c', ['abbbbc', 'abbbc', 'abbc', 'abc', 'axyzc'], 'Should match word characters');
    match(arr, 'a\\W+c', ['a.c', 'a c'], 'Should match non-word characters');
    match(arr, 'a\\d+c', ['a1c', 'a123c'], 'Should match numbers');
    match(['foo@#$%123ASD #$$%^&', 'foo!@#$asdfl;', '123'], '\\d+', ['123']);
    match(['a123c', 'abbbc'], 'a\\D+c', ['abbbc'], 'Should match non-numbers');
    match(['foo', ' foo '], '(f|o)+\\b', ['foo'], 'Should match word boundaries');
    match(['abc', 'abd'], 'a[bc]d', ['abd'], 'Should match character classes');
    match(['abc', 'abd', 'ace', 'ac', 'a-'], 'a[b-d]e', ['ace'], 'Should match character class alphabetical ranges');
    match(['abc', 'abd', 'ace', 'ac', 'a-'], 'a[b-d]', ['ac'], 'Should match character class alphabetical ranges');
    match(['abc', 'abd', 'ace', 'ac', 'a-'], 'a[-c]', ['a-', 'ac'], 'Should match character classes with leading dashes');
    match(['abc', 'abd', 'ace', 'ac', 'a-'], 'a[c-]', ['a-', 'ac'], 'Should match character classes with trailing dashes');
    match(['a]c', 'abd', 'ace', 'ac', 'a-'], 'a[]]c', ['a]c'], 'Should match bracket literals in character classes');
    match(['a]', 'abd', 'ace', 'ac', 'a-'], 'a]', ['a]'], 'Should match bracket literals');
    match(['a]', 'acd', 'aed', 'ac', 'a-'], 'a[^bc]d', ['aed'], 'Should negation patterns in character classes');
    match(['adc', 'a-c'], 'a[^-b]c', ['adc'], 'Should match negated dashes in character classes');
    match(['adc', 'a]c'], 'a[^]b]c', ['adc'], 'Should match negated brackets in character classes');
    match(['01234', '0123e456', '0123e45g78'], '[\\de]+', ['01234', '0123e456', '0123e45g78'], 'Should match alpha-numeric characters in character classes');
    match(['01234', '0123e456', '0123e45g78'], '[e\\d]+', ['01234', '0123e456', '0123e45g78'], 'Should match alpha-numeric characters in character classes');
  });
});

describe('bash', function() {
  after(function() {
    console.log();
    console.log('    TOTAL');
    console.log('    failing:', counts.failing);
    console.log('    passing:', counts.passing);
  });

  it('should match extended globs from the bash spec:', function() {
    isMatch('fofo', '*(f*(o))');
    isMatch('ffo', '*(f*(o))');
    isMatch('foooofo', '*(f*(o))');
    isMatch('foooofof', '*(f*(o))');
    isMatch('fooofoofofooo', '*(f*(o))');
    isNotMatch('foooofof', '*(f+(o))');
    isNotMatch('xfoooofof', '*(f*(o))');
    isNotMatch('foooofofx', '*(f*(o))');
    isMatch('ofxoofxo', '*(*(of*(o)x)o)');
    isNotMatch('ofooofoofofooo', '*(f*(o))');
    isMatch('foooxfooxfoxfooox', '*(f*(o)x)');
    isNotMatch('foooxfooxofoxfooox', '*(f*(o)x)');
    isMatch('foooxfooxfxfooox', '*(f*(o)x)');
    isMatch('ofxoofxo', '*(*(of*(o)x)o)');
    isMatch('ofoooxoofxo', '*(*(of*(o)x)o)');
    isMatch('ofoooxoofxoofoooxoofxo', '*(*(of*(o)x)o)');
    isMatch('ofoooxoofxoofoooxoofxoo', '*(*(of*(o)x)o)');
    isNotMatch('ofoooxoofxoofoooxoofxofo', '*(*(of*(o)x)o)');
    isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(*(of*(o)x)o)');
    isMatch('aac', '*(@(a))a@(c)');
    isMatch('ac', '*(@(a))a@(c)');
    isNotMatch('c', '*(@(a))a@(c)');
    isMatch('aaac', '*(@(a))a@(c)');
    isNotMatch('baaac', '*(@(a))a@(c)');
    isMatch('abcd', '?@(a|b)*@(c)d');
    isMatch('abcd', '@(ab|a*@(b))*(c)d');
    isMatch('acd', '@(ab|a*(b))*(c)d');
    isMatch('abbcd', '@(ab|a*(b))*(c)d');
    isMatch('effgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))');
    isMatch('efgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))');
    isMatch('egz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))');
    isMatch('egzefffgzbcdij', '*(b+(c)d|e*(f)g?|?(h)i@(j|k))');
    isNotMatch('egz', '@(b+(c)d|e+(f)g?|?(h)i@(j|k))');
    isMatch('ofoofo', '*(of+(o))');
    isMatch('oxfoxoxfox', '*(oxf+(ox))');
    isNotMatch('oxfoxfox', '*(oxf+(ox))');
    isMatch('ofoofo', '*(of+(o)|f)');
    isMatch('foofoofo', '@(foo|f|fo)*(f|of+(o))'), 'Should match as fo+ofo+ofo';
    isMatch('oofooofo', '*(of|oof+(o))');
    isMatch('fffooofoooooffoofffooofff', '*(*(f)*(o))');
    isMatch('fofoofoofofoo', '*(fo|foo)'), 'Should backtrack in alternation matches';
  });

  it('should support exclusions (isMatch)', function() {
    isNotMatch('f', '!(f)');
    isNotMatch('f', '*(!(f))');
    isNotMatch('f', '+(!(f))');
    isNotMatch('mad.moo.cow', '!(*.*).!(*.*)');
    isNotMatch('zoot', '@(!(z*)|*x)');

    isMatch('foo', '!(x)');
    isMatch('foo', '!(x)*');
    isMatch('foot', '@(!(z*)|*x)');
    isMatch('foox', '@(!(z*)|*x)');
    isMatch('ooo', '!(f)');
    isMatch('ooo', '*(!(f))');
    isMatch('ooo', '+(!(f))');
    isMatch('zoox', '@(!(z*)|*x)');
  });

  it('should support exclusions (match)', function() {
    match(['aaac', 'foo'], '*(@(a))a@(c)', ['aaac']);
    match(['aaac'], '*(@(a))a@(c)', ['aaac']);
    match(['aac'], '*(@(a))a@(c)', ['aac']);
    match(['aac'], '*(@(a))b@(c)', []);
    match(['abbcd'], '@(ab|a*(b))*(c)d', ['abbcd']);
    match(['abcd'], '?@(a|b)*@(c)d', ['abcd']);
    match(['abcd'], '@(ab|a*@(b))*(c)d', ['abcd']);
    match(['ac'], '*(@(a))a@(c)', ['ac']);
    match(['acd'], '@(ab|a*(b))*(c)d', ['acd']);
    match(['baaac'], '*(@(a))a@(c)', []);
    match(['c'], '*(@(a))a@(c)', []);
    match(['effgz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', ['effgz']);
    match(['efgz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', ['efgz']);
    match(['egz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', ['egz']);
    match(['egz'], '@(b+(c)d|e+(f)g?|?(h)i@(j|k))', []);
    match(['egzefffgzbcdij'], '*(b+(c)d|e*(f)g?|?(h)i@(j|k))', ['egzefffgzbcdij']);
    match(['f'], '!(f)', []);
    match(['f'], '*(!(f))', []);
    match(['f'], '+(!(f))', []);
    match(['fa', 'fb', 'f', 'fo'], '!(f!(o))', ['fo']);
    match(['fa', 'fb', 'f', 'fo'], '!(f(o))', ['f', 'fb', 'fa']);
    match(['fffooofoooooffoofffooofff'], '*(*(f)*(o))', ['fffooofoooooffoofffooofff']);
    match(['ffo'], '*(f*(o))', ['ffo']);
    match(['fofo'], '*(f*(o))', ['fofo']);
    match(['fofoofoofofoo'], '*(fo|foo)', ['fofoofoofofoo']);
    match(['foo'], '!(x)', ['foo']);
    match(['foo'], '!(x)*', ['foo']);
    match(['foo/bar'], 'foo/!(foo)', ['foo/bar']);
    match(['foofoofo'], '@(foo|f|fo)*(f|of+(o))', ['foofoofo']);
    match(['fooofoofofooo'], '*(f*(o))', ['fooofoofofooo']);
    match(['foooofo'], '*(f*(o))', ['foooofo']);
    match(['foooofof'], '*(f*(o))', ['foooofof']);
    match(['foooofof'], '*(f+(o))', []);
    match(['foooofofx'], '*(f*(o))', []);
    match(['foooxfooxfoxfooox'], '*(f*(o)x)', ['foooxfooxfoxfooox']);
    match(['foooxfooxfxfooox'], '*(f*(o)x)', ['foooxfooxfxfooox']);
    match(['foooxfooxofoxfooox'], '*(f*(o)x)', []);
    match(['foot'], '@(!(z*)|*x)', ['foot']);
    match(['foox'], '@(!(z*)|*x)', ['foox']);
    match(['mad.moo.cow'], '!(*.*).!(*.*)', []);
    match(['mucca.pazza'], 'mu!(*(c))?.pa!(*(z))?', []);
    match(['ofoofo'], '*(of+(o))', ['ofoofo']);
    match(['ofoofo'], '*(of+(o)|f)', ['ofoofo']);
    match(['ofooofoofofooo'], '*(f*(o))', []);
    match(['ofoooxoofxo'], '*(*(of*(o)x)o)', ['ofoooxoofxo']);
    match(['ofoooxoofxoofoooxoofxo'], '*(*(of*(o)x)o)', ['ofoooxoofxoofoooxoofxo']);
    match(['ofoooxoofxoofoooxoofxofo'], '*(*(of*(o)x)o)', []);
    match(['ofoooxoofxoofoooxoofxoo'], '*(*(of*(o)x)o)', ['ofoooxoofxoofoooxoofxoo']);
    match(['ofoooxoofxoofoooxoofxooofxofxo'], '*(*(of*(o)x)o)', ['ofoooxoofxoofoooxoofxooofxofxo']);
    match(['ofxoofxo'], '*(*(of*(o)x)o)', ['ofxoofxo']);
    match(['oofooofo'], '*(of|oof+(o))', ['oofooofo']);
    match(['ooo'], '!(f)', ['ooo']);
    match(['ooo'], '*(!(f))', ['ooo']);
    match(['ooo'], '+(!(f))', ['ooo']);
    match(['oxfoxfox'], '*(oxf+(ox))', []);
    match(['oxfoxoxfox'], '*(oxf+(ox))', ['oxfoxoxfox']);
    match(['xfoooofof'], '*(f*(o))', []);
    match(['zoot'], '@(!(z*)|*x)', []);
    match(['zoox'], '@(!(z*)|*x)', ['zoox']);
    match(['foo', 'bar'], '!(foo)', ['bar']);
    match(['foo', 'bar', 'baz', 'foobar'], '!(foo)*', ['foo', 'bar', 'baz', 'foobar']);
    match(['foobar'], '!(foo)', ['foobar']);
    match(['fff', 'foo', 'ooo', 'f'], '*(!(f))', ['fff', 'ooo', 'foo']);
    match(['fff'], '+(!(f))', ['fff']);
    match(['fff'], '*(!(f))', ['fff']);
    match(['foo'], '*(!(f))', ['foo']);
    match(['fff'], '!(f)', ['fff']);
    match(['foo'], '!(f)', ['foo']);
    match(['foo'], '+(!(f))', ['foo']);
    match(['foob', 'foobb'], '(foo)bb', ['foobb']);
    match(['foo'], '!(!(foo))', ['foo']);
    match(['foo'], '*((foo))', ['foo']);
    match(['foo'], '*(!(foo))', ['foo']);
    match(['moo.cow', 'mad.moo.cow'], '!(*.*).!(*.*)', ['moo.cow']);
    match(['foob', 'foobb'], '!(foo)b*', ['foobb']);
  });
});
