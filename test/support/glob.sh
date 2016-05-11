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

t a             \\**
t b             \\**
t c             \\**
t d             \\**
t abc           \\**
t abd           \\**
t abe           \\**
t bb            \\**
t bcd           \\**
t ca            \\**
t cb            \\**
t dd            \\**
t de            \\**
t bdir/         \\**
t bdir/cfile    \\**

EOT
echo ""
echo "$failed tests failed."
