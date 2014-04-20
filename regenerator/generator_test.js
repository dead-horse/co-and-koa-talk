
var path = require('path');
var co = require('co');
var read = require('./');

var filename = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, 'test.js');

co(function *() {
  try {
    var content = yield read(filename);
    console.log('%s\' content is: %s', filename, content);
  } catch (err) {
    console.log(err.stack);
  }
});
