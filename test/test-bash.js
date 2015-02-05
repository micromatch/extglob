  it.skip('Character class tests', function() {
    extglob.match('A', '[[:lower:]]').should.be.false;
    extglob.match('a', '[[:lower:]]').should.be.true;
    extglob.match('a', '[[:upper:]]').should.be.false;
    extglob.match('A', '[[:upper:]]').should.be.true;
    extglob.match(['a1B', 'a1b'], '[[:alpha:]][[:digit:]][[:upper:]]').should.eql(['a1B']);
    extglob.match('a', '[[:digit:][:upper:][:space:]]').should.be.false;
    extglob.match('A', '[[:digit:][:upper:][:space:]]').should.be.true;
    extglob.match('1', '[[:digit:][:upper:][:space:]]').should.be.true;
    extglob.match('1', '[[:digit:][:upper:][:spaci:]]').should.be.false;
    extglob.match(' ', '[[:digit:][:upper:][:space:]]').should.be.true;
    extglob.match('.', '[[:digit:][:upper:][:space:]]').should.be.false;
    extglob.match(['.','a','!'], '[[:digit:][:punct:][:space:]]').should.eql(['.','!'])
    extglob.match('5', '[[:xdigit:]]').should.be.true;
    extglob.match('f', '[[:xdigit:]]').should.be.true;
    extglob.match('D', '[[:xdigit:]]').should.be.true;
    extglob.match('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]').should.be.true;
    extglob.match('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]').should.be.true;
    extglob.match('.', '[^[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]').should.be.true;
    extglob.match('.', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]').should.be.false;
    extglob.match('5', '[a-c[:digit:]x-z]').should.be.true;
    extglob.match('b', '[a-c[:digit:]x-z]').should.be.true;
    extglob.match('y', '[a-c[:digit:]x-z]').should.be.true;
    extglob.match('q', '[a-c[:digit:]x-z]').should.be.false;
  });

// From the test suite for the POSIX.2 (BRE) pattern matching code

// First, test POSIX.2 character classes

extglob.match('e', '[[:xdigit:]]').should.be.true;
extglob.match('a', '[[:alpha:]123]').should.be.true;
extglob.match('1', '[[:alpha:]123]').should.be.true;
extglob.match('9', '[![:alpha:]]').should.be.true;

// _invalid character class expressions are just characters to be matched
extglob.match('a', '[:al:]').should.be.true;
extglob.match('a', '[[:al:]').should.be.true;
extglob.match('!', '[abc[:punct:][0-9]').should.be.true;

// let's try to match the start of a valid sh identifier
extglob.match('PATH', '[_[:alpha:]]*').should.be.true;

// let's try to match the first two characters of a valid sh identifier
extglob.match('PATH', '[_[:alpha:]][_[:alnum:]]*').should.be.true;

// is ^C a cntrl character?
extglob.match('$\\003', '[[:cntrl:]]').should.be.true;

// how about A?
extglob.match('A', '[[:cntrl:]]').should.be.true;
extglob.match('9', '[[:digit:]]').should.be.true;
extglob.match('X', '[[:digit:]]').should.be.false;
extglob.match('$\\033', '[[:graph:]]').should.be.false;
extglob.match('$\\040', '[[:graph:]]').should.be.false;

extglob.match('" "', '[[:graph:]]').should.be.false;
extglob.match('"aB"', '[[:lower:]][[:upper:]]').should.be.true;
extglob.match('$\\040', '[[:print:]]').should.be.false;
extglob.match('PS3', '[_[:alpha:]][_[:alnum:]][_[:alnum:]]*').should.be.true;
extglob.match('a', '[[:alpha:][:digit:]]').should.be.true;
extglob.match('a', '[[:alpha:]\]').should.be.false;

// what's a newline?  is it a blank? a space?
extglob.match('$"\\n"', '[[:blank:]]').should.be.false;
extglob.match('$"\\n"', '[[:space:]]').should.be.true;

// OK, what's a tab?  is it a blank? a space?
extglob.match('$"\\t"', '[[:blank:]]').should.be.true;
extglob.match('$"\\t"', '[[:space:]]').should.be.false;


// let's check out characters in the ASCII range
extglob.match('$"\377"', '[[:ascii:]]').should.be.false;
extglob.match('9', '[1[:alpha:]123]').should.be.false;

// however, an unterminated brace expression containing a valid char class
// that matches had better fail
extglob.match('a', '[[:alpha:]').should.be.false;
extglob.match('$"\b"', '[[:graph:]]').should.be.false;
extglob.match('$"\b"', '[[:print:]]').should.be.false;

extglob.match('$" "', '[[:punct:]]').should.be.false;

// Next, test POSIX.2 collating symbols
extglob.match('"a"', '[[.a.]]').should.be.true;
extglob.match('"-"', '[[.hyphen.]-9]').should.be.true;
extglob.match('"p"', '[[.a.]-[.z.]]').should.be.true;
extglob.match('"-"', '[[.-.]]').should.be.true;
extglob.match('" "', '[[.space.]]').should.be.true;
extglob.match('" "', '[[.grave-accent.]]').should.be.true;

extglob.match('"4"', '[[.-.]-9]').should.be.true;

// an invalid collating symbol cannot be the first part of a range
extglob.match('"c"', '[[.yyz.]-[.z.]]').should.be.false;

extglob.match('"c"', '[[.yyz.][.a.]-z]').should.be.true;

// but when not part of a range is not an error
extglob.match('"c"', '[[.yyz.][.a.]-[.z.]]').should.be.ok;

extglob.match('"p"', '[[.a.]-[.Z.]]').should.be.false;

extglob.match('p', '[[.a.]-[.zz.]p]').should.not.be.ok;
extglob.match('p', '[[.aa.]-[.z.]p]').should.not.be.ok;

extglob.match('c', '[[.yyz.]cde]').should.be.ok;
extglob.match('abc', '[[.cb.]a-Za]*').should.be.ok;

extglob.match('$"\t"', '[[.space.][.tab.][.newline.]]').should.be.ok;

// and finally, test POSIX.2 equivalence classes

extglob.match('"abc"', '[[:alpha:]][[=b=]][[:ascii:]]').should.be.ok;

extglob.match('"abc"', '[[:alpha:]][[=B=]][[:ascii:]]').should.not.be.ok;

// an incomplete equiv class is just a string
extglob.match('a', '[[=b=]').should.not.be.ok;
