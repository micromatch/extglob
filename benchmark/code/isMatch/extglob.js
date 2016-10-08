var extglob = require('../../..');

module.exports = function(file, pattern) {
  return extglob.isMatch(file, pattern);
};
