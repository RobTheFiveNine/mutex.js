const { v4: uuidv4 } = require('uuid');

class Mutex {
  #name
  #queue
  #locked
  #next

  static #namedMutexes = {};

  constructor(name) {
    this.#name = name;
    this.#queue = [];
    this.#locked = false;
  }

  #checkLock(ticket, callback, fail) {
    if (ticket.timeout > 0) {
      if ((Date.now() - ticket.created) > ticket.timeout) {
        this.#queue = this.#queue.filter((t) => t !== ticket);
        return fail(
          new Error('Failed to acquire lock'),
        );
      }
    }

    if (this.#next === ticket) {
      return callback();
    }

    return setImmediate(
      () => this.#checkLock(ticket, callback, fail),
    );
  }

  async wait(timeout = 0) {
    const ticket = {
      id: uuidv4(),
      created: Date.now(),
      timeout,
    };

    return new Promise((resolve, reject) => {
      if (this.#locked) {
        this.#queue.push(ticket);
        this.#checkLock(ticket, resolve, reject);
      } else {
        this.#locked = true;
        resolve();
      }
    });
  }

  release() {
    this.#next = this.#queue.shift();

    if (!this.#next) {
      this.#locked = false;
    }
  }

  get isLocked() {
    return this.#locked;
  }

  get name() {
    return this.#name;
  }

  static getMutex(name) {
    if (!this.#namedMutexes[name]) {
      this.#namedMutexes[name] = new this(name);
    }

    return this.#namedMutexes[name];
  }

  static getAllMutexes() {
    return Object.keys(this.#namedMutexes).map(
      (k) => this.#namedMutexes[k],
    );
  }

  static remove(name) {
    const mutex = this.#namedMutexes[name];

    if (mutex) {
      mutex.release();
      delete this.#namedMutexes[name];
    }
  }

  static removeAll() {
    this.getAllMutexes().forEach(
      (m) => m.release(),
    );

    this.#namedMutexes = {};
  }
}

module.exports = Mutex;
