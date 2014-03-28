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

function *genFn() {
  console.log('before delay');
  yield delay;
  console.log('after delay');
}

var gen = genFn();
var ret = gen.next();
ret.value(next);
function next(err, data) {
  ret = gen.next();
  if (!ret.done) {
    ret.value(next);
  }
}

