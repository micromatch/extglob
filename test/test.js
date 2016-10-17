'use strict';

var assert = require('assert');
var match = require('./support/match');
var extglob = require('..');

/**
 * These tests were converted directly from bash 4.3 and 4.4 unit tests.
 */

describe('extglobs', function() {
  it('should export a function', function() {
    assert.equal(typeof extglob, 'function');
  });

  it.skip('failing unit test from bash', function() {
    match(['moo.cow'], '!(*.*).!(*.*)', ['moo.cow']);
  });

  it('should throw on imbalanced sets when `options.strictErrors` is true', function() {
    assert.throws(function() {
      match.isMatch('a((b', 'a(b', {strictErrors: true});
    }, 'row:1 col:2 missing opening parens: "a(b"');

    assert.throws(function() {
      match.isMatch('a((b', 'a(*b', {strictErrors: true});
    }, 'row:1 col:2 missing opening parens: "a(*b"');
  });

  // from minimatch tests
  it('should match extglobs ending with statechar', function() {
    assert(!match.isMatch('ax', 'a?(b*)'));
    assert(match.isMatch('ax', '?(a*|b)'));
  });

  it('should not choke on non-extglobs', function() {
    match(['c/z/v'], 'c/z/v', ['c/z/v']);
  });

  it('should support star (`*`) extglobs', function() {
    match(['cz', 'abz', 'az'], 'a*(z)', ['az']);
    match(['cz', 'abz', 'az'], 'a**(z)', ['az', 'abz']);
    match(['c/z/v', 'z', 'zf', 'fz'], '*(z)', ['z']);
    match(['c/z/v', 'c/a/v'], 'c/*(z)/v', ['c/z/v']);
    match(['a.js.js', 'a.md.js'], '*.*(js).js', ['a.js.js']);
  });

  it('should support negation (`!`) extglobs', function() {
    match(['c/z/v', 'c/a/v'], 'c/!(z)/v', ['c/a/v']);
    match(['c/z/v', 'c/a/v'], 'c/!(z)/v', ['c/a/v']);
    match(['cz', 'abz', 'az'], 'a!(z)', ['abz']);
    match(['cz', 'abz', 'az'], 'a*!(z)', ['az', 'abz']);
    match(['c/a/v'], 'c/!(z)/v', ['c/a/v']);
    match(['a/z', 'a/b'], 'a/!(z)', ['a/b']);

    var f1 = ['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'];
    match(f1, '*(b/a)', ['b/a']);
    match(f1, '!(b/a)', [], {star: '[^/]*?'});
    match(f1, '!((b/a))', [], {star: '[^/]*?'});
    match(f1, '!((?:b/a))', [], {star: '[^/]*?'});
    match(f1, '!(b/(a))', [], {star: '[^/]*?'});

    match(f1, '!(b/a)', ['a/a', 'a/b', 'a/c', 'b/b', 'b/c']);
    match(f1, '!((b/a))', ['a/a', 'a/b', 'a/c', 'b/b', 'b/c']);
    match(f1, '!((?:b/a))', ['a/a', 'a/b', 'a/c', 'b/b', 'b/c']);
    match(f1, '!(b/(a))', ['a/a', 'a/b', 'a/c', 'b/b', 'b/c']);

    var f2 = ['a', 'b', 'aa', 'ab', 'bb', 'ac', 'aaa', 'aab', 'abb', 'ccc'];
    match(f2, '!(a)', ['aa', 'aaa', 'aab', 'ab', 'abb', 'ac', 'b', 'bb', 'ccc']);
    match(f2, '!(a)*', ['b', 'bb', 'ccc']);
    match(f2, 'a!(b)*', ['a', 'aa', 'aaa', 'aab', 'ac']);
  });

  it('should support plus (`+`) extglobs', function() {
    match(['cz', 'abz', 'az'], 'a+(z)', ['az']);
    match(['c/z/v', 'z', 'zf', 'fz'], '+(z)', ['z']);
    match(['c/z/v', 'c/a/v'], 'c/+(z)/v', ['c/z/v']);
    match(['az', 'bz', 'axz'], 'a+(z)', ['az']);
  });

  it('should support qmark (`?`) extglobs', function() {
    match(['c/z/v', 'z', 'zf', 'fz'], '?(z)', ['z']);
    match(['cz', 'abz', 'az'], 'a?(z)', ['az']);
  });

  it('should support ampersand (`@`) extglobs', function() {
    match(['c/z/v', 'c/a/v'], 'c/@(z)/v', ['c/z/v']);
    match(['cz', 'abz', 'az'], 'a*@(z)', ['az', 'abz']);
    match(['cz', 'abz', 'az'], 'a@(z)', ['az']);
  });

  it('should support qmark matching', function() {
    var arr = ['a', 'aa', 'ab', 'aaa', 'abcdefg'];
    match(arr, '?', ['a']);
    match(arr, '??', ['aa', 'ab']);
    match(arr, '???', ['aaa']);
  });

  it('should match exactly one of the given pattern:', function() {
    var arr = ['aa.aa', 'a.bb', 'a.aa.a', 'cc.a', 'a.a', 'c.a', 'dd.aa.d', 'b.a'];
    match(arr, '(b|a).(a)', ['a.a', 'b.a']);
    match(arr, '@(b|a).@(a)', ['a.a', 'b.a']);
  });

  it('stuff from korn\'s book', function() {
    assert(match.isMatch('paragraph', 'para@(chute|graph)'));
    assert(!match.isMatch('paramour', 'para@(chute|graph)'));
    assert(match.isMatch('para991', 'para?([345]|99)1'));
    assert(!match.isMatch('para381', 'para?([345]|99)1'));
    assert(!match.isMatch('paragraph', 'para*([0-9])'));
    assert(match.isMatch('para', 'para*([0-9])'));
    assert(match.isMatch('para13829383746592', 'para*([0-9])'));
    assert(!match.isMatch('paragraph', 'para*([0-9])'));
    assert(!match.isMatch('para', 'para+([0-9])'));
    assert(match.isMatch('para987346523', 'para+([0-9])'));
    assert(match.isMatch('paragraph', 'para!(*.[0-9])'));
    assert(match.isMatch('para.38', 'para!(*.[00-09])'));
    assert(match.isMatch('para.graph', 'para!(*.[0-9])'));
    assert(match.isMatch('para39', 'para!(*.[0-9])'));
  });

  it('tests derived from those in rosenblatt\'s korn shell book', function() {
    match(['', '137577991', '2468'], '*(0|1|3|5|7|9)', ['', '137577991']);
    match(['file.c', 'file.C', 'file.cc', 'file.ccc'], '*.c?(c)', ['file.c', 'file.cc']);
    match(['parse.y', 'shell.c', 'Makefile', 'Makefile.in'], '!(*.c|*.h|Makefile.in|config*|README)', ['parse.y', 'Makefile']);
    match(['VMS.FILE;', 'VMS.FILE;0', 'VMS.FILE;1', 'VMS.FILE;139', 'VMS.FILE;1N'], '*\\;[1-9]*([0-9])', ['VMS.FILE;1', 'VMS.FILE;139']);
  });

  it('tests derived from the pd-ksh test suite', function() {
    match(['abcx', 'abcz', 'bbc'], '!([[*])*', ['abcx', 'abcz', 'bbc']);
    match(['abcx', 'abcz', 'bbc'], '+(a|b\\[)*', ['abcx', 'abcz']);
    match(['abd', 'acd'], 'a+(b|c)d', ['abd', 'acd']);
    match(['abd', 'acd', 'ac', 'ab'], 'a!(@(b|B))', ['acd', 'abd', 'ac']);
    match(['abd', 'acd'], 'a!(@(b|B))d', ['acd']);
    match(['abd', 'acd'], 'a[b*(foo|bar)]d', ['abd']);
    match(['abcx', 'abcz', 'bbc', 'aaz', 'aaaz'], '[a*(]*z', ['aaz', 'aaaz', 'abcz']);
  });

  it('simple kleene star tests', function() {
    assert(!match.isMatch('foo', '*(a|b\\[)'));
    assert(match.isMatch('foo', '*(a|b\\[)|f*'));
  });

  it('this doesn\'t work in bash either (per bash extglob.tests notes)', function() {
    assert(!match.isMatch('*(a|b[)', '*(a|b\\[)'));
    assert(match.isMatch('*(a|b[)', '\\*\\(a\\|b\\[\\)'));
  });

  it('should support multiple extglobs:', function() {
    var arr = ['a.a', 'a.b', 'a.c', 'a.c.d', 'c.c', 'a.', 'd.d', 'e.e', 'f.f', 'a.abcd'];
    match(arr, '*.(a|b|@(ab|a*@(b))*(c)d)', ['a.a', 'a.b', 'a.abcd']);
    match(arr, '!(*.a|*.b|*.c)', ['a.', 'a.c.d', 'd.d', 'e.e', 'f.f']);
    match(arr, '!(*.[^a-c])', ['a.a', 'a.b', 'a.c', 'c.c', 'a.', 'a.abcd']);
    match(arr, '!(*.[a-c])', ['a.', 'a.c.d', 'a.abcd', 'd.d', 'e.e', 'f.f']);
    match(arr, '!(*.[a-c]*)', ['a.', 'a.c.d', 'd.d', 'e.e', 'f.f']);
    match(arr, '!(*.[a-c])*', ['a.', 'd.d', 'e.e', 'f.f']);
    match(arr, '*!(.a|.b|.c)', arr);
    match(arr, '*!(.a|.b|.c)*', arr);
    match(arr, '*.!(a|b|c)', ['a.c.d', 'a.', 'd.d', 'e.e', 'f.f']);
    match(arr, '*.!(a|b|c)*', ['a.c.d', 'a.', 'd.d', 'e.e', 'f.f']);
  });

  it('should correctly match empty parens', function() {
    match(['def', 'ef'], '()ef', ['ef']);
  });

  it('should match escaped parens', function() {
    var arr = ['a(b', 'a\\(b', 'a((b', 'a((((b', 'ab'];
    match(arr, 'a(b', ['a(b']);
    match(arr, 'a\\(b', ['a(b']);
    match(arr, 'a(*b', ['a(b', 'a((b', 'a((((b']);
  });

  it('should match escaped backslashes', function() {
    match(['a(b', 'a\\(b', 'a((b', 'a((((b', 'ab'], 'a\\\\(b', ['a\\(b']);
    match(['a\\b', 'a/b', 'ab'], 'a\\\\b', ['a\\b']);
  });

  // these are not extglobs, and do not need to pass, but they are included
  // to test integration with expand-brackets
  it('should match common regex patterns', function() {
    var fixtures = ['a c', 'a1c', 'a123c', 'a.c', 'a.xy.zc', 'a.zc', 'abbbbc', 'abbbc', 'abbc', 'abc', 'abq', 'axy zc', 'axy', 'axy.zc', 'axyzc'];

    match(['a\\b', 'a/b', 'ab'], 'a/b', ['a/b']);
    match(fixtures, 'ab?bc', ['abbbc']);
    match(fixtures, 'ab*c', ['abbbbc', 'abbbc', 'abbc', 'abc']);
    match(fixtures, 'ab+bc', ['abbbbc', 'abbbc', 'abbc']);
    match(fixtures, '^abc$', ['abc']);
    match(fixtures, 'a.c', ['a.c']);
    match(fixtures, 'a.*c', ['a.c', 'a.xy.zc', 'a.zc']);
    match(fixtures, 'a*c', ['a c', 'a.c', 'a1c', 'a123c', 'abbbbc', 'abbbc', 'abbc', 'abc', 'axyzc', 'axy zc', 'axy.zc', 'a.xy.zc', 'a.zc']);
    match(fixtures, 'a\\w+c', ['a1c', 'a123c', 'abbbbc', 'abbbc', 'abbc', 'abc', 'axyzc'], 'Should match word characters');
    match(fixtures, 'a\\W+c', ['a.c', 'a c'], 'Should match non-word characters');
    match(fixtures, 'a\\d+c', ['a1c', 'a123c'], 'Should match numbers');
    match(['foo@#$%123ASD #$$%^&', 'foo!@#$asdfl;', '123'], '\\d+', ['123']);
    match(['a123c', 'abbbc'], 'a\\D+c', ['abbbc'], 'Should match non-numbers');
    match(['foo', ' foo '], '(f|o)+\\b', ['foo'], 'Should match word boundaries');
  });
});

describe('bash unit tests', function() {
  var fixtures = ['ffffffo', 'fffooofoooooffoofffooofff', 'ffo', 'fofo', 'fofoofoofofoo', 'foo', 'foob', 'foobb', 'foofoofo', 'fooofoofofooo', 'foooofo', 'foooofof', 'foooofofx', 'foooxfooxfoxfooox', 'foooxfooxfxfooox', 'foooxfooxofoxfooox', 'foot', 'foox', 'ofoofo', 'ofooofoofofooo', 'ofoooxoofxo', 'ofoooxoofxoofoooxoofxo', 'ofoooxoofxoofoooxoofxofo', 'ofoooxoofxoofoooxoofxoo', 'ofoooxoofxoofoooxoofxooofxofxo', 'ofxoofxo', 'oofooofo', 'ooo', 'oxfoxfox', 'oxfoxoxfox', 'xfoooofof'];

  it('should match extended globs from the bash spec:', function() {
    var f2 = ['bar', 'f', 'fa', 'fb', 'ff', 'fff', 'fo', 'foo', 'foo/bar', 'foobar', 'foot', 'foox', 'o', 'of', 'ooo', 'ox', 'x', 'xx'];
    match(f2, '!(foo)', ['bar', 'f', 'fa', 'fb', 'ff', 'fff', 'fo', 'foo/bar', 'foobar', 'foot', 'foox', 'o', 'of', 'ooo', 'ox', 'x', 'xx']);
    match(f2, '!(!(foo))', ['foo']);
    match(f2, '!(!(!(foo)))', ['bar', 'f', 'fa', 'fb', 'ff', 'fff', 'fo', 'foo/bar', 'foobar', 'foot', 'foox', 'o', 'of', 'ooo', 'ox', 'x', 'xx']);
    match(f2, '!(!(!(!(foo))))', ['foo']);
    match(f2, '!(!(foo))*', ['foo', 'foo/bar', 'foobar', 'foot', 'foox']);
    match(f2, '!(f!(o))', ['fo']);
    match(f2, '!(f(o))', ['bar', 'f', 'fa', 'fb', 'ff', 'fff', 'foo', 'foobar', 'foo/bar', 'foot', 'foox', 'o', 'of', 'ooo', 'ox', 'x', 'xx']);
    match(f2, '!(f)', ['bar', 'fa', 'fb', 'ff', 'fff', 'fo', 'foo', 'foobar', 'foo/bar', 'foot', 'foox', 'o', 'of', 'ooo', 'ox', 'x', 'xx']);
    match(f2, '!(f)', ['bar', 'fa', 'fb', 'ff', 'fff', 'fo', 'foo', 'foobar', 'foo/bar', 'foot', 'foox', 'o', 'of', 'ooo', 'ox', 'x', 'xx']);
    match(f2, '!(foo)', ['bar', 'f', 'fa', 'fb', 'ff', 'fff', 'fo', 'foobar', 'foo/bar', 'foot', 'foox', 'o', 'of', 'ooo', 'ox', 'x', 'xx']);
    match(f2, '!(foo)*', ['bar', 'f', 'fa', 'fb', 'ff', 'fff', 'fo', 'o', 'of', 'ooo', 'ox', 'x', 'xx']);
    match(f2, '!(x)', ['bar', 'f', 'fa', 'fb', 'ff', 'fff', 'fo', 'foo', 'foobar', 'foo/bar', 'foot', 'foox', 'o', 'of', 'ooo', 'ox', 'xx']);
    match(f2, '!(x)*', ['bar', 'f', 'fa', 'fb', 'ff', 'fff', 'fo', 'foo', 'foobar', 'foo/bar', 'foot', 'foox', 'o', 'of', 'ooo', 'ox']);
    match(f2, '*(!(f))', ['bar', 'fa', 'fb', 'ff', 'fff', 'fo', 'foo', 'foobar', 'foo/bar', 'foot', 'foox', 'o', 'of', 'ooo', 'ox', 'x', 'xx']);
    match(f2, '*((foo))', ['foo']);
    match(f2, '+(!(f))', ['bar', 'fa', 'fb', 'ff', 'fff', 'fo', 'foo', 'foobar', 'foo/bar', 'foot', 'foox', 'o', 'of', 'ooo', 'ox', 'x', 'xx']);
    match(f2, '@(!(z*)|*x)', ['bar', 'f', 'fa', 'fb', 'ff', 'fff', 'fo', 'foo', 'foobar', 'foo/bar', 'foot', 'foox', 'o', 'of', 'ooo', 'ox', 'x', 'xx']);
    match(f2, 'foo/!(foo)', ['foo/bar']);

    match(fixtures, '(foo)bb', ['foobb']);
    match(fixtures, '*(*(f)*(o))', [ 'ffffffo', 'fffooofoooooffoofffooofff', 'ffo', 'fofo', 'fofoofoofofoo', 'foo', 'foofoofo', 'fooofoofofooo', 'foooofo', 'foooofof', 'ofoofo', 'ofooofoofofooo', 'oofooofo', 'ooo']);
    match(fixtures, '*(*(of*(o)x)o)', [ 'ofoooxoofxo', 'ofoooxoofxoofoooxoofxo', 'ofoooxoofxoofoooxoofxoo', 'ofoooxoofxoofoooxoofxooofxofxo', 'ofxoofxo', 'ooo']);
    match(fixtures, '*(f*(o))', ['ffffffo', 'fffooofoooooffoofffooofff', 'ffo', 'fofo', 'fofoofoofofoo', 'foo', 'foofoofo', 'fooofoofofooo', 'foooofo', 'foooofof']);
    match(fixtures, '*(f*(o)x)', ['foooxfooxfoxfooox', 'foooxfooxfxfooox', 'foox']);
    match(fixtures, '*(f+(o))', ['fofo', 'fofoofoofofoo', 'foo', 'foofoofo', 'fooofoofofooo', 'foooofo']);
    match(fixtures, '*(of+(o))', ['ofoofo']);
    match(fixtures, '*(of+(o)|f)', ['fofo', 'fofoofoofofoo', 'ofoofo', 'ofooofoofofooo']);
    match(fixtures, '*(of|oof+(o))', ['ofoofo', 'oofooofo']);
    match(fixtures, '*(oxf+(ox))', ['oxfoxoxfox']);
    match(fixtures, '@(!(z*)|*x)', ['ffffffo', 'fffooofoooooffoofffooofff', 'ffo', 'fofo', 'fofoofoofofoo', 'foo', 'foob', 'foobb', 'foofoofo', 'fooofoofofooo', 'foooofo', 'foooofof', 'foooofofx', 'foooxfooxfoxfooox', 'foooxfooxfxfooox', 'foooxfooxofoxfooox', 'foot', 'foox', 'ofoofo', 'ofooofoofofooo', 'ofoooxoofxo', 'ofoooxoofxoofoooxoofxo', 'ofoooxoofxoofoooxoofxofo', 'ofoooxoofxoofoooxoofxoo', 'ofoooxoofxoofoooxoofxooofxofxo', 'ofxoofxo', 'oofooofo', 'ooo', 'oxfoxfox', 'oxfoxoxfox', 'xfoooofof']);
    match(fixtures, '@(foo|f|fo)*(f|of+(o))', ['fofo', 'fofoofoofofoo', 'foo', 'foofoofo', 'fooofoofofooo']);

    var arr = ['aaac', 'aac', 'ac', 'abbcd', 'abcd', 'acd', 'baaac', 'c', 'foo'];
    match(arr, '*(@(a))a@(c)', ['aaac', 'aac', 'ac']);
    match(arr, '@(ab|a*(b))*(c)d', ['abbcd', 'abcd', 'acd']);
    match(arr, '?@(a|b)*@(c)d', ['abbcd', 'abcd']);
    match(arr, '@(ab|a*@(b))*(c)d', ['abbcd', 'abcd']);
    match(['aac'], '*(@(a))b@(c)', []);
  });

  it('should backtrack in alternation matches', function() {
    match(fixtures, '*(fo|foo)', ['fofo', 'fofoofoofofoo', 'foo', 'foofoofo']);
  });

  it('should support exclusions', function() {
    match(['foob', 'foobb', 'foo', 'bar', 'baz', 'foobar'], '!(foo)b*', ['bar', 'baz']);
    match(['foo', 'bar', 'baz', 'foobar'], '*(!(foo))', ['bar', 'baz', 'foobar']);

    // Bash 4.3 says this should match `foo` and `foobar` too
    match(['foo', 'bar', 'baz', 'foobar'], '!(foo)*', ['bar', 'baz']);

    match(['moo.cow', 'moo', 'cow'], '!(*.*)', ['moo', 'cow']);
    match(['mad.moo.cow'], '!(*.*).!(*.*)', []);
    match(['moo.cow', 'moo', 'cow'], '!(*.*).', []);
    match(['moo.cow', 'moo', 'cow'], '.!(*.*)', []);
    match(['mucca.pazza'], 'mu!(*(c))?.pa!(*(z))?', []);

    match(['effgz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', ['effgz']);
    match(['efgz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', ['efgz']);
    match(['egz'], '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', ['egz']);
    match(['egz'], '@(b+(c)d|e+(f)g?|?(h)i@(j|k))', []);
    match(['egzefffgzbcdij'], '*(b+(c)d|e*(f)g?|?(h)i@(j|k))', ['egzefffgzbcdij']);
  });

  it('valid numbers', function() {
    assert(match.isMatch('/dev/udp/129.22.8.102/45', '/dev/@(tcp|udp)/*/*'));
    match(['0', '12', '1', '12abc', '555'], '[1-6]([0-9])', ['12']);
    match(['0', '12', '1', '12abc', '555'], '[1-6]*([0-9])', ['1', '12', '555']);
    match(['0', '12', '1', '12abc', '555'], '[1-5]*([6-9])', ['1']);
    match(['0', '12', '1', '12abc', '555'], '0|[1-6]*([0-9])', ['0', '1', '12', '555']);
    match(['07', '0377', '09'], '+([0-7])', ['0377', '07']);
  });

  it('stuff from korn\'s book', function() {
    assert(!match.isMatch('para', 'para+([0-9])'));
    assert(!match.isMatch('para381', 'para?([345]|99)1'));
    assert(!match.isMatch('paragraph', 'para*([0-9])'));
    assert(!match.isMatch('paragraph', 'para*([0-9])'));
    assert(!match.isMatch('paramour', 'para@(chute|graph)'));
    assert(match.isMatch('para', 'para*([0-9])'));
    assert(match.isMatch('para.38', 'para!(*.[0-9])'));
    assert(match.isMatch('para.graph', 'para!(*.[0-9])'));
    assert(match.isMatch('para13829383746592', 'para*([0-9])'));
    assert(match.isMatch('para39', 'para!(*.[0-9])'));
    assert(match.isMatch('para987346523', 'para+([0-9])'));
    assert(match.isMatch('para991', 'para?([345]|99)1'));
    assert(match.isMatch('paragraph', 'para!(*.[0-9])'));
    assert(match.isMatch('paragraph', 'para@(chute|graph)'));
  });

  it('tests derived from those in rosenblatt\'s korn shell book', function() {
    assert(match.isMatch('', '*(0|1|3|5|7|9)'));
    assert(match.isMatch('137577991', '*(0|1|3|5|7|9)'));
    assert(!match.isMatch('2468', '*(0|1|3|5|7|9)'));

    assert(!match.isMatch('file.C', '*.c?(c)'));
    assert(!match.isMatch('file.ccc', '*.c?(c)'));
    assert(match.isMatch('file.c', '*.c?(c)'));
    assert(match.isMatch('file.cc', '*.c?(c)'));

    assert(match.isMatch('parse.y', '!(*.c|*.h|Makefile.in|config*|README)'));
    assert(match.isMatch('Makefile', '!(*.c|*.h|Makefile.in|config*|README)'));
    assert(!match.isMatch('shell.c', '!(*.c|*.h|Makefile.in|config*|README)'));

    assert(!match.isMatch('VMS.FILE;', '*\\;[1-9]*([0-9])'));
    assert(!match.isMatch('VMS.FILE;0', '*\\;[1-9]*([0-9])'));
    assert(!match.isMatch('VMS.FILE;1N', '*\\;[1-9]*([0-9])'));
    assert(match.isMatch('VMS.FILE;1', '*\\;[1-9]*([0-9])'));
    assert(match.isMatch('VMS.FILE;139', '*\\;[1-9]*([0-9])'));
  });

  it('tests derived from the pd-ksh test suite', function() {
    match(['abcx', 'abcz', 'bbc'], '!([*)*', []);
    match(['abcx', 'abcz', 'bbc'], '+(a|b[)*', []);
    match(['abcx', 'abcz', 'bbc'], '[a*(]*)z', []);

    match(['abc'], '+()c', []);
    match(['abc'], '+()x', []);
    match(['abc'], '+(*)c', ['abc']);
    match(['abc'], '+(*)x', []);

    match(['abc'], 'no-file+(a|b)stuff', []);
    match(['abc'], 'no-file+(a*(c)|b)stuff', []);

    match(['abd', 'acd'], 'a+(b|c)d', ['abd', 'acd']);
    match(['abc'], 'a+(b|c)d', []);

    match(['acd'], 'a!(@(b|B))d', ['acd']);
    match(['abc', 'abd'], 'a!(@(b|B))d', []);

    match(['abd'], 'a[b*(foo|bar)]d', ['abd']);
    match(['abc', 'acd'], 'a[b*(foo|bar)]d', []);
  });

  it('simple kleene star tests', function() {
    assert(!match.isMatch('foo', '*(a|b[)'));
    assert(!match.isMatch('(', '*(a|b[)'));
    assert(!match.isMatch(')', '*(a|b[)'));
    assert(!match.isMatch('|', '*(a|b[)'));
    assert(match.isMatch('a', '*(a|b)'));
    assert(match.isMatch('b', '*(a|b)'));
    assert(match.isMatch('b[', '*(a|b\\[)'));
    assert(match.isMatch('ab[', '+(a|b\\[)'));
    assert(!match.isMatch('ab[cde', '+(a|b\\[)'));
    assert(match.isMatch('ab[cde', '+(a|b\\[)*'));
  });

  it('check extended globbing in pattern removal', function() {
    match(['a', 'abc'], '+(a|abc)', ['a', 'abc']);
    match(['abcd', 'abcde', 'abcedf'], '+(a|abc)', []);

    match(['f'], '+(def|f)', ['f']);

    match(['def'], '+(f|def)', ['def']);
    match(['cdef', 'bcdef', 'abcedf'], '+(f|def)', []);

    match(['abcd'], '*(a|b)cd', ['abcd']);
    match(['a', 'ab', 'abc'], '*(a|b)cd', []);

    match(['a', 'ab', 'abc', 'abcde', 'abcdef'], '"*(a|b)cd"', []);
  });

  it('More tests derived from a bug report (in bash) concerning extended glob patterns following a *', function() {
    var fixtures = ['123abc', 'ab', 'abab', 'abcdef', 'accdef', 'abcfefg', 'abef', 'abcfef', 'abd', 'acd'];
    match(['/dev/udp/129.22.8.102/45'], '/dev\\/@(tcp|udp)\\/*\\/*', ['/dev/udp/129.22.8.102/45']);
    match(fixtures, '(a+|b)*', ['ab', 'abab', 'accdef', 'abcdef', 'abcfefg', 'abef', 'abcfef', 'abd', 'acd']);
    match(fixtures, '(a+|b)+', ['ab', 'abab']);
    match(fixtures, 'a(b*(foo|bar))d', ['abd']);
    match(fixtures, 'ab*(e|f)', ['ab', 'abef']);
    match(fixtures, 'ab**(e|f)', ['ab', 'abab', 'abcdef', 'abcfef', 'abd', 'abef', 'abcfefg']);
    match(fixtures, 'ab**(e|f)g', ['abcfefg']);
    match(fixtures, 'ab***ef', ['abcdef', 'abcfef', 'abef']);
    match(fixtures, 'ab*+(e|f)', ['abcdef', 'abcfef', 'abef']);
    match(fixtures, 'ab*d*(e|f)', ['abcdef', 'abd']);
    match(fixtures, 'ab*d+(e|f)', ['abcdef']);
    match(fixtures, 'ab?*(e|f)', ['abcfef', 'abd', 'abef']);
  });

  it('bug in all versions up to and including bash-2.05b', function() {
    assert(match.isMatch('123abc', '*?(a)bc'));
  });

  it('should work with character classes', function() {
    var fixtures = ['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b'];
    match(fixtures, 'a[-.,:\;\ _]b', fixtures);
    match(fixtures, 'a@([-.,:; _])b', fixtures);
    match(fixtures, 'a@([.])b', ['a.b']);
    match(fixtures, 'a@([^.])b', ['a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b']);
    match(fixtures, 'a@([^x])b', ['a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b']);
  });

  it('should support POSIX character classes in extglobs', function() {
    assert(match.isMatch('a.c', '+([[:alpha:].])'));
    assert(match.isMatch('a.c', '+([[:alpha:].])+([[:alpha:].])'));
    assert(match.isMatch('a.c', '*([[:alpha:].])'));
    assert(match.isMatch('a.c', '*([[:alpha:].])*([[:alpha:].])'));
    assert(match.isMatch('a.c', '?([[:alpha:].])?([[:alpha:].])?([[:alpha:].])'));
    assert(match.isMatch('a.c', '@([[:alpha:].])@([[:alpha:].])@([[:alpha:].])'));
    assert(!match.isMatch('.', '!(\\.)'));
    assert(!match.isMatch('.', '!([[:alpha:].])'));
    assert(match.isMatch('.', '?([[:alpha:].])'));
    assert(match.isMatch('.', '@([[:alpha:].])'));
  });

  // ported from http://www.bashcookbook.com/bashinfo/source/bash-4.3/tests/extglob1a.sub
  it('should pass extglob1a tests', function() {
    var fixtures = ['a', 'ab', 'ba', 'ax'];
    match(fixtures, 'a!(x)', ['a', 'ab']);
    match(fixtures, 'a*!(x)', ['a', 'ab', 'ax']);
    match(fixtures, 'a*?(x)', ['a', 'ab', 'ax']);
    match(fixtures, 'a?(x)', ['a', 'ax']);
  });

  // ported from http://www.bashcookbook.com/bashinfo/source/bash-4.3/tests/extglob2.tests
  it('should pass extglob2 tests', function() {
    assert(!match.isMatch('baaac', '*(@(a))a@(c)'));
    assert(!match.isMatch('c', '*(@(a))a@(c)'));
    assert(!match.isMatch('egz', '@(b+(c)d|e+(f)g?|?(h)i@(j|k))'));
    assert(!match.isMatch('foooofof', '*(f+(o))'));
    assert(!match.isMatch('foooofofx', '*(f*(o))'));
    assert(!match.isMatch('foooxfooxofoxfooox', '*(f*(o)x)'));
    assert(!match.isMatch('ofooofoofofooo', '*(f*(o))'));
    assert(!match.isMatch('ofoooxoofxoofoooxoofxofo', '*(*(of*(o)x)o)'));
    assert(!match.isMatch('oxfoxfox', '*(oxf+(ox))'));
    assert(!match.isMatch('xfoooofof', '*(f*(o))'));
    assert(match.isMatch('aaac', '*(@(a))a@(c)'));
    assert(match.isMatch('aac', '*(@(a))a@(c)'));
    assert(match.isMatch('abbcd', '@(ab|a*(b))*(c)d'));
    assert(match.isMatch('abcd', '?@(a|b)*@(c)d'));
    assert(match.isMatch('abcd', '@(ab|a*@(b))*(c)d'));
    assert(match.isMatch('ac', '*(@(a))a@(c)'));
    assert(match.isMatch('acd', '@(ab|a*(b))*(c)d'));
    assert(match.isMatch('effgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    assert(match.isMatch('efgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    assert(match.isMatch('egz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    assert(match.isMatch('egzefffgzbcdij', '*(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    assert(match.isMatch('fffooofoooooffoofffooofff', '*(*(f)*(o))'));
    assert(match.isMatch('ffo', '*(f*(o))'));
    assert(match.isMatch('fofo', '*(f*(o))'));
    assert(match.isMatch('foofoofo', '@(foo|f|fo)*(f|of+(o))'));
    assert(match.isMatch('fooofoofofooo', '*(f*(o))'));
    assert(match.isMatch('foooofo', '*(f*(o))'));
    assert(match.isMatch('foooofof', '*(f*(o))'));
    assert(match.isMatch('foooxfooxfoxfooox', '*(f*(o)x)'));
    assert(match.isMatch('foooxfooxfxfooox', '*(f*(o)x)'));
    assert(match.isMatch('ofoofo', '*(of+(o))'));
    assert(match.isMatch('ofoofo', '*(of+(o)|f)'));
    assert(match.isMatch('ofoooxoofxo', '*(*(of*(o)x)o)'));
    assert(match.isMatch('ofoooxoofxoofoooxoofxo', '*(*(of*(o)x)o)'));
    assert(match.isMatch('ofoooxoofxoofoooxoofxoo', '*(*(of*(o)x)o)'));
    assert(match.isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(*(of*(o)x)o)'));
    assert(match.isMatch('ofxoofxo', '*(*(of*(o)x)o)'));
    assert(match.isMatch('oofooofo', '*(of|oof+(o))'));
    assert(match.isMatch('oxfoxoxfox', '*(oxf+(ox))'));
  });

  it('should support backtracking in alternation matches', function() {
    assert(match.isMatch('fofoofoofofoo', '*(fo|foo)'));
  });

  it('should support exclusions', function() {
    assert(!match.isMatch('f', '!(f)'));
    assert(!match.isMatch('f', '*(!(f))'));
    assert(!match.isMatch('f', '+(!(f))'));
    assert(!match.isMatch('foo', '!(foo)'));
    assert(!match.isMatch('foob', '!(foo)b*'));
    assert(!match.isMatch('mad.moo.cow', '!(*.*).!(*.*)'));
    assert(!match.isMatch('mucca.pazza', 'mu!(*(c))?.pa!(*(z))?'));
    assert(!match.isMatch('zoot', '@(!(z*)|*x)'));
    assert(match.isMatch('fff', '!(f)'));
    assert(match.isMatch('fff', '*(!(f))'));
    assert(match.isMatch('fff', '+(!(f))'));
    assert(match.isMatch('foo', '!(f)'));
    assert(match.isMatch('foo', '!(x)'));
    assert(match.isMatch('foo', '!(x)*'));
    assert(match.isMatch('foo', '*(!(f))'));
    assert(match.isMatch('foo', '+(!(f))'));
    assert(match.isMatch('foobar', '!(foo)'));
    assert(match.isMatch('foot', '@(!(z*)|*x)'));
    assert(match.isMatch('foox', '@(!(z*)|*x)'));
    assert(match.isMatch('ooo', '!(f)'));
    assert(match.isMatch('ooo', '*(!(f))'));
    assert(match.isMatch('ooo', '+(!(f))'));
    assert(match.isMatch('zoox', '@(!(z*)|*x)'));
  });

  it('should pass extglob3 tests', function() {
    assert(match.isMatch('ab/../', '+(??)/..?(/)'));
    assert(match.isMatch('ab/../', '+(??|a*)/..?(/)'));
    assert(match.isMatch('ab/../', '+(?b)/..?(/)'));
    assert(match.isMatch('ab/../', '+(?b|?b)/..?(/)'));
    assert(match.isMatch('ab/../', '+([!/])/../'));
    assert(match.isMatch('ab/../', '+([!/])/..?(/)'));
    assert(match.isMatch('ab/../', '+([!/])/..@(/)'));
    assert(match.isMatch('ab/../', '+([^/])/../'));
    assert(match.isMatch('ab/../', '+([^/])/..?(/)'));
    assert(match.isMatch('ab/../', '+(a*)/..?(/)'));
    assert(match.isMatch('ab/../', '+(ab)/..?(/)'));
    assert(match.isMatch('ab/../', '?(ab)/..?(/)'));
    assert(match.isMatch('ab/../', '?(ab|??)/..?(/)'));
    assert(match.isMatch('ab/../', '?b/..?(/)'));
    assert(match.isMatch('ab/../', '@(??)/..?(/)'));
    assert(match.isMatch('ab/../', '@(??|a*)/..?(/)'));
    assert(match.isMatch('ab/../', '@(?b|?b)/..?(/)'));
    assert(match.isMatch('ab/../', '@(a*)/..?(/)'));
    assert(match.isMatch('ab/../', '@(a?|?b)/..?(/)'));
    assert(match.isMatch('ab/../', '@(ab|+([!/]))/..?(/)'));
    assert(match.isMatch('ab/../', '@(ab|+([^/]))/..?(/)'));
    assert(match.isMatch('ab/../', '@(ab|?b)/..?(/)'));
    assert(match.isMatch('ab/../', '[!/][!/]/../'));
    assert(match.isMatch('ab/../', '[^/][^/]/../'));
    assert(match.isMatch('x', '@(x)'));
  });
});
