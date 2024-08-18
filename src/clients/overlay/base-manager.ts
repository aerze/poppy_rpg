import { Rae } from "./rae";

export class BaseManager {
  rae: Rae;

  constructor(rae: Rae) {
    this.rae = rae;
    this.log("✅");
  }

  get title() {
    return this?.constructor?.name ?? "Rae: ";
  }

  log(...args: any) {
    console.log(`Rae: ${this.title}:`, ...args);
  }

  debug(...args: any) {
    console.debug(`Rae: ${this.title}:`, ...args);
  }

  error(...args: any) {
    console.error(`Rae: ${this.title} ⚠️:`, ...args);
  }
}
