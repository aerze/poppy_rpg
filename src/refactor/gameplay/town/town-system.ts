import { Player } from "../global/player";
import { System } from "../system";

export class TownSystem extends System {
  name = "town";

  positions: Map<Player["id"], [number, number]> = new Map();

  [System.Join]() {}

  join(playerId: Player["id"]) {
    this.positions.set(playerId, [10, 200]);
    this.updatePlayers({
      players: this._getAllPlayerAssets(),
      positions: this._getAllPositions(),
    });
  }

  leave(playerId: Player["id"]) {
    this.positions.delete(playerId);
    this.updatePlayers({
      players: this._getAllPlayerAssets(),
      positions: this._getAllPositions(),
    });
  }

  _mount() {
    return {
      players: this._getAllPlayerAssets(),
      positions: this._getAllPositions(),
    };
  }

  _move(playerId: Player["id"], options: { position?: [number, number] }) {
    if (!this.isLocalPlayer(playerId)) return;
    if (!options.position) return;

    this.positions.set(playerId, options.position);
    this.updatePlayers({ positions: this._getAllPositions() });
  }

  _getAllPlayerAssets() {
    const players = [];
    for (const playerId of this.instance.players) {
      const player = this.claire.players.list.get(playerId)!;
      players.push({
        id: player.id,
        assetUrl: player.assetUrl,
      });
    }
    return players;
  }

  _getAllPositions() {
    return Object.fromEntries(this.positions.entries());
  }
}
