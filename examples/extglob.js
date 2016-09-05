'use strict';

var extglob = require('..');
var pattern = '*(*(of*(a)x)z)';

var res = extglob(pattern);
console.log(res.ast.nodes);
console.log(res);
