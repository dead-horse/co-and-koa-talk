/**
 * need node v0.11.9+
 *
 * ```
 * $ nvm use 0.11
 * $ node --harmony yield_array.js
 * ```
 */

/**
 * dealy 是一个 thunk
 */
function delay(interval) {
  return function (done) {
    setTimeout(function () {
      console.log('delay done');
      done(null, 'delay done');
    }, interval);
  };
}

function *genFn() {
  var start = Date.now();
  console.log('before delay');
  yield [delay(1000), delay(2000), delay(3000)];
  console.log('after delay, use: %d ms', Date.now() - start);
}

var gen = genFn();
next();

function next(err, data) {
  ret = gen.next();
  if (!ret.done) {
    var fn = ret.value;
    // 判断如果是数组，就将它转换成 thunk
    if (Array.isArray(fn)) {
      fn = arrayToThunk(fn);
    }
    fn(next);
  }
}


function arrayToThunk(array) {

  return function (done) {
    var called = false;
    var len = array.length;
    var result = [];

    // 同时并发的执行 array 里面的异步函数
    // 异步函数执行完调用 cb
    // cb 调用 `array.lenth` 次之后执行 done
    // 这样把一个函数的数组转换成了一个 thunk
    array.forEach(function (fn, index) {
      fn(function (err, data) {
        if (err) {
          return cb(err);
        }
        result[index] = data;
        cb();
      });
    });

    // cb 执行 `len` 次之后才会执行 done()
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
  };
}
