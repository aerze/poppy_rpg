import { Mini } from "../mini";

export class BaseManager {
  mini: Mini;

  constructor(mini: Mini) {
    this.mini = mini;
  }

  get title() {
    return this?.constructor?.name ?? "Unknown";
  }

  log(...args: any[]) {
    this.log(`${this.title}:`, ...args);
  }
}
