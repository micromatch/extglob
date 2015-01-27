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
var extglob = require('./match');

if ('minimatch' in argv) {
  extglob = require('minimatch').makeRe;
}

describe('extglob1a', function () {
  it.only('should match character classes:', function () {
    console.log(extglob('a*!(x)'))
    console.log(extglob('a*!\\(abc)'))
    console.log(extglob('a*?\\?(xyz)'))
    console.log(extglob('a*@(xyz)'))
    console.log(extglob('a*!(xyz)'))
    console.log(extglob('a*+(xyz)'))
    console.log(extglob('a**(xyz)'))
    console.log(extglob('a*?(xyz)'))
    // extglob('a*!(x)/b/?(y)/c').should.eql('a*(?!x)/b/?(y)/c');
    // extglob(['a', 'ab'], 'a*!(x)').should.eql(['a', 'ab']);
    // extglob(['ba'], 'a*!(x)').should.eql([]);

    // extglob(['a', 'ab'], 'a!(x)').should.eql(['a', 'ab']);
    // extglob(['ba'], 'a!(x)').should.eql([]);

    // extglob(['a', 'ab'], 'a*?(x)').should.eql(['a', 'ab']);
    // extglob(['ba'], 'a*?(x)').should.eql([]);

    // extglob(['a'], 'a?(x)').should.eql(['a']);
    // extglob(['ab', 'ba'], 'a?(x)').should.eql([]);
  });
});
