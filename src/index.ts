type Awaitable<T> = T | Promise<T>;
type BatchFn<Key, Result> = (keys: Key[]) => Awaitable<Result[]>;

interface BatchOptions {
  /**
   * The maximum number of keys to batch together in a single request.
   *
   * @default Infinity
   */
  maxBatchSize?: number;
  /**
   * A function that will be called to dispatch the batched request.
   *
   * @param fn
   * @returns
   */
  scheduler?: (fn: () => void) => void;
}

interface Task<Key, Result> {
  key: Key;
  resolve: (value: Result) => void;
  reject: (reason?: unknown) => void;
}

export function createPBatch<T, K>(
  batchFn: BatchFn<T, K>,
  options: BatchOptions
) {
  const {
    maxBatchSize: initialMaxBatchSize = Infinity,
    scheduler = (fn) => Promise.resolve().then(fn),
  } = options;

  let maxBatchSize = initialMaxBatchSize;
  const tasks: Task<T, K>[] = [];

  /**
   * Dispatches the current batch of keys.
   *
   * @returns
   */
  function dispatch() {
    if (tasks.length === 0) {
      return Promise.resolve([]);
    }

    const tasksToConsume = tasks.splice(0, maxBatchSize);
    const keys = tasksToConsume.map((t) => t.key);

    // TODO: Pass custom handler for errors
    return Promise.resolve(batchFn(keys))
      .then((results) =>
        tasksToConsume.forEach((task, i) => task.resolve(results[i]))
      )
      .catch((err) => tasksToConsume.forEach((task, i) => task.reject(err)));
  }

  /**
   * Gets a value from the cache, or fetches it from the source if it's not cached.
   *
   * @param key
   * @returns
   */
  function get(key: T) {
    return new Promise<K>((resolve, reject) => {
      tasks.push({ key, resolve, reject });
      if (tasks.length >= maxBatchSize) {
        return dispatch();
      }

      if (tasks.length === 1) {
        scheduler(() => dispatch());
      }
    });
  }

  get.setMaxBatchSize = (size: number) => {
    maxBatchSize = size;
  };

  return get;
}

export default createPBatch;