Benchmarking: (4 of 4)
 · negation-simple
 · range-false
 · range-true
 · star-simple

# benchmark/fixtures/isMatch/negation-simple.js (43 bytes)
  extglob x 2,451,294 ops/sec ±1.15% (82 runs sampled)
  minimatch x 110,758 ops/sec ±1.90% (79 runs sampled)

  fastest is extglob

# benchmark/fixtures/isMatch/range-false.js (56 bytes)
  extglob x 2,334,005 ops/sec ±1.44% (83 runs sampled)
  minimatch x 119,100 ops/sec ±1.17% (83 runs sampled)

  fastest is extglob

# benchmark/fixtures/isMatch/range-true.js (56 bytes)
  extglob x 2,044,321 ops/sec ±1.39% (84 runs sampled)
  minimatch x 108,353 ops/sec ±1.58% (82 runs sampled)

  fastest is extglob

# benchmark/fixtures/isMatch/star-simple.js (45 bytes)
  extglob x 2,253,102 ops/sec ±1.28% (84 runs sampled)
  minimatch x 146,997 ops/sec ±1.39% (84 runs sampled)

  fastest is extglob
