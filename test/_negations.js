'use strict';

/**
 * minimatch "tricky negations test"
 */

module.exports = {
  'bar.min.js': {
    '*.!(js|css)': true,
    '!*.+(js|css)': false,
    '*.+(js|css)': true
  },

  'a-integration-test.js': {
    '*.!(j)': true,
    '*.!(js)': false,
    '!(*-integration-test.js)': false,
    '*-!(integration-)test.js': true,
    '*-!(integration)-test.js': false,
    '*!(-integration)-test.js': true,
    '*!(-integration-)test.js': true,
    '*!(integration)-test.js': true,
    '*!(integration-test).js': true,
    '*-!(integration-test).js': true,
    '*-!(integration-test.js)': true,
    '*-!(integra)tion-test.js': false,
    '*-integr!(ation)-test.js': false,
    '*-integr!(ation-t)est.js': false,
    '*-i!(ntegration-)test.js': false,
    '*i!(ntegration-)test.js': true,
    '*te!(gration-te)st.js': true,
    '*-!(integration)?test.js': false,
    '*?!(integration)?test.js': true
  },

  'foo-integration-test.js': {
    '@(foo-integration-test.js)': true,
    '@(*-integration-test.js)': true,
    '@(*-integration-test).js': true,
    'foo-integration-test.js': true,
    '!(*-integration-test.js)': false
  },

  'foo.jszzz.js': {
    '*.!(js).js': true
  },

  'asd.jss': {
    '*.!(js)': true
  },

  'asd.jss.xyz': {
    '*.!(js)*.!(xy)': false,
    '*.!(js)*.!(xy)*': false,
    '*.!(js).!(xy)': false,
  },

  'asd.jss.xy': {
    '*.!(js)*.!(xy)': false,
    '*.!(js)*.!(xy)*': false,
    '*.!(js).!(xy)': false,
    '*.!(js).!(xy)*': false
  },

  'asd.js.xyz': {
    '*.!(js)*.!(xy)': false,
    '*.!(js)*.!(xy)*': false,
    '*.!(js)*.!(xyz)': false,
    '*.!(js)*.!(xyz)*': false,
    '*.!(js).!(xy)': false,
    '*.!(js).!(xy)*': false,
    '*.!(js).!(xyz)': false,
    '*.!(js).!(xyz)*': false
  },

  'asd.js.xy': {
    '*.!(js).!(xy)': false
  },

  'asd.sjs.zxy': {
    '*.!(js).!(xy)': true
  },

  'asd..xyz': {
    '*.!(js).!(xy)': true
  },

  'asd..xy': {
    '*.!(js).!(xy)': false,
    '*.!(js|x).!(xy)': false
  },

  'foo.js.js': {
    '*!(js)': true,
    '*!(.js)': true,
    '*!(.js.js)': true,
    '*!(.js.js)*': true,
    '*(.js.js)': false,
    '**(.js.js)': true,
    '*(!(.js.js))': true,
    '*.!(js)*.!(js)': false,
    '*.!(js)+': false,
    '!(*(.js.js))': true,
    '*.!(js)': true,
    '*.!(js)*': false,     // Bash 4.3 disagrees!
    '*.!(js)*.js': false   // Bash 4.3 disagrees!
  },

  'a/foo.js.js': {
    '*/**(.*)': true,
    '*/**(.*.*)': true,
    'a/**(.*.*)': true,
    '*/**(.js.js)': true,
    'a/f*(!(.js.js))': true,
    'a/!(*(.*))': true,
    'a/!(+(.*))': true,
    'a/!(*(.*.*))': true,
    '*/!(*(.*.*))': true,
    'a/!(*(.js.js))': true
  },

  'testjson.json': {
    '*(*.json|!(*.js))': true,
    '+(*.json|!(*.js))': true,
    '@(*.json|!(*.js))': true,
    '?(*.json|!(*.js))': true
  },

  'foojs.js': {
    '*(*.json|!(*.js))': false, // Bash 4.3 disagrees!
    '*(*.json|!(*.js))*': true,
    '+(*.json|!(*.js))': false, // Bash 4.3 disagrees!
    '@(*.json|!(*.js))': false,
    '?(*.json|!(*.js))': false
  },

  'other.bar': {
    '*(*.json|!(*.js))': true,
    '*(*.json|!(*.js))*': true,
    '!(*(*.json|!(*.js)))*': false,
    '+(*.json|!(*.js))': true,
    '@(*.json|!(*.js))': true,
    '?(*.json|!(*.js))': true
  }
};
