export class SafeCounter {
  count = 0;

  next() {
    this.count += 1;
    if (this.count >= Number.MAX_SAFE_INTEGER) {
      this.count = 0;
    }
    return this.count;
  }

  reset() {
    this.count = 0;
  }
}
