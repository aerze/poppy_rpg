import { Socket } from "socket.io";
import { Dungeon, DungeonType } from "../behavior/dungeon";
import { Player } from "../data/player";

export class DungeonManager {
  dungeonCounter = 0;

  liveDungeon: Dungeon;

  dungeonsMap: Map<number, Dungeon> = new Map();

  constructor() {
    this.liveDungeon = this.create("Live", DungeonType.LimitedTimeEvent);
    this.create("Slime");
  }

  create(name: string, type = DungeonType.Normal) {
    const dungeon = new Dungeon(this.dungeonCounter++, name, type);
    this.dungeonsMap.set(dungeon.id, dungeon);
    return dungeon;
  }

  getInfo(dungeonId: number) {
    const dungeon = this.dungeonsMap.get(dungeonId);
    if (!dungeon) return null;

    return {
      id: dungeon.id,
      name: dungeon.name,
      battle: dungeon.battle,
      playerCount: dungeon.connectedPlayers.size,
    };
  }

  getBasicList() {
    return Array.from(this.dungeonsMap.values()).map((dungeon) => {
      return {
        id: dungeon.id,
        name: dungeon.name,
        type: dungeon.type,
      };
    });
  }

  join(dungeonId: number, socket: Socket, player: Player) {
    const dungeon = this.dungeonsMap.get(dungeonId);
    if (!dungeon) return null;

    return dungeon.join(socket, player);
  }
}
