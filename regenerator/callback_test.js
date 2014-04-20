
var path = require('path');
var co = require('co');
var read = require('./');

var filename = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, 'test.js');

co(read)(filename, function (err, content) {
  if (err) {
    return console.log(err);
  }
  console.log('%s\' content is: %s', filename, content);
});
