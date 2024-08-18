import { CombatantData } from "../../rpg-server/data/combatant";

function el<T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  data: { id?: string; className?: string; src?: string; text?: string; value?: number },
  children: HTMLElementTagNameMap[keyof HTMLElementTagNameMap][] = []
) {
  const el = document.createElement<T>(tagName);
  if (data.id) el.id = data.id;
  if (data.className) el.className = data.className;
  if (data.src && "src" in el) el.src = data.src;
  if (data.text) el.textContent = data.text;
  if (data.value && "value" in el) el.value = data.value;

  for (const child of children) {
    el.appendChild(child);
  }

  return el;
}

export class Character {
  static root = document.getElementById("root")!;
  prevData: CombatantData;
  data: CombatantData;

  $image: HTMLImageElement;
  $name: HTMLDivElement;
  $level: HTMLDivElement;
  $health: HTMLProgressElement;
  $mana: HTMLProgressElement;
  $container: HTMLDivElement;

  x: number;
  y: number;

  constructor(data: CombatantData) {
    this.prevData = data;
    this.data = data;

    this.$image = el("img", { className: "character-image", src: `/app/${data.assetUrl}` });
    this.$name = el("div", { className: "character-name", text: data.name });
    this.$level = el("div", { className: "character-level", text: data.level.toString() });
    this.$health = el("progress", { className: "character-health", value: data.health / data.maxHealth });
    this.$mana = el("progress", { className: "character-mana", value: data.mana / data.maxMana });

    const bars = el("div", { className: "character-bars" }, [this.$health, this.$mana]);
    const info = el("div", { className: "character-info" }, [this.$level, bars]);
    const plate = el("div", { className: "character-plate" }, [this.$name, info]);

    this.$container = el("div", { className: "character" }, [this.$image, plate]);

    Character.root.appendChild(this.$container);

    this.x = 0;
    this.y = 0;
  }

  get position() {
    return [this.x, this.y];
  }

  set position([x = this.x, y = this.y]) {
    this.x = x;
    this.y = y;

    this.$container.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  update(data: CombatantData) {
    this.prevData = this.data;
    this.data = data;

    const imageHasChanged = this.prevData.assetUrl !== this.data.assetUrl;
    const nameHasChanged = this.prevData.name !== this.data.name;
    const levelHasChanged = this.prevData.level !== this.data.level;
    const healthHasChanged = this.prevData.health !== this.data.health;
    const maxHealthHasChanged = this.prevData.maxHealth !== this.data.maxHealth;
    const manaHasChanged = this.prevData.mana !== this.data.mana;
    const maxManaHasChanged = this.prevData.maxMana !== this.data.maxMana;

    if (imageHasChanged) {
      this.$image.src = `/app/${this.data.assetUrl}`;
    }

    if (nameHasChanged) {
      this.$name.textContent = this.data.name;
    }

    if (levelHasChanged) {
      this.$level.textContent = this.data.level.toString();
    }

    if (healthHasChanged || maxHealthHasChanged) {
      this.$health.value = this.data.health / this.data.maxHealth;
    }

    if (manaHasChanged || maxManaHasChanged) {
      this.$mana.value = this.data.mana / this.data.maxMana;
    }
  }

  delete() {
    this.$container.remove();
  }
}
