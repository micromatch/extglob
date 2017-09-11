'use strict';

const path = require('path');
const suite = require('benchmarked');
const write = require('write');

suite.run({code: 'code/*.js', fixtures: 'fixtures/*.js'})
  .then(function(stats) {
    return write(path.join(__dirname, 'stats.md'), suite.render(stats));
  })
  .catch(console.error);
