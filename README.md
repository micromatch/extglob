# extglob [![NPM version](https://img.shields.io/npm/v/extglob.svg?style=flat)](https://www.npmjs.com/package/extglob) [![NPM downloads](https://img.shields.io/npm/dm/extglob.svg?style=flat)](https://npmjs.org/package/extglob) [![Build Status](https://img.shields.io/travis/jonschlinkert/extglob.svg?style=flat)](https://travis-ci.org/jonschlinkert/extglob)

> Convert extended globs to regex-compatible strings. Add (almost) the expressive power of regular expressions to glob patterns.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install extglob --save
```

Used by [micromatch](https://github.com/jonschlinkert/micromatch).

**Features**

* Convert an extglob string to a regex-compatible string. **Only converts extglobs**, to handle full globs use [micromatch](https://github.com/jonschlinkert/micromatch).
* Pass `{regex: true}` to return a regex
* Handles nested patterns
* More complete (and correct) support than [minimatch](https://github.com/isaacs/minimatch)

## Usage

```js
var extglob = require('extglob');
```

The main export returns a string:

```js
extglob('?(z)');
//=> '(?:z)?'
extglob('*(z)');
//=> '(?:z)*'
extglob('+(z)');
//=> '(?:z)+'
extglob('@(z)');
//=> '(?:z)'
extglob('!(z)');
//=> "(?!^(?:(?!z)[^/]*?)).*$"
```

## API

### [extglob](index.js#L23)

Convert the given `extglob` pattern into a regex-compatible string.

**Params**

* `str` **{String}**
* `options` **{Object}**
* `returns` **{String}**

**Example**

```js
var extglob = require('extglob');
var str = extglob('*.!(*a)');
console.log(str);
//=> "[^/]*?\.(?![^/]*?a)[^/]*?"
```

### [.parse](index.js#L46)

Parse an extglob pattern into an AST that can be passed to the [.render](#render) method.

**Params**

* `str` **{String}**: Extglob pattern
* `options` **{Object}**
* `returns` **{Object}**: AST

**Example**

```js
var extglob = require('extglob');
var ast = extglob.parse('!(foo|bar)');
```

### [.render](index.js#L287)

Render a string from an extglob AST.

**Params**

* `ast` **{Object}**: Extglob pattern
* `options` **{Object}**
* `returns` **{String}**: Returns a regex-compatible string.

**Example**

```js
var extglob = require('extglob');
var ast = extglob.parse('!(foo|bar)');
var str = extglob.render(ast);
```

### [.makeRe](index.js#L389)

Create a regular expression from the given extglob `pattern`.

**Params**

* `pattern` **{String}**: The extglob pattern to convert
* `options` **{Object}**
* `returns` **{RegExp}**

**Example**

```js
var extglob = require('extglob');
var re = extglob.makeRe('*.!(*a)');
console.log(re);
//=> /^[^\/]*?\.(?![^\/]*?a)[^\/]*?$/
```

### [.isMatch](index.js#L428)

Returns true if the specified `string` matches the given extglob `pattern`.

**Params**

* `string` **{String}**: String to match
* `pattern` **{String}**: Extglob pattern
* `options` **{String}**
* `returns` **{Boolean}**

**Example**

```js
var extglob = require('extglob');

console.log(extglob.isMatch('a.a', '*.!(*a)'));
//=> false
console.log(extglob.isMatch('a.b', '*.!(*a)'));
//=> true
```

### [.matcher](index.js#L451)

Takes an extglob pattern and returns a matcher function. The returned function takes the string to match as its only argument.

**Params**

* `pattern` **{String}**: Extglob pattern
* `options` **{String}**
* `returns` **{Boolean}**

**Example**

```js
var extglob = require('extglob');
var isMatch = extglob.matcher('*.!(*a)');

console.log(isMatch('a.a'));
//=> false
console.log(isMatch('a.b'));
//=> true
```

### [.match](index.js#L474)

Takes an array of strings and an extglob pattern and returns a new array that contains only the strings that match the pattern.

**Params**

* `arr` **{Array}**: Array of strings to match
* `pattern` **{String}**: Extglob pattern
* `options` **{Object}**
* `returns` **{Array}**

**Example**

```js
var extglob = require('extglob');
console.log(extglob.match(['a.a', 'a.b', 'a.c'], '*.!(*a)'));
//=> ['a.b', 'a.c']
```

## Extglob patterns

To learn more about how extglobs work, see the docs for [Bash pattern matching](https://www.gnu.org/software/bash/manual/html_node/Pattern-Matching.html):

* `?(pattern)`: Match zero or one occurrence of the given pattern.
* `*(pattern)`: Match zero or more occurrences of the given pattern.
* `+(pattern)`: Match one or more occurrences of the given pattern.
* `@(pattern)`: Match one of the given pattern.
* `!(pattern)`: Match anything except one of the given pattern.

## Related projects

You might also be interested in these projects:

* [braces](https://www.npmjs.com/package/braces): Fastest brace expansion for node.js, with the most complete support for the Bash 4.3 braces… [more](https://www.npmjs.com/package/braces) | [homepage](https://github.com/jonschlinkert/braces)
* [expand-brackets](https://www.npmjs.com/package/expand-brackets): Expand POSIX bracket expressions (character classes) in glob patterns. | [homepage](https://github.com/jonschlinkert/expand-brackets)
* [expand-range](https://www.npmjs.com/package/expand-range): Fast, bash-like range expansion. Expand a range of numbers or letters, uppercase or lowercase. See… [more](https://www.npmjs.com/package/expand-range) | [homepage](https://github.com/jonschlinkert/expand-range)
* [fill-range](https://www.npmjs.com/package/fill-range): Fill in a range of numbers or letters, optionally passing an increment or multiplier to… [more](https://www.npmjs.com/package/fill-range) | [homepage](https://github.com/jonschlinkert/fill-range)
* [micromatch](https://www.npmjs.com/package/micromatch): Glob matching for javascript/node.js. A drop-in replacement and faster alternative to minimatch and multimatch. Just… [more](https://www.npmjs.com/package/micromatch) | [homepage](https://github.com/jonschlinkert/micromatch)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/extglob/issues/new).

## Building docs

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install verb && npm run docs
```

Or, if [verb](https://github.com/verbose/verb) is installed globally:

```sh
$ verb
```

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/jonschlinkert/extglob/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on April 20, 2016._