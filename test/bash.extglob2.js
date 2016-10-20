'use strict';

require('mocha');
var assert = require('assert');
var match = require('./support/match');

// tests ported from http://www.bashcookbook.com/bashinfo/source/bash-4.3/tests/extglob2.tests
describe('bash extglob2 tests', function() {
  var startLine = 11;
  var tests = [
    [ 'fofo', '*(f*(o))', true ],
    [ 'ffo', '*(f*(o))', true ],
    [ 'foooofo', '*(f*(o))', true ],
    [ 'foooofof', '*(f*(o))', true ],
    [ 'fooofoofofooo', '*(f*(o))', true ],
    [ 'foooofof', '*(f+(o))', false ],
    [ 'xfoooofof', '*(f*(o))', false ],
    [ 'foooofofx', '*(f*(o))', false ],
    [ 'ofxoofxo', '*(*(of*(o)x)o)', true ],
    [ 'ofooofoofofooo', '*(f*(o))', false ],
    [ 'foooxfooxfoxfooox', '*(f*(o)x)', true ],
    [ 'foooxfooxofoxfooox', '*(f*(o)x)', false ],
    [ 'foooxfooxfxfooox', '*(f*(o)x)', true ],
    [ 'ofxoofxo', '*(*(of*(o)x)o)', true ],
    [ 'ofoooxoofxo', '*(*(of*(o)x)o)', true ],
    [ 'ofoooxoofxoofoooxoofxo', '*(*(of*(o)x)o)', true ],
    [ 'ofoooxoofxoofoooxoofxoo', '*(*(of*(o)x)o)', true ],
    [ 'ofoooxoofxoofoooxoofxofo', '*(*(of*(o)x)o)', false ],
    [ 'ofoooxoofxoofoooxoofxooofxofxo', '*(*(of*(o)x)o)', true ],
    [ 'aac', '*(@(a))a@(c)', true ],
    [ 'ac', '*(@(a))a@(c)', true ],
    [ 'c', '*(@(a))a@(c)', false ],
    [ 'aaac', '*(@(a))a@(c)', true ],
    [ 'baaac', '*(@(a))a@(c)', false ],
    [ 'abcd', '?@(a|b)*@(c)d', true ],
    [ 'abcd', '@(ab|a*@(b))*(c)d', true ],
    [ 'acd', '@(ab|a*(b))*(c)d', true ],
    [ 'abbcd', '@(ab|a*(b))*(c)d', true ],
    [ 'effgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', true ],
    [ 'efgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', true ],
    [ 'egz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', true ],
    [ 'egzefffgzbcdij', '*(b+(c)d|e*(f)g?|?(h)i@(j|k))', true ],
    [ 'egz', '@(b+(c)d|e+(f)g?|?(h)i@(j|k))', false ],
    [ 'ofoofo', '*(of+(o))', true ],
    [ 'oxfoxoxfox', '*(oxf+(ox))', true ],
    [ 'oxfoxfox', '*(oxf+(ox))', false ],
    [ 'ofoofo', '*(of+(o)|f)', true ],
    'the following is supposed to match only as fo+ofo+ofo',
    [ 'foofoofo', '@(foo|f|fo)*(f|of+(o))', true ],
    [ 'oofooofo', '*(of|oof+(o))', true ],
    [ 'fffooofoooooffoofffooofff', '*(*(f)*(o))', true ],
    'the following tests backtracking in alternation matches',
    [ 'fofoofoofofoo', '*(fo|foo)', true ],
    'exclusion',
    [ 'foo', '!(x)', true ],
    [ 'foo', '!(x)*', true ],
    [ 'foo', '!(foo)', false ],
    [ 'foo', '!(foo)*', false ], // Bash 4.3 disagrees!
    [ 'foobar', '!(foo)', true ],
    [ 'foobar', '!(foo)*', false ], // Bash 4.3 disagrees!
    [ 'moo.cow', '!(*.*).!(*.*)', false ],  // Bash 4.3 disagrees!
    [ 'mad.moo.cow', '!(*.*).!(*.*)', false ],
    [ 'mucca.pazza', 'mu!(*(c))?.pa!(*(z))?', false ],
    [ 'fff', '!(f)', true ],
    [ 'fff', '*(!(f))', true ],
    [ 'fff', '+(!(f))', true ],
    [ 'ooo', '!(f)', true ],
    [ 'ooo', '*(!(f))', true ],
    [ 'ooo', '+(!(f))', true ],
    [ 'foo', '!(f)', true ],
    [ 'foo', '*(!(f))', true ],
    [ 'foo', '+(!(f))', true ],
    [ 'f', '!(f)', false ],
    [ 'f', '*(!(f))', false ],
    [ 'f', '+(!(f))', false ],
    [ 'foot', '@(!(z*)|*x)', true ],
    [ 'zoot', '@(!(z*)|*x)', false ],
    [ 'foox', '@(!(z*)|*x)', true ],
    [ 'zoox', '@(!(z*)|*x)', true ],
    [ 'foo', '*(!(foo))', false ], // Bash 4.3 disagrees!
    [ 'foob', '!(foo)b*', false ],
    [ 'foobb', '!(foo)b*', false ] // Bash 4.3 disagrees!
  ];

  tests.forEach(function(test, n) {
    if (!Array.isArray(test)) return;
    var fixture = test[0];
    var pattern = test[1];
    var expected = test[2];
    var msg = 'should ' + (expected ? '' : 'not ') + 'match ' + pattern;

    it((startLine + n) + ' ' + msg, function() {
      assert.equal(match.isMatch(fixture, pattern), expected, msg);
    });
  });
});
