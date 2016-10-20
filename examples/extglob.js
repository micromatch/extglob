'use strict';

var extglob = require('..');

console.log(extglob('!(xyz)*.js'));
//=>'(?:(?!(?:xyz)).*?)(?!\.).*?\.js'

console.log(extglob('*.!(*a)'));
//=> '(?!\.).*?\.(?:(?!(?:(?!\.).*?a$)).*?)'

console.log(extglob('+(*(of*(a)x)z)'));
//=> '+((of(a)*x)*z)*'
