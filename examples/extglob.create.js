'use strict';

var extglob = require('..');

console.log(extglob.create('*.!(*a)'));
console.log(extglob.create('*(*(of*(a)x)z)'));

