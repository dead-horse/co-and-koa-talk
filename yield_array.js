/**
 * need node v0.11.9+
 *
 * ```
 * $ nvm use 0.11
 * $ node --harmony yield_array.js
 * ```
 */

function delay(done) {
  setTimeout(function () {
    done(null, 'delay done');
  }, 1000);
}

function *genFn() {
  var start = Date.now();
  console.log('before delay');
  yield [delay, delay, delay];
  console.log('after delay, use: %d ms', Date.now() - start);
}

var gen = genFn();
var ret = gen.next();

boot(ret.value);

function boot(fn) {
  if (Array.isArray(fn)) {
    fn = arrayToThunk(fn);
  }
  fn(next);
}

function next(err, data) {
  ret = gen.next();
  if (!ret.done) {
    boot(ret.value);
  }
}


function arrayToThunk(array) {

  return function (done) {
    var called = false;
    var len = array.length;
    var result = [];
    var cb = function (err) {
      if (called) return;
      if (err) {
        called = true;
        return done(err);
      }
      if (--len === 0) {
        called = true;
        done(null, result);
      }
    };

    array.forEach(function (fn, index) {
      fn(function (err, data) {
        if (err) {
          return cb(err);
        }
        result[index] = data;
        cb();
      });
    });
  };
}
