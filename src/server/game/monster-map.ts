import { getRandomInt, getRandomFromArray } from "../../shared/helpers";
import { Monster, MonsterData } from "./monster";
import { Slime } from "./monsters/slime";

export class MonsterMap extends Map<number, Monster> {
  create(id: number, monsterData: MonsterData) {
    const monster = new Monster(id, monsterData);
    this.set(id, monster);
  }

  /**
   * @returns {Monster}
   */
  getRandom() {
    const keys = Array.from(this.keys());
    const id = getRandomFromArray(keys);
    if (id) return this.get(id);
  }

  /**
   * @returns {Monster[]}
   */
  toArray() {
    return Array.from(this.values());
  }

  createBlueSlime(id: number, level: number) {
    const slime = new Slime(id, Slime.generate(level, Slime.BLUE_SLIME));
    this.set(id, slime);
  }

  createGreenSlime(id: number, level: number) {
    const slime = new Slime(id, Slime.generate(level, Slime.GREEN_SLIME));
    this.set(id, slime);
  }

  createRedSlime(id: number, level: number) {
    const slime = new Slime(id, Slime.generate(level, Slime.RED_SLIME));
    this.set(id, slime);
  }

  createBossSlime(id: number, level: number) {
    const slime = new Slime(id, Slime.generate(level, Slime.BOSS_SLIME));
    this.set(id, slime);
  }

  createSimpleMonster(id: number, name: string, color: string) {
    const maxHealth = getRandomInt(6, 16);
    this.set(
      id,
      new Monster(id, {
        name,
        maxHealth,
        health: maxHealth,
        attack: getRandomInt(1, 4),
        defense: getRandomInt(1, 2),
        heal: 1,
        color,
        level: 1,
        xp: 5,
      })
    );
  }

  createSimpleBoss(id: number, name: string, color: string) {
    const maxHealth = getRandomInt(40, 60);
    this.set(
      id,
      new Monster(id, {
        name,
        maxHealth,
        health: maxHealth,
        attack: getRandomInt(2, 6),
        defense: getRandomInt(2, 4),
        heal: 1,
        color,
        level: 1,
        xp: 5,
      })
    );
  }
}
