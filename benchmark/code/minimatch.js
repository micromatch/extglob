var minimatch = require('minimatch');

module.exports = function(args) {
  var re = minimatch.makeRe(args[1]);
  return re.test(args[0]);
};
