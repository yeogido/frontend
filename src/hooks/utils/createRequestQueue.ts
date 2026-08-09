export function createRequestQueue(concurrency: number) {
  let active = 0;
  const pending: Array<() => void> = [];

  function runNext() {
    if (active >= concurrency) return;
    pending.shift()?.();
  }

  return function queue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      pending.push(() => {
        active += 1;
        void request()
          .then(resolve, reject)
          .finally(() => {
            active -= 1;
            runNext();
          });
      });
      runNext();
    });
  };
}
