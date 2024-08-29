import { Socket } from "socket.io";
import { Player, PlayerId, PlayerPresetToUrl } from "../data/player";
import { Stats } from "../types";
import { BaseManager } from "./base-manager";
import { BadgeType } from "../data/badges";

export enum Location {
  TOWN, // main lobby
  DUNGEON,
}

export const LocationToRoom = {
  [Location.TOWN]: "town", // main lobby
  [Location.DUNGEON]: "dungeon",
};

export class PlayerManager extends BaseManager {
  map: Map<PlayerId, Player> = new Map();

  sockets: Map<PlayerId, Socket> = new Map();

  locations: Map<PlayerId, Location> = new Map();

  add(playerId: PlayerId, player: Player, socket: Socket) {
    this.sockets.set(playerId, socket);
    this.map.set(playerId, player);
    this.setLocation(playerId, Location.TOWN, socket);
  }

  move(playerId: PlayerId, location: Location) {
    const socket = this.sockets.get(playerId);
    if (!socket) {
      this.log(`Player ${playerId} failed to move, missing socket`);
      return;
    }

    const previousLocation = this.locations.get(playerId);
    if (previousLocation) {
      const previousRoom = LocationToRoom[previousLocation];
      socket.leave(previousRoom);
      this.updateRoom(previousLocation);
    } else {
      this.log(`Player ${playerId} had no previous location?`);
    }

    const room = LocationToRoom[location];
    this.locations.set(playerId, location);
    socket.join(room);
    this.updateRoom(location);
  }

  setLocation(playerId: PlayerId, location: Location, socket: Socket) {
    this.locations.set(playerId, location);
    socket.join(LocationToRoom[location]);
    this.updateRoom(location);
  }

  updateRoom(location: Location) {
    const players = this.getPlayersAt(location).map(this.getSimplePlayer);
    this.claire.io.to(LocationToRoom[location]).emit("RPG:ROOM", { players });
  }

  getPlayersAt(filterLocation: Location) {
    const players: Player[] = [];
    for (const [playerId, location] of this.locations) {
      if (location === filterLocation) {
        const player = this.map.get(playerId);
        if (player) players.push(player);
      }
    }
    return players;
  }

  remove(playerId: PlayerId) {
    const socket = this.sockets.get(playerId);
    if (socket) {
      const previousLocation = this.locations.get(playerId);
      if (previousLocation) {
        socket.leave(LocationToRoom[previousLocation]);
      }
    }

    this.sockets.delete(playerId);
    this.locations.delete(playerId);
    this.map.delete(playerId);
  }

  getSimplePlayer(player: Player) {
    return {
      id: player.id,
      name: player.name,
      color: player.color,
      level: player.level,
      title: player.activeTitle,
      assetUrl: PlayerPresetToUrl[player.presetId],
    };
  }

  getOverlayPlayer(player: Player) {}

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

  getLevelRequirement(level: number) {
    return Math.floor((level * level * level) / Math.log10(level + 1) + 100);
  }

  addBadge(playerId: PlayerId, badgeType: BadgeType) {
    const player = this.map.get(playerId);
    if (!player) return false;

    const bannerSet = new Set(player.badges.map((b) => b.id));
    if (bannerSet.has(badgeType)) return false;

    const badge = { id: badgeType, date: new Date() };
    player.badges.push(badge);
    return true;
  }
}
