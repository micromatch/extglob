'use strict';

var extglob = require('..');
var pattern = '*(*(of*(a)x)z)';

console.log(extglob.create(pattern));
console.log(extglob.create(pattern, {sourcemap: true}));
