var extglob = require('../../..');

module.exports = function(str, pattern) {
  return extglob.isMatch(str, pattern);
};
