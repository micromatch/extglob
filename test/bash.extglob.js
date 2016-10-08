'use strict';

/**
 * Tests ported from bash 4.3 <tests/extglob.tests>
 */

var bash = require('./support/bash');
var path = require('path');
var del = require('delete');
var assert = require('assert');
var argv = require('yargs-parser')(process.argv.slice(2));
var extglob = require('..');

describe('bash.extglob', function() {
  it('valid numbers', function() {
    assert(extglob.isMatch('/dev/udp/129.22.8.102/45', '/dev/@(tcp|udp)/*/*'));
    assert(extglob.isMatch('12', '[1-9]*([0-9])'));
    assert(!extglob.isMatch('12abc', '[1-9]*([0-9])'));
    assert(extglob.isMatch('1', '[1-9]*([0-9])'));
  });

  it('octal numbers', function() {
    assert(extglob.isMatch('07', '+([0-7])'));
    assert(extglob.isMatch('0377', '+([0-7])'));
    assert(!extglob.isMatch('09', '+([0-7])'));
  });

  it('stuff from korn\'s book', function() {
    assert(extglob.isMatch('paragraph', 'para@(chute|graph)'));
    assert(!extglob.isMatch('paramour', 'para@(chute|graph)'));
    assert(extglob.isMatch('para991', 'para?([345]|99)1'));
    assert(!extglob.isMatch('para381', 'para?([345]|99)1'));
    assert(!extglob.isMatch('paragraph', 'para*([0-9])'));
    assert(extglob.isMatch('para', 'para*([0-9])'));
    assert(extglob.isMatch('para13829383746592', 'para*([0-9])'));
    assert(!extglob.isMatch('paragraph', 'para*([0-9])'));
    assert(!extglob.isMatch('para', 'para+([0-9])'));
    assert(extglob.isMatch('para987346523', 'para+([0-9])'));
    assert(extglob.isMatch('paragraph', 'para!(*.[0-9])'));
    assert(extglob.isMatch('para.38', 'para!(*.[0-9])'));
    assert(extglob.isMatch('para.graph', 'para!(*.[0-9])'));
    assert(extglob.isMatch('para39', 'para!(*.[0-9])'));
  });

  it('tests derived from those in rosenblatt\'s korn shell book', function() {
    assert(extglob.isMatch('', '*(0|1|3|5|7|9)'));
    assert(extglob.isMatch('137577991', '*(0|1|3|5|7|9)'));
    assert(!extglob.isMatch('2468', '*(0|1|3|5|7|9)'));
    assert(extglob.isMatch('file.c', '*.c?(c)'));
    assert(!extglob.isMatch('file.C', '*.c?(c)'));
    assert(extglob.isMatch('file.cc', '*.c?(c)'));
    assert(!extglob.isMatch('file.ccc', '*.c?(c)'));
    assert(extglob.isMatch('parse.y', '!(*.c|*.h|Makefile.in|config*|README)'));
    assert(!extglob.isMatch('shell.c', '!(*.c|*.h|Makefile.in|config*|README)'));
    assert(extglob.isMatch('Makefile', '!(*.c|*.h|Makefile.in|config*|README)'));
    assert(extglob.isMatch('VMS.FILE;1', '*\\;[1-9]*([0-9])'));
    assert(!extglob.isMatch('VMS.FILE;0', '*\\;[1-9]*([0-9])'));
    assert(!extglob.isMatch('VMS.FILE;', '*\\;[1-9]*([0-9])'));
    assert(extglob.isMatch('VMS.FILE;139', '*\\;[1-9]*([0-9])'));
    assert(!extglob.isMatch('VMS.FILE;1N', '*\\;[1-9]*([0-9])'));
  });

  it('tests derived from the pd-ksh test suite', function() {
    assert.deepEqual(extglob.match(['abcx', 'abcz', 'bbc'], '!([*)*'), []);
    assert.deepEqual(extglob.match(['abcx', 'abcz', 'bbc'], '+(a|b[)*'), []);
    assert.deepEqual(extglob.match(['abcx', 'abcz', 'bbc'], '[a*(]*)z'), []);

    assert.deepEqual(extglob.match(['abc'], '+()c'), []);
    assert.deepEqual(extglob.match(['abc'], '+()x'), []);
    assert.deepEqual(extglob.match(['abc'], '+(*)c'), ['abc']);
    assert.deepEqual(extglob.match(['abc'], '+(*)x'), []);

    assert.deepEqual(extglob.match(['abc'], 'no-file+(a|b)stuff'), []);
    assert.deepEqual(extglob.match(['abc'], 'no-file+(a*(c)|b)stuff'), []);

    assert.deepEqual(extglob.match(['abd', 'acd'], 'a+(b|c)d'), ['abd', 'acd']);
    assert.deepEqual(extglob.match(['abc'], 'a+(b|c)d'), []);

    assert.deepEqual(extglob.match(['acd'], 'a!(@(b|B))d'), ['acd']);
    assert.deepEqual(extglob.match(['abc', 'abd'], 'a!(@(b|B))d'), []);

    assert.deepEqual(extglob.match(['abd'], 'a[b*(foo|bar)]d'), ['abd']);
    assert.deepEqual(extglob.match(['abc', 'acd'], 'a[b*(foo|bar)]d'), []);
  });

  it('simple kleene star tests', function() {
    assert(!extglob.isMatch('foo', '*(a|b[)'));
    assert(!extglob.isMatch('(', '*(a|b[)'));
    assert(!extglob.isMatch(')', '*(a|b[)'));
    assert(!extglob.isMatch('|', '*(a|b[)'));
    assert(extglob.isMatch('a', '*(a|b)'));
    assert(extglob.isMatch('b', '*(a|b)'));
    assert(extglob.isMatch('b[', '*(a|b\\[)'));
    assert(extglob.isMatch('ab[', '+(a|b\\[)'));
    assert(!extglob.isMatch('ab[cde', '+(a|b\\[)'));
    assert(extglob.isMatch('ab[cde', '+(a|b\\[)*'));
  });

  it('check extended globbing in pattern removal', function() {
    assert.deepEqual(extglob.match(['a', 'abc'], '+(a|abc)'), ['a', 'abc']);
    assert.deepEqual(extglob.match(['abcd', 'abcde', 'abcedf'], '+(a|abc)'), []);

    assert.deepEqual(extglob.match(['f'], '+(def|f)'), ['f']);

    assert.deepEqual(extglob.match(['def'], '+(f|def)'), ['def']);
    assert.deepEqual(extglob.match(['cdef', 'bcdef', 'abcedf'], '+(f|def)'), []);

    assert.deepEqual(extglob.match(['abcd'], '*(a|b)cd'), ['abcd']);
    assert.deepEqual(extglob.match(['a', 'ab', 'abc'], '*(a|b)cd'), []);

    assert.deepEqual(extglob.match(['a', 'ab', 'abc', 'abcde', 'abcdef'], '"*(a|b)cd"'), []);
  });

  it('More tests derived from a bug report concerning extended glob patterns following a *', function() {
    assert.deepEqual(extglob.match(['ab', 'abef'], 'ab*(e|f)'), ['ab', 'abef']);
    assert.deepEqual(extglob.match(['abcdef', 'abcfef'], 'ab*(e|f)'), []);

    assert.deepEqual(extglob.match(['abcfef', 'abef'], 'ab?*(e|f)'), ['abcfef', 'abef']);
    assert.deepEqual(extglob.match(['ab', 'abcdef'], 'ab?*(e|f)'), []);

    assert.deepEqual(extglob.match(['abcdef'], 'ab*d+(e|f)'), ['abcdef']);
    assert.deepEqual(extglob.match(['ab', 'abef', 'abcfef'], 'ab*d+(e|f)'), []);

    assert.deepEqual(extglob.match(['ab', 'abcdef', 'abcfef', 'abef'], 'ab**(e|f)'), ['ab', 'abcdef', 'abcfef', 'abef']);

    assert.deepEqual(extglob.match(['abcdef', 'abef', 'abcfef'], 'ab*+(e|f)'), ['abcdef', 'abef', 'abcfef']);
    assert.deepEqual(extglob.match(['ab'], 'ab*+(e|f)'), []);

    assert(extglob.isMatch('abcfefg', 'ab**(e|f)'));
    assert(extglob.isMatch('abcfefg', 'ab**(e|f)g'));
    assert(!extglob.isMatch('ab', 'ab*+(e|f)'));
    assert(extglob.isMatch('abef', 'ab***ef'));
    assert(extglob.isMatch('abef', 'ab**'));
  });

  it('bug in all versions up to and including bash-2.05b', function() {
    assert(extglob.isMatch('123abc', '*?(a)bc'));
  });

  it('should work with character classes', function() {
    var fixtures = ['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b'];
    assert.deepEqual(extglob.match(fixtures, 'a[-.,:\;\ _]b'), fixtures);
    assert.deepEqual(extglob.match(fixtures, 'a@([-.,:; _])b'), fixtures);

    assert.deepEqual(extglob.match(fixtures, 'a@([.])b'), ['a.b']);
    assert.deepEqual(extglob.match(fixtures, 'a@([^.])b'), ['a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b']);
    assert.deepEqual(extglob.match(fixtures, 'a@([^x])b'), fixtures);
  });

  it('should support POSIX character classes in extglobs', function() {
    assert(extglob.isMatch('a.c', '+([[:alpha:].])'));
    assert(extglob.isMatch('a.c', '+([[:alpha:].])+([[:alpha:].])'));
    assert(extglob.isMatch('a.c', '*([[:alpha:].])'));
    assert(extglob.isMatch('a.c', '*([[:alpha:].])*([[:alpha:].])'));

    assert(extglob.isMatch('a.c', '?([[:alpha:].])?([[:alpha:].])?([[:alpha:].])'));
    assert(extglob.isMatch('a.c', '@([[:alpha:].])@([[:alpha:].])@([[:alpha:].])'));

    assert(!extglob.isMatch('.', '!(\\.)'));
    assert(!extglob.isMatch('.', '!([[:alpha:].])'));
    assert(extglob.isMatch('.', '?([[:alpha:].])'));
    assert(extglob.isMatch('.', '@([[:alpha:].])'));
  });

  // ported from http://www.bashcookbook.com/bashinfo/source/bash-4.3/tests/extglob1a.sub
  it('should pass extglob1a tests', function() {
    assert.deepEqual(extglob.match(['a', 'ab', 'ba'], 'a*!(x)'), ['a', 'ab']);
    assert.deepEqual(extglob.match(['a', 'ab', 'ba'], 'a!(x)'), ['a', 'ab']);
    assert.deepEqual(extglob.match(['a', 'ab', 'ba'], 'a*?(x)'), ['a', 'ab']);
    assert.deepEqual(extglob.match(['a', 'ab', 'ba'], 'a?(x)'), ['a']);
  });


  // ported from http://www.bashcookbook.com/bashinfo/source/bash-4.3/tests/extglob2.tests
  it('should pass extglob2 tests', function() {
    assert(extglob.isMatch('fofo', '*(f*(o))'));
    assert(extglob.isMatch('ffo', '*(f*(o))'));
    assert(extglob.isMatch('foooofo', '*(f*(o))'));
    assert(extglob.isMatch('foooofof', '*(f*(o))'));
    assert(extglob.isMatch('fooofoofofooo', '*(f*(o))'));
    assert(!extglob.isMatch('foooofof', '*(f+(o))'));
    assert(!extglob.isMatch('xfoooofof', '*(f*(o))'));
    assert(!extglob.isMatch('foooofofx', '*(f*(o))'));
    assert(extglob.isMatch('ofxoofxo', '*(*(of*(o)x)o)'));
    assert(!extglob.isMatch('ofooofoofofooo', '*(f*(o))'));
    assert(extglob.isMatch('foooxfooxfoxfooox', '*(f*(o)x)'));
    assert(!extglob.isMatch('foooxfooxofoxfooox', '*(f*(o)x)'));
    assert(extglob.isMatch('foooxfooxfxfooox', '*(f*(o)x)'));
    assert(extglob.isMatch('ofxoofxo', '*(*(of*(o)x)o)'));
    assert(extglob.isMatch('ofoooxoofxo', '*(*(of*(o)x)o)'));
    assert(extglob.isMatch('ofoooxoofxoofoooxoofxo', '*(*(of*(o)x)o)'));
    assert(extglob.isMatch('ofoooxoofxoofoooxoofxoo', '*(*(of*(o)x)o)'));
    assert(!extglob.isMatch('ofoooxoofxoofoooxoofxofo', '*(*(of*(o)x)o)'));
    assert(extglob.isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(*(of*(o)x)o)'));
    assert(extglob.isMatch('aac', '*(@(a))a@(c)'));
    assert(extglob.isMatch('ac', '*(@(a))a@(c)'));
    assert(!extglob.isMatch('c', '*(@(a))a@(c)'));
    assert(extglob.isMatch('aaac', '*(@(a))a@(c)'));
    assert(!extglob.isMatch('baaac', '*(@(a))a@(c)'));
    assert(extglob.isMatch('abcd', '?@(a|b)*@(c)d'));
    assert(extglob.isMatch('abcd', '@(ab|a*@(b))*(c)d'));
    assert(extglob.isMatch('acd', '@(ab|a*(b))*(c)d'));
    assert(extglob.isMatch('abbcd', '@(ab|a*(b))*(c)d'));
    assert(extglob.isMatch('effgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    assert(extglob.isMatch('efgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    assert(extglob.isMatch('egz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    assert(extglob.isMatch('egzefffgzbcdij', '*(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    assert(!extglob.isMatch('egz', '@(b+(c)d|e+(f)g?|?(h)i@(j|k))'));
    assert(extglob.isMatch('ofoofo', '*(of+(o))'));
    assert(extglob.isMatch('oxfoxoxfox', '*(oxf+(ox))'));
    assert(!extglob.isMatch('oxfoxfox', '*(oxf+(ox))'));
    assert(extglob.isMatch('ofoofo', '*(of+(o)|f)'));
    // The following is supposed to match only as fo+ofo+ofo
    assert(extglob.isMatch('foofoofo', '@(foo|f|fo)*(f|of+(o))'));
    assert(extglob.isMatch('oofooofo', '*(of|oof+(o))'));
    assert(extglob.isMatch('fffooofoooooffoofffooofff', '*(*(f)*(o))'));
  });

  it('should support backtracking in alternation matches', function() {
    assert(extglob.isMatch('fofoofoofofoo', '*(fo|foo)'));
  });

  it('should support exclusions', function() {
    assert(extglob.isMatch('foo', '!(x)'));
    assert(extglob.isMatch('foo', '!(x)*'));
    assert(!extglob.isMatch('foo', '!(foo)'));
    assert(extglob.isMatch('foobar', '!(foo)'));
    assert(!extglob.isMatch('mad.moo.cow', '!(*.*).!(*.*)'));
    assert(!extglob.isMatch('mucca.pazza', 'mu!(*(c))?.pa!(*(z))?'));
    assert(extglob.isMatch('fff', '!(f)'));
    assert(extglob.isMatch('fff', '*(!(f))'));
    assert(extglob.isMatch('fff', '+(!(f))'));
    assert(extglob.isMatch('ooo', '!(f)'));
    assert(extglob.isMatch('ooo', '*(!(f))'));
    assert(extglob.isMatch('ooo', '+(!(f))'));
    assert(extglob.isMatch('foo', '!(f)'));
    assert(extglob.isMatch('foo', '*(!(f))'));
    assert(extglob.isMatch('foo', '+(!(f))'));
    assert(!extglob.isMatch('f', '!(f)'));
    assert(!extglob.isMatch('f', '*(!(f))'));
    assert(!extglob.isMatch('f', '+(!(f))'));
    assert(extglob.isMatch('foot', '@(!(z*)|*x)'));
    assert(!extglob.isMatch('zoot', '@(!(z*)|*x)'));
    assert(extglob.isMatch('foox', '@(!(z*)|*x)'));
    assert(extglob.isMatch('zoox', '@(!(z*)|*x)'));
    assert(!extglob.isMatch('foob', '!(foo)b*'));
  });

  it('should pass extglob3 tests', function() {
    assert(extglob.isMatch('ab/../', '@(ab|+([^/]))/..?(/)'));
    assert(extglob.isMatch('ab/../', '+([^/])/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(ab|?b)/..?(/)'));
    assert(extglob.isMatch('ab/../', '+([^/])/../'));
    assert(extglob.isMatch('ab/../', '+([!/])/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(ab|+([!/]))/..?(/)'));
    assert(extglob.isMatch('ab/../', '+([!/])/../'));
    assert(extglob.isMatch('ab/../', '+([!/])/..?(/)'));
    assert(extglob.isMatch('ab/../', '+([!/])/..@(/)'));
    assert(extglob.isMatch('ab/../', '+(ab)/..?(/)'));
    assert(extglob.isMatch('ab/../', '[!/][!/]/../'));
    assert(extglob.isMatch('ab/../', '@(ab|?b)/..?(/)'));
    assert(extglob.isMatch('ab/../', '[^/][^/]/../'));
    assert(extglob.isMatch('ab/../', '?b/..?(/)'));
    assert(extglob.isMatch('ab/../', '+(?b)/..?(/)'));
    assert(extglob.isMatch('ab/../', '+(?b|?b)/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(?b|?b)/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(a?|?b)/..?(/)'));
    assert(extglob.isMatch('ab/../', '?(ab)/..?(/)'));
    assert(extglob.isMatch('ab/../', '?(ab|??)/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(??)/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(??|a*)/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(a*)/..?(/)'));
    assert(extglob.isMatch('ab/../', '+(??)/..?(/)'));
    assert(extglob.isMatch('ab/../', '+(??|a*)/..?(/)'));
    assert(extglob.isMatch('ab/../', '+(a*)/..?(/)'));
    assert(extglob.isMatch('x', '@(x)'));
  });
});
