/**
 * need node v0.11.9+
 *
 * ```
 * $ nvm use 0.11
 * $ node --harmony yield_callback.js
 * ```
 */

function delay(done) {
  setTimeout(function () {
    done(null, 'delay done');
  }, 1000);
}

var fs = require('fs');
var stat = function (filename) {
  return function (done) {
    fs.stat(filename, done);
  };
}

function *genFn() {
  console.log('before delay');
  console.log(yield stat('./yield_callback.js'));
  console.log(yield delay);
  console.log('after delay');
}

var gen = genFn();
next();

function next(err, res) {
  var ret = gen.next(res);
  if (!ret.done) {
    return ret.value(next);
  }
}

