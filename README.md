title: Generator, Co, Koa
author:
  name: dead_horse
  url: http://deadhorse.me
output: index.html
controls: true

--

# Co and Koa

--

### generator

* ES6 新特性
* node v0.11 可以使用 (node --harmony)
* 通过 [gnode](https://github.com/TooTallNate/gnode) 体验

```
function* hello() {
  yield 'hello';
  yield function () {
    return 'generator';
  };
  return 'done';
}
```

--

```
> hello.constructor.name // GeneratorFunction
> var gen = hello();
> typeof gen.next === 'funciton';
> typeof gen.throw === 'function';

> var res = gen.next();
> res.value === 'hello';
> res = gen.next();
> res.value() === 'generator';
> res = gen.next();
> res.value === 'done';
> res.done = true;

```

[fibonacci](blob/master/fibonacci.js)

--

# generator 与异步

--

### yield 异步方法

```
function delay(done) {
  setTimeout(function () {
    done(null, 'delay done');
  }, 1000);
}
function *async() {
  console.log('before delay');
  yield delay;
  console.log('after delay');
}

var gen = async();
var ret = gen.next();
ret.value(next);
// wrap a next
function next(err, data) {
  ret = gen.next();
  if (!ret.done) {
    ret.value(next);
  }
}
```

--

### yieldable and thunk

* 需要将所有的 callback 都转换成 thunk：

```
function (args) {
  return function delay(done) {
    fn(args, done);
  };
}
```

thunk 执行之后返回的就是类似之前 `delay` 的函数，可以

```
yield thunk(args);
```

--

### callback to thunk

* [thunkify](https://github.com/visionmedia/node-thunkify)

```
fs.stat(filename, callback);

// =>

function stat(filename) {
  return function (done) {
    fs.stat(filename, done);
  }
}

// =>

function *() {
  yield stat('./README.md');
}
```

--

### promise to thunk

```
function (promise) {
  return function (fn) {
    promise.then(funciton (res) {
      fn(null, res);
    }, fn);
  }
}
```

--

### [co](https://github.com/visionmedia/co)

* 基于 generator 的异步编程

```
var thunkify = require('thunkify');
var co = require('co');
var fs = require('fs');

var stat = thunkify(fs.stat);
var readFile = thunkify(fs.readFile);

var thunk = co(function *() {
  var stat = yield stat('./README.md');
  var content = yield readFile('./README.md');
});
```

--

### series and parallel

* `series`

```
co(function *() {
  var a = yield request(a);
  var b = yield request(b);
})();
```

* `parallel`

```
co(function *() {
 var res = [yield request(a), yield request(b)];
})();
```

--

### 基于 co 的流程控制

* [co-parallel](): 控制并发的 parallel
* [co-gather](): 获取所有返回结果和错误的 parallel
* [co-wait](): sleep 
* ...

#### [co-wiki](https://github.com/visionmedia/co/wiki) , [callback_hell](https://github.com/dead-horse/callback_hell)

--

### koa

to be continue






















