# mutex.js [![](https://github.com/RobTheFiveNine/mutex.js/actions/workflows/test.yml/badge.svg?branch=stable)](https://github.com/RobTheFiveNine/mutex.js/actions/workflows/test.yml) [![](https://coveralls.io/repos/github/RobTheFiveNine/mutex.js/badge.svg?branch=stable)](https://coveralls.io/github/RobTheFiveNine/mutex.js?branch=stable)

Install
-------
```bash
# NPM users:
npm install @robthefivenine/mutex.js

# Yarn users:
yarn add @robthefivenine/mutex.js
```

See [The Example](#example) and the [API Documentation](#api-documentation) for usage examples.

What is Mutex.js?
-----------------
Mutex.js is a small library which exposes a `Mutex` class that enables you to synchronise access to specific resources across your application.

For example, you may have a HTTP endpoint which allows multiple users to increment a value stored in a database. If you needed to ensure that the same requests coming in at the same time were done sequentially (to ensure one of the requests doesn't overwrite the other), you could use a mutex to ensure it is done sequentially.

Why yet another mutex library?
------------------------------
Although there seems to be some good libraries out there, I felt the interface of it could be simplified. I also prefer working with [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), so building a mutex library that uses promises suited me more.

Example
-------
**Code:**
```javascript
const { Mutex } = require('@robthefivenine/mutex.js');

const mutex1 = Mutex.getMutex('first');
const mutex2 = Mutex.getMutex('second');

mutex1
  .wait()
  .then(() => {
    console.log(Date.now(), 'Acquired first lock on mutex1');
    setTimeout(() => {
      mutex1.release();
    }, 5000);
  });

mutex2
  .wait()
  .then(() => {
    console.log(Date.now(), 'Acquired first lock on mutex2');
    mutex2.release();
  });

mutex2
  .wait()
  .then(() => {
    console.log(Date.now(), 'Acquired second lock on mutex2');
    mutex2.release();
  });

mutex1
  .wait()
  .then(() => {
    console.log(Date.now(), 'Acquired second lock on mutex1');
    mutex1.release();
  });

mutex1
  .wait(1000)
  .then(() => {
    // This block should never be hit
    mutex1.release();
  })
  .catch((e) => {
    console.log(Date.now(), 'Failed to acquire lock on mutex1');
  })
```

**Output:**
```
1624101323838 Acquired first lock on mutex1
1624101323841 Acquired first lock on mutex2
1624101323842 Acquired second lock on mutex2
1624101324839 Failed to acquire lock on mutex1
1624101328841 Acquired second lock on mutex1
```

API Documentation
-----------------
### Static Methods

#### Mutex.constructor(name)

The constructor accepts an optional string in `name`. The name is not required to provide the core functionality of the mutex; it is used primarily for identifying mutexes in a global context.

#### Mutex.getMutex(name)

Gets the globally registered mutex corresponding to `name`. If a mutex has not already been created for `name`, one will be created and returned.

This is the preferred method to create mutexes when they must be shared in a global context.

### Instance Properties

#### instance.name

Returns the name of the mutex.

#### instance.isLocked

Returns a boolean value indicating whether or not the mutex is locked.

**Instance Methods**

#### async instance.wait(timeout)

Attempts to acquire a lock on the mutex. If the lock can be acquired, it will set `instance.isLocked` to `true`, and will resolve the promise.

If the optional argument, `timeout`, is `0`, the call will wait indefinitely until the lock is released.

If `timeout` is a value greater than `0`, the promise will be rejected after the number of milliseconds specified in `timeout` have elapsed.

#### release()

Releases the existing lock. If there are any consumers that have called `instance.wait(timeout)` and are still waiting, the first to have called `instance.wait(timeout)` will acquire the lock.

Once there are no more consumers waiting to acquire the lock, `instance.isLocked` will be set to `false`.

**Note:** it is important to always call `instance.release()` once finished accessing the resource. If not, nothing else will be able to acquire the lock.