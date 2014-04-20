var fs = require('fs');
var thunkify = require('thunkify');

var stat = thunkify(fs.stat);
var readFile = thunkify(fs.readFile);

module.exports = function* (filename) {
  var stats = yield stat(filename);
  console.log('%s\'s stats is: %j', filename, stats);
  return yield readFile(filename, 'utf-8');
};
