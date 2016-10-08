'use strict';

var extglob = require('..');

console.log(extglob('*.!(*a)'));
//=> '(?!\.)[^/]*?\.(?!(?!\.)[^/]*?a(?:\b|$))[^/]*?'

console.log(extglob('*(*(of*(a)x)z)'));
//=> '((of(a)*x)*z)*'
