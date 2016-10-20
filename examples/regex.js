
var extglob = require('..');

var re = extglob.makeRe('*(a|b|c)');
console.log(re);
console.log(re.test('bar'));
console.log(re.test('bbbaaaccc'));
