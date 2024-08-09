import { Player } from "../data/player";
import { Stats } from "../types";
import { BaseManager } from "./base-manager";

export enum Location {
  TOWN, // main lobby
  DUNGEON,
}

export class PlayerManager extends BaseManager {
  map: Map<string, Player> = new Map();

  locations: Map<string, Location> = new Map();

  get(playerId: string) {
    return this.map.get(playerId);
  }

  set(playerId: string, player: Player) {
    this.locations.set(playerId, Location.TOWN);
    return this.map.set(playerId, player);
  }

  move(playerId: string, location: Location) {
    return this.locations.set(playerId, location);
  }

  remove(playerId: string) {
    return this.map.delete(playerId);
  }

  getStatsTotal(stats: Stats) {
    return (
      stats.attack + stats.defense + stats.health + stats.luck + stats.magic + stats.mana + stats.resist + stats.speed
    );
  }

  async assignStatPoints(playerId: string, stats: Stats) {
    const player = this.map.get(playerId);
    if (!player) return false;
    if (player.availableStatPoints <= 0) return false;
    const totalPoints = this.getStatsTotal(stats);
    if (totalPoints > player.availableStatPoints) return false;

    player.stats.attack += stats.attack;
    player.stats.defense += stats.defense;
    player.stats.health += stats.health;
    player.stats.luck += stats.luck;
    player.stats.magic += stats.magic;
    player.stats.mana += stats.mana;
    player.stats.resist += stats.resist;
    player.stats.speed += stats.speed;
    player.availableStatPoints -= totalPoints;

    console.log("player.availableStatPoints", player.availableStatPoints);

    await this.claire.db.players.update(playerId, player);

    return true;
  }
}
