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

### [koa](https://github.com/koajs/koa)


* TJ 和 Express 团队的新作品
* 基于 generator 和 co 的异步解决方案
* setter / getter 带来了更方便的 http 辅助方法
* 更人性化的错误处理
* 更灵活的中间件形式

--

### koa VS Express

* 不提供默认路由
* 不提供默认的模版渲染
* 不支持 node 原生的 request 和 response
* 不支持 express 中间件


* 提供默认的异步解决方案（generator）
* 更有表现力的中间件形式
* 对 request / response 提供更好体验的中间件

--

### Hello world

```
var koa = require('koa');
var app = koa();

app.use(function *() {
  this.body = 'hello!';
});

app.listen(7001);
```

#### [more examples](https://github.com/koajs/examples)
--

### 中间件

```
function *responseTime() {
  var start = Date.now();
  yield next;
  var use = Date.now() - start;
  this.set('X-ResponseTime', use);
}
```

[执行流程图](https://camo.githubusercontent.com/49c9c703465d40f1a30e0a993a4008991b76d676/68747470733a2f2f692e636c6f756475702e636f6d2f4e374c3555616b4a6f302e676966)
--

### 更灵活的中间件形式

```
var koa = require('koa');
var ejs = require('koa-ejs');
var app = koa();

ejs(app, {/*options*/});
// 挂载 function* render() {} 在 context.prototype上

app.use(function* () {
  return yield this.render('index');
});
```
--

```
var koa = require('koa');
var session = require('koa-sess');

var app = koa();
app.use(session({
  defer: true
}));

// 挂载 `session(getter & setter)` 到 context 上

app.use(function* () {
  var session = yield this.session;
  session.name = 'foo';
  this.body = {
    name: session.name
  };
});
```
--

### koa 中的异步

```
var fs = require('co-fs');

app.use(function *(){
  var paths = yield fs.readdir('docs');

  // parallel
  var files = yield paths.map(function(path){
    return fs.readFile('docs/' + path, 'utf8');
  });

  this.type = 'markdown';
  this.body = files.join('');
});
```

--
