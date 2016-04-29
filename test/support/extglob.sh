#
# More ksh-like extended globbing tests, cribbed from zsh-3.1.5
#
shopt -s extglob

failed=0
while read res str pat; do
  [[ $res = '#' ]] && continue
  [[ $str = ${pat} ]]
  ts=$?
  [[ $1 = -q ]] || echo "$ts:  [[ $str = $pat ]]"
  if [[ ( $ts -gt 0 && $res = t) || ($ts -eq 0 && $res = f) ]]; then
    echo "Test failed:  [[ $str = $pat ]]"
    (( failed += 1 ))
  fi
done <<EOT
t fofo                *(f*(o))
t ffo                 *(f*(o))
t foooofo             *(f*(o))
t foooofof            *(f*(o))
t fooofoofofooo       *(f*(o))
f foooofof            *(f+(o))
f xfoooofof           *(f*(o))
f foooofofx           *(f*(o))
t ofxoofxo            *(*(of*(o)x)o)
f ofooofoofofooo      *(f*(o))
t foooxfooxfoxfooox   *(f*(o)x)
f foooxfooxofoxfooox  *(f*(o)x)
t foooxfooxfxfooox    *(f*(o)x)
t ofxoofxo            *(*(of*(o)x)o)
t ofoooxoofxo         *(*(of*(o)x)o)
t ofoooxoofxoofoooxoofxo            *(*(of*(o)x)o)
t ofoooxoofxoofoooxoofxoo           *(*(of*(o)x)o)
f ofoooxoofxoofoooxoofxofo          *(*(of*(o)x)o)
t ofoooxoofxoofoooxoofxooofxofxo    *(*(of*(o)x)o)

t aac    *(@(a))a@(c)
t ac     *(@(a))a@(c)
f c      *(@(a))a@(c)
t aaac   *(@(a))a@(c)
f baaac  *(@(a))a@(c)
t abcd   ?@(a|b)*@(c)d
t abcd   @(ab|a*@(b))*(c)d
t acd    @(ab|a*(b))*(c)d
t abbcd  @(ab|a*(b))*(c)d
t effgz  @(b+(c)d|e*(f)g?|?(h)i@(j|k))
t efgz   @(b+(c)d|e*(f)g?|?(h)i@(j|k))
t egz    @(b+(c)d|e*(f)g?|?(h)i@(j|k))
t egzefffgzbcdij    *(b+(c)d|e*(f)g?|?(h)i@(j|k))
f egz    @(b+(c)d|e+(f)g?|?(h)i@(j|k))
t ofoofo *(of+(o))
t oxfoxoxfox    *(oxf+(ox))
f oxfoxfox      *(oxf+(ox))
t ofoofo        *(of+(o)|f)
# The following is supposed to match only as fo+ofo+ofo
t foofoofo      @(foo|f|fo)*(f|of+(o))
t oofooofo      *(of|oof+(o))
t fffooofoooooffoofffooofff      *(*(f)*(o))
# The following tests backtracking in alternation matches
t fofoofoofofoo *(fo|foo)
# Exclusion
t foo           !(x)
t foo           !(x)*
f foo           !(foo)
t foobar        !(foo)
t foo           !(foo)*
t bar           !(foo)*
t baz           !(foo)*
t foobar        !(foo)*
t moo.cow       !(*.*).!(*.*)
f mad.moo.cow   !(*.*).!(*.*)
f moo           .!(*.*)
f cow           .!(*.*)
f moo.cow       .!(*.*)
f mad.moo.cow   .!(*.*)
f mucca.pazza   mu!(*(c))?.pa!(*(z))?

t fff           !(f)
t ooo           !(f)
t foo           !(f)
f f             !(f)

t fff           *(!(f))
t ooo           *(!(f))
t foo           *(!(f))
f f             *(!(f))

t fff           +(!(f))
t ooo           +(!(f))
t foo           +(!(f))
f f             +(!(f))

t foot          @(!(z*)|*x)
f zoot          @(!(z*)|*x)
t foox          @(!(z*)|*x)
t zoox          @(!(z*)|*x)
t foo           *(!(foo))
f foob          !(foo)b*
t foobb         !(foo)b*

f a.b             !(*.*)
t abb             !(*.*)
t ab              !(*.*)

f a.a           !(*.a|*.b|*.c)
t a.abcd        !(*.a|*.b|*.c)
t a.c.d         !(*.a|*.b|*.c)
t a.            !(*.a|*.b|*.c)
t d.d           !(*.a|*.b|*.c)
t e.e           !(*.a|*.b|*.c)
t f.f           !(*.a|*.b|*.c)
f f.a           !(*.a|*.b|*.c)

t a.abcd        *!(.a|.b|.c)
t a.c.d         *!(.a|.b|.c)
t a.            *!(.a|.b|.c)
t d.d           *!(.a|.b|.c)
t e.e           *!(.a|.b|.c)
t f.f           *!(.a|.b|.c)
t f.a           *!(.a|.b|.c)

t a.abcd        *.!(a|b|c)
t a.c.d         *.!(a|b|c)
t a.            *.!(a|b|c)
t d.d           *.!(a|b|c)
t e.e           *.!(a|b|c)
t f.f           *.!(a|b|c)
f f.a           *.!(a|b|c)

f abd        a!(@(b|B))d
t acd        a!(@(b|B))d

f ab         a!(@(b|B))
f aB         a!(@(b|B))
t aBc        a!(@(b|B))
t acd        a!(@(b|B))
t ac         a!(@(b|B))
t ab]        a!(@(b|B))

f a          (a)
t a          *(a)
t a          +(a)
f a          !(a)
t aa         !(a)
f aa         @(a)b
f aab        @(c)b

f ab         a(*b
t a(b        a(*b
t a((b       a(*b
t a((((b     a(*b

t a          ?
f aa         ?
f aab        ?

f a          (b)
t a          ?(a|b)
t a          a?(a|b)
f a          b?(a|b)
t ba         b?(a|b)
f bb         a?(a|b)
f aa         ?
f aab        ?

f a          ??
t aa         ??
f aab        ??

f a          a??b
f aa         a??b
f aab        a??b
t aaab       a??b

t a          a?(x)

t foo.js.js  *.!(js)
t foo.js.js  *.!(js)*
f foo.js.js  *.!(js)+
f foo.js.js  *.!(js)*.!(js)

f a.js         *.!(js)
t a.js.js      *.!(js)
f c.js         *.!(js)
t a.md         *.!(js)
t d.js.d       *.!(js)

f a.js         !(*.js)
f a.js.js      !(*.js)
f c.js         !(*.js)
t a.md         !(*.js)
t d.js.d       !(*.js)

t a.js         *!(.js)
t a.js.js      *!(.js)
t c.js         *!(.js)
t a.md         *!(.js)
t d.js.d       *!(.js)

t a.a            *!(.a|.b|.c)
t a.b            *!(.a|.b|.c)
t a.c            *!(.a|.b|.c)
t a.c.d          *!(.a|.b|.c)
t c.c            *!(.a|.b|.c)
t a.             *!(.a|.b|.c)
t d.d            *!(.a|.b|.c)
t e.e            *!(.a|.b|.c)
t f.f            *!(.a|.b|.c)
t a.abcd         *!(.a|.b|.c)

t *(a|b[)        *(a|b\\[)

t parse.y        !(*.c|*.h|Makefile.in|config*|README)
f shell.c        !(*.c|*.h|Makefile.in|config*|README)
t Makefile       !(*.c|*.h|Makefile.in|config*|README)
f Makefile.in    !(*.c|*.h|Makefile.in|config*|README)

f a.a            *.!(a)
t a.b            *.!(a)
t a.a.a          *.!(a)
f c.a            *.!(a)
t a.             *.!(a)
t d.a.d          *.!(a)

f ax             a?(b*)
t ax             ?(a*|b)

EOT
echo ""
echo "$failed tests failed."
