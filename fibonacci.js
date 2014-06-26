/**
 * need node v0.11.9+
 *
 * ```
 * $ nvm use 0.11
 * $ node --harmony fibonacci.js
 * ```
 */
function* fibonacci(total) {
  var first = 0;
  var second = 1;
  var tmp;

  yield first;
  yield second;

  while(total--) {
    tmp = first;
    first = second;
    second = tmp + second;
    yield second;
  }
}

var total = parseInt(process.argv[2], 10) || 30;
var f = fibonacci(total);
var res;
while(!(res = f.next()).done) {
  console.log(res.value);
}
