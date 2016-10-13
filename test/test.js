'use strict';

var util = require('util');
var assert = require('assert');
var argv = require('yargs-parser')(process.argv.slice(2));
var bash = require('./support/bash');
var minimatch = require('minimatch');
var extglob = require('..');

var matcher = argv.mm ? minimatch : extglob;
var isMatch = argv.mm ? minimatch : extglob.isMatch;

function compare(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}

function match(arr, pattern, expected, options) {
  var actual = matcher.match(arr, pattern, options).sort(compare);
  expected.sort(compare);
  // console.log("'" + actual.join('\', \'') + "'");

  if (argv.compare) {
    setTimeout(function() {
      var b;

      try {
        var bashed = bash.match(arr, pattern).sort(compare);
        b = util.inspect(bashed, {depth: null});
      } catch (err) {}

      var mm = minimatch.match(arr, pattern).sort(compare);
      var a = util.inspect(actual, {depth: null});
      var c = util.inspect(mm, {depth: null});

      if (b && a !== b) {
        console.log('pattern:', pattern);
        console.log('actual:', a);
        console.log('bash:', b);
        console.log('minimatch:', c);
        console.log();
      }
    }, 1);
  }

  assert.deepEqual(actual, expected, pattern + ' :: ' + extglob.makeRe(pattern));
}

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
      isMatch('a((b', 'a(b', {strictErrors: true});
    }, 'row:1 col:2 missing opening parens: "a(b"');

    assert.throws(function() {
      isMatch('a((b', 'a(*b', {strictErrors: true});
    }, 'row:1 col:2 missing opening parens: "a(*b"');
  });

  // from minimatch tests
  it('should match extglobs ending with statechar', function() {
    assert(!isMatch('ax', 'a?(b*)'));
    assert(isMatch('ax', '?(a*|b)'));
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
    assert(isMatch('paragraph', 'para@(chute|graph)'));
    assert(!isMatch('paramour', 'para@(chute|graph)'));
    assert(isMatch('para991', 'para?([345]|99)1'));
    assert(!isMatch('para381', 'para?([345]|99)1'));
    assert(!isMatch('paragraph', 'para*([0-9])'));
    assert(isMatch('para', 'para*([0-9])'));
    assert(isMatch('para13829383746592', 'para*([0-9])'));
    assert(!isMatch('paragraph', 'para*([0-9])'));
    assert(!isMatch('para', 'para+([0-9])'));
    assert(isMatch('para987346523', 'para+([0-9])'));
    assert(isMatch('paragraph', 'para!(*.[0-9])'));
    assert(isMatch('para.38', 'para!(*.[00-09])'));
    assert(isMatch('para.graph', 'para!(*.[0-9])'));
    assert(isMatch('para39', 'para!(*.[0-9])'));
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
    assert(!isMatch('foo', '*(a|b\\[)'));
    assert(isMatch('foo', '*(a|b\\[)|f*'));
  });

  it('this doesn\'t work in bash either (per bash extglob.tests notes)', function() {
    assert(!isMatch('*(a|b[)', '*(a|b\\[)'));
    assert(isMatch('*(a|b[)', '\\*\\(a\\|b\\[\\)'));
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
    match(f2, '!(!(foo))', ['foo']);
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
    assert(extglob.isMatch('/dev/udp/129.22.8.102/45', '/dev/@(tcp|udp)/*/*'));
    match(['0', '12', '1', '12abc', '555'], '[1-6]([0-9])', ['12']);
    match(['0', '12', '1', '12abc', '555'], '[1-6]*([0-9])', ['1', '12', '555']);
    match(['0', '12', '1', '12abc', '555'], '[1-5]*([6-9])', ['1']);
    match(['0', '12', '1', '12abc', '555'], '0|[1-6]*([0-9])', ['0', '1', '12', '555']);
    match(['07', '0377', '09'], '+([0-7])', ['0377', '07']);
  });

  it('stuff from korn\'s book', function() {
    assert(!extglob.isMatch('para', 'para+([0-9])'));
    assert(!extglob.isMatch('para381', 'para?([345]|99)1'));
    assert(!extglob.isMatch('paragraph', 'para*([0-9])'));
    assert(!extglob.isMatch('paragraph', 'para*([0-9])'));
    assert(!extglob.isMatch('paramour', 'para@(chute|graph)'));
    assert(extglob.isMatch('para', 'para*([0-9])'));
    assert(extglob.isMatch('para.38', 'para!(*.[0-9])'));
    assert(extglob.isMatch('para.graph', 'para!(*.[0-9])'));
    assert(extglob.isMatch('para13829383746592', 'para*([0-9])'));
    assert(extglob.isMatch('para39', 'para!(*.[0-9])'));
    assert(extglob.isMatch('para987346523', 'para+([0-9])'));
    assert(extglob.isMatch('para991', 'para?([345]|99)1'));
    assert(extglob.isMatch('paragraph', 'para!(*.[0-9])'));
    assert(extglob.isMatch('paragraph', 'para@(chute|graph)'));
  });

  it('tests derived from those in rosenblatt\'s korn shell book', function() {
    assert(extglob.isMatch('', '*(0|1|3|5|7|9)'));
    assert(extglob.isMatch('137577991', '*(0|1|3|5|7|9)'));
    assert(!extglob.isMatch('2468', '*(0|1|3|5|7|9)'));

    assert(!extglob.isMatch('file.C', '*.c?(c)'));
    assert(!extglob.isMatch('file.ccc', '*.c?(c)'));
    assert(extglob.isMatch('file.c', '*.c?(c)'));
    assert(extglob.isMatch('file.cc', '*.c?(c)'));

    assert(extglob.isMatch('parse.y', '!(*.c|*.h|Makefile.in|config*|README)'));
    assert(extglob.isMatch('Makefile', '!(*.c|*.h|Makefile.in|config*|README)'));
    assert(!extglob.isMatch('shell.c', '!(*.c|*.h|Makefile.in|config*|README)'));

    assert(!extglob.isMatch('VMS.FILE;', '*\\;[1-9]*([0-9])'));
    assert(!extglob.isMatch('VMS.FILE;0', '*\\;[1-9]*([0-9])'));
    assert(!extglob.isMatch('VMS.FILE;1N', '*\\;[1-9]*([0-9])'));
    assert(extglob.isMatch('VMS.FILE;1', '*\\;[1-9]*([0-9])'));
    assert(extglob.isMatch('VMS.FILE;139', '*\\;[1-9]*([0-9])'));
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
    var fixtures = ['a', 'ab', 'ba', 'ax'];
    match(fixtures, 'a!(x)', ['a', 'ab']);
    match(fixtures, 'a*!(x)', ['a', 'ab', 'ax']);
    match(fixtures, 'a*?(x)', ['a', 'ab', 'ax']);
    match(fixtures, 'a?(x)', ['a', 'ax']);
  });

  // ported from http://www.bashcookbook.com/bashinfo/source/bash-4.3/tests/extglob2.tests
  it('should pass extglob2 tests', function() {
    assert(!extglob.isMatch('baaac', '*(@(a))a@(c)'));
    assert(!extglob.isMatch('c', '*(@(a))a@(c)'));
    assert(!extglob.isMatch('egz', '@(b+(c)d|e+(f)g?|?(h)i@(j|k))'));
    assert(!extglob.isMatch('foooofof', '*(f+(o))'));
    assert(!extglob.isMatch('foooofofx', '*(f*(o))'));
    assert(!extglob.isMatch('foooxfooxofoxfooox', '*(f*(o)x)'));
    assert(!extglob.isMatch('ofooofoofofooo', '*(f*(o))'));
    assert(!extglob.isMatch('ofoooxoofxoofoooxoofxofo', '*(*(of*(o)x)o)'));
    assert(!extglob.isMatch('oxfoxfox', '*(oxf+(ox))'));
    assert(!extglob.isMatch('xfoooofof', '*(f*(o))'));
    assert(extglob.isMatch('aaac', '*(@(a))a@(c)'));
    assert(extglob.isMatch('aac', '*(@(a))a@(c)'));
    assert(extglob.isMatch('abbcd', '@(ab|a*(b))*(c)d'));
    assert(extglob.isMatch('abcd', '?@(a|b)*@(c)d'));
    assert(extglob.isMatch('abcd', '@(ab|a*@(b))*(c)d'));
    assert(extglob.isMatch('ac', '*(@(a))a@(c)'));
    assert(extglob.isMatch('acd', '@(ab|a*(b))*(c)d'));
    assert(extglob.isMatch('effgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    assert(extglob.isMatch('efgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    assert(extglob.isMatch('egz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    assert(extglob.isMatch('egzefffgzbcdij', '*(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    assert(extglob.isMatch('fffooofoooooffoofffooofff', '*(*(f)*(o))'));
    assert(extglob.isMatch('ffo', '*(f*(o))'));
    assert(extglob.isMatch('fofo', '*(f*(o))'));
    assert(extglob.isMatch('foofoofo', '@(foo|f|fo)*(f|of+(o))'));
    assert(extglob.isMatch('fooofoofofooo', '*(f*(o))'));
    assert(extglob.isMatch('foooofo', '*(f*(o))'));
    assert(extglob.isMatch('foooofof', '*(f*(o))'));
    assert(extglob.isMatch('foooxfooxfoxfooox', '*(f*(o)x)'));
    assert(extglob.isMatch('foooxfooxfxfooox', '*(f*(o)x)'));
    assert(extglob.isMatch('ofoofo', '*(of+(o))'));
    assert(extglob.isMatch('ofoofo', '*(of+(o)|f)'));
    assert(extglob.isMatch('ofoooxoofxo', '*(*(of*(o)x)o)'));
    assert(extglob.isMatch('ofoooxoofxoofoooxoofxo', '*(*(of*(o)x)o)'));
    assert(extglob.isMatch('ofoooxoofxoofoooxoofxoo', '*(*(of*(o)x)o)'));
    assert(extglob.isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(*(of*(o)x)o)'));
    assert(extglob.isMatch('ofxoofxo', '*(*(of*(o)x)o)'));
    assert(extglob.isMatch('oofooofo', '*(of|oof+(o))'));
    assert(extglob.isMatch('oxfoxoxfox', '*(oxf+(ox))'));
  });

  it('should support backtracking in alternation matches', function() {
    assert(extglob.isMatch('fofoofoofofoo', '*(fo|foo)'));
  });

  it('should support exclusions', function() {
    assert(!extglob.isMatch('f', '!(f)'));
    assert(!extglob.isMatch('f', '*(!(f))'));
    assert(!extglob.isMatch('f', '+(!(f))'));
    assert(!extglob.isMatch('foo', '!(foo)'));
    assert(!extglob.isMatch('foob', '!(foo)b*'));
    assert(!extglob.isMatch('mad.moo.cow', '!(*.*).!(*.*)'));
    assert(!extglob.isMatch('mucca.pazza', 'mu!(*(c))?.pa!(*(z))?'));
    assert(!extglob.isMatch('zoot', '@(!(z*)|*x)'));
    assert(extglob.isMatch('fff', '!(f)'));
    assert(extglob.isMatch('fff', '*(!(f))'));
    assert(extglob.isMatch('fff', '+(!(f))'));
    assert(extglob.isMatch('foo', '!(f)'));
    assert(extglob.isMatch('foo', '!(x)'));
    assert(extglob.isMatch('foo', '!(x)*'));
    assert(extglob.isMatch('foo', '*(!(f))'));
    assert(extglob.isMatch('foo', '+(!(f))'));
    assert(extglob.isMatch('foobar', '!(foo)'));
    assert(extglob.isMatch('foot', '@(!(z*)|*x)'));
    assert(extglob.isMatch('foox', '@(!(z*)|*x)'));
    assert(extglob.isMatch('ooo', '!(f)'));
    assert(extglob.isMatch('ooo', '*(!(f))'));
    assert(extglob.isMatch('ooo', '+(!(f))'));
    assert(extglob.isMatch('zoox', '@(!(z*)|*x)'));
  });

  it('should pass extglob3 tests', function() {
    assert(extglob.isMatch('ab/../', '+(??)/..?(/)'));
    assert(extglob.isMatch('ab/../', '+(??|a*)/..?(/)'));
    assert(extglob.isMatch('ab/../', '+(?b)/..?(/)'));
    assert(extglob.isMatch('ab/../', '+(?b|?b)/..?(/)'));
    assert(extglob.isMatch('ab/../', '+([!/])/../'));
    assert(extglob.isMatch('ab/../', '+([!/])/..?(/)'));
    assert(extglob.isMatch('ab/../', '+([!/])/..@(/)'));
    assert(extglob.isMatch('ab/../', '+([^/])/../'));
    assert(extglob.isMatch('ab/../', '+([^/])/..?(/)'));
    assert(extglob.isMatch('ab/../', '+(a*)/..?(/)'));
    assert(extglob.isMatch('ab/../', '+(ab)/..?(/)'));
    assert(extglob.isMatch('ab/../', '?(ab)/..?(/)'));
    assert(extglob.isMatch('ab/../', '?(ab|??)/..?(/)'));
    assert(extglob.isMatch('ab/../', '?b/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(??)/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(??|a*)/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(?b|?b)/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(a*)/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(a?|?b)/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(ab|+([!/]))/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(ab|+([^/]))/..?(/)'));
    assert(extglob.isMatch('ab/../', '@(ab|?b)/..?(/)'));
    assert(extglob.isMatch('ab/../', '[!/][!/]/../'));
    assert(extglob.isMatch('ab/../', '[^/][^/]/../'));
    assert(extglob.isMatch('x', '@(x)'));
  });
});
