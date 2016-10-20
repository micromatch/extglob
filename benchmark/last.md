Benchmarking: (5 of 5)
 · negation-nested
 · negation-simple
 · range-false
 · range-true
 · star-simple

# benchmark/fixtures/isMatch/negation-nested.js (49 bytes)
  extglob x 1,988,591 ops/sec ±1.18% (84 runs sampled)
  minimatch x 73,335 ops/sec ±1.38% (84 runs sampled)

  fastest is extglob

# benchmark/fixtures/isMatch/negation-simple.js (43 bytes)
  extglob x 2,320,380 ops/sec ±1.71% (86 runs sampled)
  minimatch x 122,947 ops/sec ±1.28% (86 runs sampled)

  fastest is extglob

# benchmark/fixtures/isMatch/range-false.js (56 bytes)
  extglob x 1,729,572 ops/sec ±1.22% (84 runs sampled)
  minimatch x 112,566 ops/sec ±1.26% (85 runs sampled)

  fastest is extglob

# benchmark/fixtures/isMatch/range-true.js (56 bytes)
  extglob x 1,819,085 ops/sec ±1.28% (83 runs sampled)
  minimatch x 115,153 ops/sec ±1.50% (85 runs sampled)

  fastest is extglob

# benchmark/fixtures/isMatch/star-simple.js (46 bytes)
  extglob x 1,970,063 ops/sec ±1.46% (83 runs sampled)
  minimatch x 138,805 ops/sec ±1.31% (87 runs sampled)

  fastest is extglob
