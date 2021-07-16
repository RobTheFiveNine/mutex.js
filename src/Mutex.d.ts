export = Mutex;

declare class Mutex {
  /**
   * Gets the globally registered mutex corresponding to `name`.
   * If a mutex has not already been created for `name`, one will
   * be created and returned.
   *
   * @param name The name of the mutex to retrieve.
   */
  static getMutex(name: string): Mutex;

  /**
   * Returns all globally registered mutexes created using
   * `Mutex.getMutex`.
   */
  static getAllMutexes(): Array<Mutex>;

  /**
   * Release and remove a globally registered mutex
   * created using `Mutex.getMutex` with a matching
   * `name`.
   * 
   * @param name The name of the mutex to remove.
   */
  static remove(name: string): void;

  /**
   * Release and remove all globally registered
   * mutexes created using `Mutex.getMutex`.
   */
  static removeAll(): void;

  /**
   * Creates a new Mutex object.
   *
   * @param name An optional name used to identify
   *             the resource the mutex locks.
   */
  constructor(name?: string);

  /**
   * Attempts to acquire a lock on the mutex. If the lock can be
   * acquired, it will set `.isLocked` to `true`, and will resolve
   * the promise.
   *
   * If the optional argument, `timeout`, is `0`, the call will wait
   * indefinitely until the lock is released.
   *
   * If `timeout` is a value greater than `0`, the promise will be
   * rejected after the number of milliseconds specified in
   * `timeout` have elapsed.
   *
   * @param timeout The number of milliseconds to wait for the lock
   *                to be acquired.
   */
  wait(timeout?: number): Promise<void>;

  /**
   * Releases the existing lock. If there are any consumers that have
   * called `.wait(timeout)` and are still waiting, the first to have
   * called `.wait(timeout)` will acquire the lock.
   *
   * Once there are no more consumers waiting to acquire the lock,
   * `.isLocked` will be set to `false`.
   *
   * **Note**: it is important to always call `.release()` once
   * finished accessing the resource. If not, nothing else will
   * be able to acquire the lock.
   */
  release(): void;

  /**
   * Returns a boolean value indicating whether or not the mutex is locked.
   */
  get isLocked(): boolean;

  /**
   * Returns the name of the mutex.
   */
  get name(): string;
}
