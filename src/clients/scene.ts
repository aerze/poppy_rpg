import { Mini } from "./mini";

export class Scene {
  html = ``;

  mini: Mini;
  root: HTMLDivElement;

  constructor(mini: Mini) {
    this.mini = mini;
    this.root = document.createElement("div");
  }

  load() {
    this.root.innerHTML = this.html;
    document.body.appendChild(this.root);

    const sceneElement = this.root.children[0] as HTMLDivElement;
    if (!sceneElement) throw Error("Failed to locate scene element");

    // TODO verify element is removed from temp root
    document.body.appendChild(sceneElement);

    this.root.remove();
    this.root = sceneElement;

    this.create();
  }

  create() {}

  unload() {
    this.destroy();

    this.root.remove();
    this.root = document.createElement("div");
  }

  destroy() {}
}
