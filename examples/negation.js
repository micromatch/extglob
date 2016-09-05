'use strict';

var extglob = require('..');
var pattern = 'a!(@(b|B))d';

var res = extglob(pattern);
// console.log(res.ast.nodes);
console.log(res);

console.log(/^a(?:(?!(?:b|B)\\b).*)d/.test('acd'))
console.log(/^a(?:(?!(?:b|B)\\b).*)d/.test('abd'))
