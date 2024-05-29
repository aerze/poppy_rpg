import { Player } from "./player";

export class PlayerMap extends Map<string, Player> {
  static Filters = {
    Active: (p: Player) => p.active,
    Attack: (p: Player) => p.action === Player.ACTION.ATTACK,
    Defend: (p: Player) => p.action === Player.ACTION.DEFEND,
    Heal: (p: Player) => p.action === Player.ACTION.HEAL,
    Damaged: (p: Player) => p.health < p.maxHealth,
  };

  /**
   * @returns {Player[]}
   */
  toArray() {
    return Array.from(this.values());
  }

  getActivePlayerCount() {
    let count = 0;
    for (const [playerId, player] of this) {
      if (player.active) count += 1;
    }
    return count;
  }

  giveXP(xp: number) {
    this.forEach((player) => {
      player.xp += xp;
      player.updatePlayerClient();
    });
  }

  // TODO
  // wrap set/delete/clear methods to recreate array then
}
