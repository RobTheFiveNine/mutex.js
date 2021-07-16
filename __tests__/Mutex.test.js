const Mutex = require('../src/Mutex');

beforeEach(() => {
  Mutex.removeAll();
});

describe('.prototype.isLocked', () => {
  describe('if the mutex is locked', () => {
    it('should return true', async () => {
      const mutex = new Mutex();
      await mutex.wait();
      expect(mutex.isLocked).toBe(true);
    });
  });

  describe('if the mutex is not locked', () => {
    it('should return false', async () => {
      const mutex = new Mutex();
      expect(mutex.isLocked).toBe(false);
    });
  });
});

describe('.prototype.name', () => {
  it('should return the mutex name', () => {
    const mutex = new Mutex('test');
    expect(mutex.name).toEqual('test');
  });
});

describe('.prototype.wait(timeout)', () => {
  it('should lock the mutex', async () => {
    const mutex = new Mutex();
    expect(mutex.isLocked).toBe(false);

    await mutex.wait();
    expect(mutex.isLocked).toBe(true);
  });

  describe('when the lock is not released within [timeout]', () => {
    it('should reject', async () => {
      const mutex = new Mutex();
      await mutex.wait();

      await expect(mutex.wait(500)).rejects.toThrow(
        'Failed to acquire lock',
      );
    });

    it('should not prevent future acquisitions', async () => {
      const mutex = new Mutex();
      await mutex.wait();

      await expect(mutex.wait(500)).rejects.toThrow(
        'Failed to acquire lock',
      );

      mutex.release();
      await expect(mutex.wait(500)).resolves.not.toThrow();
    });
  });

  describe('when the lock is released', () => {
    it('should resolve the callers of wait() on a FIFO basis', async () => {
      const mutex = new Mutex();
      const callback = jest.fn(() => mutex.release());

      await mutex.wait();
      mutex.wait().then(() => {
        setTimeout(() => {
          callback(0);
        }, 250);
      });

      mutex.wait().then(() => callback(2));
      mutex.wait().then(() => callback(1));
      mutex.release();

      await new Promise(
        (resolve) => setTimeout(resolve, 500),
      );

      expect(callback.mock.calls).toEqual([
        [0],
        [2],
        [1],
      ]);
    });
  });
});

describe('.prototype.release()', () => {
  it('should unlock the mutex', async () => {
    const mutex = new Mutex();
    expect(mutex.isLocked).toBe(false);

    await mutex.wait();
    expect(mutex.isLocked).toBe(true);

    mutex.release();
    expect(mutex.isLocked).toBe(false);
  });
});

describe('.getMutex(name)', () => {
  it('should return a named mutex', () => {
    const mutex = Mutex.getMutex('named mutex');
    expect(mutex).toBeInstanceOf(Mutex);
    expect(mutex.name).toEqual('named mutex');
  });

  describe('if a named mutex already exists', () => {
    it('should return the existing mutex', () => {
      const mutex = Mutex.getMutex('named mutex');
      expect(mutex).toBeInstanceOf(Mutex);
      expect(mutex.name).toEqual('named mutex');

      const existing = Mutex.getMutex('named mutex');
      expect(existing).toBe(mutex);

      const newMutex = Mutex.getMutex('unique');
      expect(newMutex).not.toBe(mutex);
      expect(newMutex).not.toBe(existing);
    });
  });
});

describe('.getAllMutexes()', () => {
  it('should return an array of registered mutexes', () => {
    Mutex.getMutex('mutex1');
    Mutex.getMutex('mutex2');
    Mutex.getMutex('mutex3');

    const mutexes = Mutex.getAllMutexes();
    expect(mutexes).toHaveLength(3);

    for (let i = 0; i < mutexes.length; i += 1) {
      expect(mutexes[i].name).toEqual(`mutex${i + 1}`);
    }
  });
});

describe('.remove(name)', () => {
  it('should release and remove the matching mutex', async () => {
    Mutex.getMutex('mutex1');
    Mutex.getMutex('mutex2');
    const mutex = Mutex.getMutex('mutex3');

    await mutex.wait();

    Mutex.remove('mutex3');
    expect(mutex.isLocked).toBe(false);

    const mutexes = Mutex.getAllMutexes();
    expect(mutexes).toHaveLength(2);

    for (let i = 0; i < mutexes.length; i += 1) {
      expect(mutexes[i].name).toEqual(`mutex${i + 1}`);
    }
  });

  describe('if `name` does not exist', () => {
    it('should not throw an error', () => {
      expect(() => Mutex.remove('does-not-exist')).not.toThrow();
    });
  });
});

describe('.removeAll()', () => {
  it('should release and remove all registered mutexes', async () => {
    const initialMutexes = [
      Mutex.getMutex('mutex1'),
      Mutex.getMutex('mutex2'),
      Mutex.getMutex('mutex3'),
    ];

    await Promise.all(
      initialMutexes.map((m) => m.wait()),
    );

    Mutex.removeAll();

    initialMutexes.forEach(
      (m) => expect(m.isLocked).toBe(false),
    );

    expect(Mutex.getAllMutexes()).toHaveLength(0);
  });
});
