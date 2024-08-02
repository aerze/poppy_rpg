import { Claire } from "../claire";

export class BaseManager {
  claire: Claire;

  constructor(claire: Claire) {
    this.claire = claire;
    this.log("✅");
  }

  get title() {
    return this?.constructor?.name ?? "Claire: ";
  }

  log(...args: any) {
    console.log(`CLAIRE: ${this.title}:`, ...args);
  }

  debug(...args: any) {
    console.debug(`CLAIRE: ${this.title}:`, ...args);
  }

  error(...args: any) {
    console.error(`CLAIRE: ${this.title} ⚠️:`, ...args);
  }
}
