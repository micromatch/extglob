'use strict';

var Extglob = require('./');
var extglob = new Extglob();

var pattern = '**/{a,b,/{c,d}}/*.js';
// var pattern = '**/foo/*.js';

// var res = extglob(pattern);
var res = extglob.parse(pattern);
// console.log(res);
