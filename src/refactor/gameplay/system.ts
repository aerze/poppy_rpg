import { Claire } from "../claire/claire";

export class System {
  claire: Claire;

  constructor(claire: Claire) {
    this.claire = claire;
    this.log("✅");
  }

  load() {}

  unload() {}

  update() {}

  join() {}

  leave() {}

  get title() {
    return this?.constructor?.name ?? "🐸: ";
  }

  log(...args: any) {
    console.log(`🐸: ${this.title}:`, ...args);
  }
}
