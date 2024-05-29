export class DeferredPromise<T> extends Promise<T> {
  static noop = () => {};

  resolve?: (value: T) => void;

  reject?: () => void;

  constructor() {
    super((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
