'use strict';

var path = require('path');
var util = require('util');
var cyan = require('ansi-cyan');
var argv = require('minimist')(process.argv.slice(2));
var isPrimitive = require('is-primitive');
var isObject = require('is-object');
var Suite = require('benchmarked');

function run(type) {
  var suite = new Suite({
    cwd: __dirname,
    fixtures: path.join('fixtures', type,'*.js'),
    code: path.join('code', type + '.*.js')
  });

  if (argv.dry) {
    suite.dryRun(function(code, fixture) {
      console.log(cyan('%s > %s'), code.key, fixture.key);
      var args = require(fixture.path);
      var res = code.run(args);
      if (Array.isArray(res)) {
        console.log(res.length);
      } else if (isPrimitive(res)) {
        console.log(res);
      } else if (isObject(res)) {
        console.log(util.inspect(res, null, 10));
      }
      console.log();
    });
  } else {
    suite.run();
  }
}

run(argv._[0] || 'isMatch');
