/**
 * need node v0.11.9+
 *
 * ```
 * $ nvm use 0.11
 * $ node --harmony fibonacci.js
 * ```
 */
function* fibonacci() {
  var first = 0;
  var second = 1;
  var tmp;

  yield first;
  yield second;

  var total = 100;

  while(total--) {
    tmp = first;
    first = second;
    second = tmp + second;
    yield second;
  }
}

var f = fibonacci();
var res;
while(!(res = f.next()).done) {
  console.log(res.value);
}
