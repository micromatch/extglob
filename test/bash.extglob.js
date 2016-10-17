'use strict';

require('mocha');
var match = require('./support/match');
var assert = require('assert');

// ported from http://www.bashcookbook.com/bashinfo/source/bash-4.3/tests/extglob.tests
describe('bash tests derived from the pd-ksh test suite:', function() {
  var startLine = 11;
  var tests = [
    [ '/dev/udp/129.22.8.102/45', '/dev/@(tcp|udp)/*/*', true ],
    '',
    'valid numbers',
    [ '0', '0|[1-9]*([0-9])', true ], // Bash 4.3 disagrees
    [ '12', '0|[1-9]*([0-9])', true ], // Bash 4.3 disagrees
    [ '12abc', '0|[1-9]*([0-9])', false ],
    [ '1', '0|[1-9]*([0-9])', true ], // Bash 4.3 disagrees
    '',
    'octal numbers',
    [ '07', '+([0-7])', true ],
    [ '0377', '+([0-7])', true ],
    [ '09', '+([0-7])', false ],
    '',
    'stuff from korn\'s book',
    [ 'paragraph', 'para@(chute|graph)', true ],
    [ 'paramour', 'para@(chute|graph)', false ],
    [ 'para991', 'para?([345]|99)1', true ],
    [ 'para381', 'para?([345]|99)1', false ],
    [ 'paragraph', 'para*([0-9])', false ],
    [ 'para', 'para*([0-9])', true ],
    [ 'para13829383746592', 'para*([0-9])', true ],
    [ 'paragraph', 'para*([0-9])', false ],
    [ 'para', 'para+([0-9])', false ],
    [ 'para987346523', 'para+([0-9])', true ],
    [ 'paragraph', 'para!(*.[0-9])', true ],
    [ 'para.38', 'para!(*.[0-9])', true ],
    [ 'para.graph', 'para!(*.[0-9])', true ],
    [ 'para39', 'para!(*.[0-9])', true ],
    '',
    'tests derived from those  rosenblatt\'s korn shell book',
    [ '""', '*(0|1|3|5|7|9)', false ], // Bash 4.3 disagrees
    [ '137577991', '*(0|1|3|5|7|9)', true ],
    [ '2468', '*(0|1|3|5|7|9)', false ],
    [ 'file.c', '*.c?(c)', true ],
    [ 'file.C', '*.c?(c)', false ],
    [ 'file.cc', '*.c?(c)', true ],
    [ 'file.ccc', '*.c?(c)', false ],
    [ 'parse.y', '!(*.c|*.h|Makefile.in|config*|README)', true ],
    [ 'shell.c', '!(*.c|*.h|Makefile.in|config*|README)', false ],
    [ 'Makefile', '!(*.c|*.h|Makefile.in|config*|README)', true ],
    [ '"VMS.FILE;1"', '*\\;[1-9]*([0-9])', false ], // Bash 4.3 disagrees
    [ '"VMS.FILE;0"', '*\\;[1-9]*([0-9])', false ],
    [ '"VMS.FILE;"', '*\\;[1-9]*([0-9])', false ],
    [ '"VMS.FILE;139"', '*\\;[1-9]*([0-9])', false ], // Bash 4.3 disagrees
    [ '"VMS.FILE;139"', '*;[1-9]*([0-9])', false ],
    [ '"VMS.FILE;139"', '*;[1-9]*([0-9])*', true ], // Bash 4.3 disagrees
    [ '"VMS.FILE;139"', '*;[1-9]**([0-9])*', true ], // Bash 4.3 disagrees
    [ '"VMS.FILE;1N"', '*;[1-9]*([0-9])', false ],
    '',
    ['abcx', '!([*)*', true], // Bash 4.3 disagrees
    ['abcx', '!(\\[*)*', true],
    ['abcz', '!([*)*', true], // Bash 4.3 disagrees
    ['abcz', '!(\\[*)*', true],
    ['bbc', '!([*)*', true], // Bash 4.3 disagrees
    ['bbc', '!(\\[*)*', true],
    ['abcx', '+(a|b[)*', true], // Bash 4.3 disagrees
    ['abcx', '+(a|b\\[)*', true],
    ['abcz', '+(a|b[)*', true], // Bash 4.3 disagrees
    ['abcz', '+(a|b\\[)*', true],
    ['bbc', '+(a|b[)*', false],
    ['abcx', '[a*(]*z', false],
    ['abcx', '[a*\\(]*z', false],
    ['abcz', '[a*(]*z', true], // Bash 4.3 disagrees
    ['abcz', '[a*\\(]*z', true],
    ['bbc', '[a*(]*z', false],
    ['bbc', '[a*\\(]*z', false],
    '',
    ['abc', '+()c', false],
    ['abc', '+()x', false],
    ['abc', '+(*)c', true],
    ['abc', '+(*)x', false],
    ['abc', 'no-file+(a|b)stuff', false],
    ['abc', 'no-file+(a*(c)|b)stuff', false],
    '',
    ['abc', 'a+(b|c)d', false],
    ['abd', 'a+(b|c)d', true],
    ['acd', 'a+(b|c)d', true],
    '',
    ['abc', 'a!(@(b|B))d', false],
    ['abd', 'a!(@(b|B))d', false],
    ['acd', 'a!(@(b|B))d', true],
    '',
    ['abc', 'a[b*(foo|bar)]d', false],
    ['abd', 'a[b*(foo|bar)]d', true],
    ['acd', 'a[b*(foo|bar)]d', false],
    '',
    'simple kleene star tests',
    ['foo', '*(a|b[)', false],
    ['foo', '*(a|b[)|f*', true], // Bash 4.3 disagrees
    'this doesn\'t work right yet (from bash notes, it does work in extglob)',
    ['*(a|b[)', '*(a|b[)', true],
    '',
    'More tests derived from a bug report concerning extended glob patterns following a *',
    ['ab', 'ab*(e|f)', true],
    ['abcdef', 'ab*(e|f)', false],
    ['abcfef', 'ab*(e|f)', false],
    ['abcfefg', 'ab*(e|f)', false],
    ['abef', 'ab*(e|f)', true],
    '',
    ['ab', 'b?*(e|f)', false],
    ['abcdef', 'b?*(e|f)', false],
    ['abcfef', 'b?*(e|f)', false],
    ['abcfefg', 'b?*(e|f)', false],
    ['abef', 'b?*(e|f)', false],
    '',
    ['ab', 'ab*d+(e|f)', false],
    ['abcdef', 'ab*d+(e|f)', true],
    ['abcfef', 'ab*d+(e|f)', false],
    ['abcfefg', 'ab*d+(e|f)', false],
    ['abef', 'ab*d+(e|f)', false],
    '',
    ['ab', 'ab**(e|f)', true],
    ['abcdef', 'ab**(e|f)', true],
    ['abcfef', 'ab**(e|f)', true],
    ['abcfefg', 'ab**(e|f)', true],
    ['abef', 'ab**(e|f)', true],
    '',
    ['ab', 'ab*+(e|f)', false],
    ['abcdef', 'ab*+(e|f)', true],
    ['abcfef', 'ab*+(e|f)', true],
    ['abcfefg', 'ab*+(e|f)', false],
    ['abef', 'ab*+(e|f)', true],
    '',
    ['ab', 'ab**(e|f)', true],
    ['abcdef', 'ab**(e|f)', true],
    ['abcfef', 'ab**(e|f)', true],
    ['abcfefg', 'ab**(e|f)', true],
    ['abef', 'ab**(e|f)', true],
    '',
    ['ab', 'ab**(e|f)g', false],
    ['abcdef', 'ab**(e|f)g', false],
    ['abcfef', 'ab**(e|f)g', false],
    ['abcfefg', 'ab**(e|f)g', true],
    ['abef', 'ab**(e|f)g', false],
    '',
    ['ab', 'ab*+(e|f)', false],
    ['abcdef', 'ab*+(e|f)', true],
    ['abcfef', 'ab*+(e|f)', true],
    ['abcfefg', 'ab*+(e|f)', false],
    ['abef', 'ab*+(e|f)', true],
    '',
    ['ab', 'ab***ef', false],
    ['abcdef', 'ab***ef', true],
    ['abcfef', 'ab***ef', true],
    ['abcfefg', 'ab***ef', false],
    ['abef', 'ab***ef', true],
    '',
    ['ab', 'ab**', true],
    ['abcdef', 'ab**', true],
    ['abcfef', 'ab**', true],
    ['abcfefg', 'ab**', true],
    ['abef', 'ab**', true],
    '',
    'bug in all versions up to and including bash-2.05b',
    ['123abc', '*?(a)bc', true],
    '',
    'character classes',
    [['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b'], 'a[^[:alnum:]]b', ['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b']],
    [['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b'], 'a[-.,:; _]b', ['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b']],
    [['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b'], 'a@([^[:alnum:]])b', ['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b']],
    [['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b'], 'a@([-.,:; _])b', ['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b']],
    [['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b'], 'a@([.])b', ['a.b']],
    [['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b'], 'a@([^.])b', ['a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b']],
    [['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b'], 'a@([^x])b', ['a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b']],
    [['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b'], 'a+([^[:alnum:]])b', ['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b']],
    [['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b'], 'a@(.|[^[:alnum:]])b', ['a.b', 'a,b', 'a:b', 'a-b', 'a;b', 'a b', 'a_b']],
    '',
    ['a , b', '*([[:space:]]),*([[:space:]])', false],
    ['a , b', 'a*([[:space:]]),*([[:space:]])b', true]
  ];

  tests.forEach(function(test, i) {
    if (!Array.isArray(test) || !test) return;
    var fixture = test[0];
    var pattern = test[1];
    // if (pattern !== 'a[-.,:\;\ _]b') return;
    var expected = test[2];
    var msg = ') should ' + (expected ? '' : 'not ') + 'match ' + pattern;

    it((startLine + i) + msg, function() {
      if (Array.isArray(fixture)) {
        match(fixture, pattern, expected, msg);
      } else {
        assert.equal(match.isMatch(fixture, pattern), expected, msg);
      }
    });
  });
});
