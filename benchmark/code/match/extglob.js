var extglob = require('../../..');

module.exports = function(file, pattern) {
  return extglob.match(file, pattern);
};
