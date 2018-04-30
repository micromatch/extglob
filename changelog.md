## Changelog

### v3.0.0

**Breaking changes**

- Snapdragon was updated to 0.12. Other packages that integrate `extglob` need to also use snapdragon 0.12.
- Minimum Node.JS version is now version 4.


### v2.0.0

**Added features**

- Adds [.capture](readme.md#capture) method for capturing matches, thanks to [devongovett](https://github.com/devongovett)


### v1.0.0

**Breaking changes**

- The main export now returns the compiled string, instead of the object returned from the compiler

**Added features**

- Adds a `.create` method to do what the main function did before v1.0.0

**Other changes**

- adds `expand-brackets` parsers/compilers to handle nested brackets and extglobs
- uses `to-regex` to build regex for `makeRe` method
- improves coverage
- optimizations