
module.exports = require('generator-supported')
  ? require('./lib/read')
  : require('./build/read');
