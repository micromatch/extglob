/*!
 * extglob <https://github.com/jonschlinkert/extglob>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var should = require('should');
var argv = require('minimist')(process.argv.slice(2));
var extglob = require('./helpers');

if ('minimatch' in argv) {
  extglob = require('minimatch').makeRe;
}

describe('extglob1a', function () {
  it.only('should match character classes:', function () {
    var mm = '(?!\\.)(?=.)(?:jp(?:e)?g|md|hbs)'
    // extglob('@(jp?(e)g|md|hbs)').should.equal('(?!\\.)(?=.)(?:jp(?:e)?g|md|hbs)');

    // // var mm = '(?=.)a[^/]*?(?:(?!abc)[^/]*?)';
    // extglob('!(abc)').should.equal('(?!\\.)(?=.)(?:(?!abc)[^/]*?)');
    // extglob('@(abc)').should.equal('(?!\\.)(?=.)(?:abc)');
    // extglob('?(abc)').should.equal('(?!\\.)(?=.)(?:abc)?');
    // extglob('+(abc)').should.equal('(?!\\.)(?=.)(?:abc)+');
    // extglob('*(abc)').should.equal('(?!\\.)(?=.)(?:abc)*');
    // extglob('a@(abc)').should.equal('(?=.)a(?:abc)');
    // extglob('a*@(abc)').should.equal('(?=.)a*(?:abc)');
    // extglob('a*!(xyz)').should.equal('');
    // extglob('a*+(xyz)').should.equal('');
    // extglob('a**(xyz)').should.equal('');
    // extglob('a*?(xyz)').should.equal('');
    // var foo = extglob('?([ig])cc|[cg]++|icpc)?(-+([0-9])+(\.+([0-9])))')
    // foo.should.equal('(?!\\.)(?=.)(?:[ig])?cc\\|[cg]\\+\\|\\+icpc\\)(?:-(?:[0-9])+(?:\\.(?:[0-9])+)+)');
    extglob('a*!\\(abc)').should.equal('(?=.)a[^/]*?\\!\\(abc\\)');
    extglob('a*?\\?(xyz)').should.equal('(?=.)a[^/]*?[^/]\\?\\(xyz\\)');
    // extglob('a/!(x)/b/?(y)/c').should.equal('a/(?!\\.)(?=.)(?:(?!x)[^/]*?)/b/(?!\\.)(?=.)(?:x)?/c');
    // extglob('a/@(x)/b/?(y)/c').should.equal('a/(?!\\.)(?=.)(?:x)/b/(?!\\.)(?=.)(?:x)?/c');
    // extglob('a/?(x)/b/?(y)/c').should.equal('a/(?!\\.)(?=.)(?:x)?/b/(?!\\.)(?=.)(?:x)?/c');
    // extglob('a/*(x)/b/?(y)/c').should.equal('a/(?!\\.)(?=.)(?:x)*/b/(?!\\.)(?=.)(?:x)?/c');
    // extglob('a/+(x)/b/?(y)/c').should.equal('a/(?!\\.)(?=.)(?:x)+/b/(?!\\.)(?=.)(?:x)?/c');
    // extglob('a/x/b/?(y)/c').should.equal('a/x/b/(?!\\.)(?=.)(?:x)?/c');
  });
});

// var a = process('a/b/c/!(d|e)/?(f|g)/h', 'extglob');
// var b = process('a/b/{c,d,{1..5}}/!(d|e)/?(f|g)/h', 'braces');
// console.log(a)

// var str = 'a/**/b/{c,d,{1..10}}/!(d|e)/?(f|g)/{h,i}/*.js';
// str = process(str);
// // console.log(process(str, 'braces'));

// var re = /a\/b\/(c|d|(1|2|3|4|5|6|7|8|9|10))\/f/;
// console.log(re.test('a/b/10/f'))
