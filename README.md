title: Generator, Co and Koa

author:

  name: dead_horse

  url: https://github.com/dead-horse

output: index.html

controls: false

--

# [Generator, Co and Koa](https://github.com/dead-horse/co-and-koa-talk)

--

## generator

* ES6 新特性
* node v0.11 可以使用 (node --harmony)
* 通过 [gnode](https://github.com/TooTallNate/gnode) 体验

--

```
function* hello() {
  yield 'hello';
  yield function () {
    return 'generator';
  };
  return 'done';
}
```

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

--

## [fibonacci](https://github.com/dead-horse/co-and-koa-talk/blob/gh-pages/fibonacci.js)

```
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
```

--

# generator 与异步

--

## yield 异步方法

```
function delay(done) {
  setTimeout(function () {
    done(null, 'delay done');
  }, 1000);
}

function *genFn() {
  console.log('before delay');
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
```

[full example](https://github.com/dead-horse/co-and-koa-talk/blob/gh-pages/yield_callback.js)

--

## yieldable and thunk

* 只接受一个参数（且为callback）的异步函数
* 需要将所有的 callback 形式的方法都转换成 thunk

```
function delay(interval) {
  // 返回的是一个 thunk
  return function (done) {
    setTimeout(function () {
      done(null, 'delay done');
    }, interval);
  };
}
```

```
yield delay(1000);
```

--

## callback to thunk

* [thunkify](https://github.com/visionmedia/node-thunkify)
* [thunkify-wrap](https://github.com/dead-horse/node-thunkify-wrap)

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

## promise to thunk

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

## [Array to thunk](https://github.com/dead-horse/co-and-koa-talk/blob/gh-pages/yield_array.js)

```
function arrayToThunk(array) {
  return function (done) {
    var called = false, len = array.length, result = [];
    // 同时并发的执行 array 里面的异步函数
    // 异步函数执行完调用 cb
    // cb 调用 `array.lenth` 次之后执行 done
    // 这样把一个函数的数组转换成了一个 thunk
    array.forEach(function (fn, index) {
      fn(function (err, data) {
        if (err) return cb(err);
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

```

--

## [co](https://github.com/visionmedia/co)

* 基于 generator 的异步编程

```
var thunkify = require('thunkify');
var co = require('co');
var fs = require('fs');

var stat = thunkify(fs.stat);
var readFile = thunkify(fs.readFile);

co(function *() {
  var stat = yield stat('./README.md');
  var content = yield readFile('./README.md');
})();
```
--

## 原理

* 可以被 yield 的有： thunk, promise, generator, generatorFunction, object, array

* 所有的 node 形式的 callback 都需要转换成 `thunk`

* `object`,`array`,`promise` 自动识别并转换成 `thunk`

* `generator`, `generatorFunction` 自动识别并展开执行

--

## series and parallel

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
 var res = yield [request(a), request(b)];
})();
```

--

## 基于 co 的流程控制

* [co-parallel](https://github.com/visionmedia/co-parallel): 控制并发的 parallel
* [co-gather](https://github.com/dead-horse/co-gather): 获取所有返回结果和错误的 parallel
* [co-wait](https://github.com/juliangruber/co-wait): setTimeout 的 generator 版本
* ...

#### [co-wiki](https://github.com/visionmedia/co/wiki) , [callback_hell](https://github.com/dead-horse/callback_hell), [cojs](https://github.com/cojs)

--

## [regenerator](https://github.com/facebook/renegerator)

* 把 generator 代码编译成 ES5 的代码
* 可以实现基于 generator 的编写的库的向下兼容
* 但是需要保证所有的依赖(dependencies) 都是向下兼容(非 generator 或者支持转换)的
* Examples
  * [regenerator example](regenerator)
  * [co-urllib](https://github.com/node-modules/co-urllib)
  * [ali-oss](https://github.com/node-modules/ali-oss)

--

## [koa](https://github.com/koajs/koa)


* TJ 和 express 团队的新作品
* 基于 generator 和 co 的异步解决方案
* setter / getter 带来了更方便的 http 辅助方法
* 更人性化的错误处理
* 更灵活的中间件形式

--

## koa VS express

* 不提供默认路由
* 不提供默认的模版渲染
* 不支持 node 原生的 request 和 response
* 不支持 express 中间件


* 提供默认的异步解决方案（generator）
* 更有表现力的中间件形式
* 对 request / response 提供更好体验的中间件

--

## Hello world

```
var koa = require('koa');
var app = koa();

app.use(function *() {
  this.body = 'hello!';
});

app.listen(7001);
```

#### [more examples](https://github.com/koajs/examples)
#### [koa-todo](https://github.com/dead-horse/koa-todo)

--

## 中间件

![middleware](https://raw.github.com/fengmk2/koa-guide/master/onion.png)

--

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

## 更灵活的中间件形式

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

## 更简洁的中间件实现方式

* compress 中间件实现
  - [koa-compress](https://github.com/koajs/compress/blob/master/index.js)
  - [express-compression](https://github.com/expressjs/compression/blob/master/index.js)

--

## koa 中的异步

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

## 异常处理

* 通过 `try catch` 来捕获所有的异常
* 所有 throw 出去的 error 都会被 koa 捕获到

```
app.use(function *() {
  try {
    var file = yield fs.readFile('./README.md');
  } catch (err) {
    if (err.code === 'ENOENT') {
      this.status = 404;
      this.body = 'can not found readme'
      return;
    };
    throw err;
  }
});

```

--

## Stream 的异常处理

* 原生 http server 和 express 中

```
http.createServer(function (req, res) {
  var stream = fs.createReadStream('filename.txt');
  stream
  .on('error', onerror)
  .pipe(zlib.createGzip())
  .on('error', onerror)
  .pipe(res);

  function onerror(err) {
    res.statusCode = 500;
    res.end(err.message);
    console.error(err.stack);
  }

  res.once('close', function () {
    // 如果客户端终止了这个响应，可能导致 `fd` 泄漏, 需要 `unpipe` 来让它关闭这个 `fd`
    stream.unpipe();
  });
});
```

--

* koa 中通过神奇的 `this.body=` 帮你处理 Stream 的各种坑
  - 不用担心 fd leak
  - 不用负责监听 error

```
app.use(function *() {
  this.body = fs.createReadStream('filename.txt');
  this.body = this.body.pipe(zlib.createGzip());
});
```

--

## 深入理解 koa 福利

* [why you should and shouldnt use koa](http://jongleberry.com/why-you-should-and-shouldnt-use-koa.html)
* [jonathanong/koajs](https://github.com/jonathanong/koajs)

--

## 基于 koa 的应用

 - [cnpmjs.org](http://cnpmjs.org/) - Private npm registry and web for Enterprise, base on koa, MySQL and Simple Store Service.
 - [simgr](https://github.com/funraiseme/simgr-server) - Image proxy and resizing server
 - [component-crawler](https://github.com/component/crawler.js) - `component.json` crawler

--

## 更多中间件

- [koa-wiki](https://github.com/koajs/koa/wiki)
- [koajs](https://github.com/koajs)
- [koa-middlewares](https://github.com/cnpmjs/koa-middlewares)

--

## connect / experss 向 koa 迁移

* 框架配置和中间件替换
* model(proxy) 层通过 `thunkify` 或者 `thunkify-wrap` 包装
* 改写 controllers
* [进一步改写 model 层]

--

## 基于 co 的单元测试

* mocha 开启选项： --harmony
* mocha 添加依赖：--require co-mocha

```
$ mocha --harmony --require co-mocha

it('should co work fine', function *() {
  var stat = yield fs.stat('./README.md');
  var content = yield fs.readFile('./README.md');
  assert(stat.size === content.length);
});
```
--

## 推荐关注

* [koajs](https://github.com/koajs)
* [cojs](https://github.com/cojs)
* [TJ Holowaychuk](https://github.com/visionmedia)
* [Jonathan Ong](https://github.com/jonathanong)
* [Julian Gruber](https://github.com/juliangruber)

--

# Q & A
