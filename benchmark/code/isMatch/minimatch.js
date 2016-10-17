var minimatch = require('minimatch');

module.exports = function(str, pattern) {
  return minimatch(str, pattern);
};
