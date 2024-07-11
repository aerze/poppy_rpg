import sanitize from "mongo-sanitize";
import { Collection, Db, ObjectId } from "mongodb";
import { Socket } from "socket.io";
import { BasePlayerInfo, DefaultPlayer, Player } from "./data/player";
// import { Player, PlayerUserData, SavedPlayerData } from "./player";

export class PlayerCollection {
  collection: Collection<Player>;

  constructor(mongoDb: Db) {
    this.collection = mongoDb.collection<Player>("rpg_players");
  }

  clean(playerInfo: BasePlayerInfo) {
    return {
      name: sanitize(playerInfo.name),
      color: sanitize(playerInfo.color),
      presetId: sanitize(playerInfo.presetId),
    };
  }

  async create(socket: Socket, playerInfo: BasePlayerInfo) {
    const cleanData = this.clean(playerInfo);
    console.log(`RPG:Player:create ${cleanData.name}`);

    const player = { ...DefaultPlayer, ...cleanData };

    try {
      const result = await this.collection?.insertOne(player);
      if (!result) {
        socket.emit("RPG:Error", { message: "Failed to create player" });
        return null;
      }
      player.id = result.insertedId.toString();
      return player;
    } catch (error) {
      console.log(`Failed to create player`, error);
      socket.emit("RPG:Error", { message: "Failed to create player", error });
      return null;
    }
  }

  async get(socket: Socket, playerId: string) {
    try {
      const player = await this.collection.findOne(new ObjectId(playerId));
      if (!player) {
        socket.emit("RPG:Error", { message: "Failed to find player" });
        return null;
      }

      player.id = playerId;
      return player;
    } catch (error) {
      console.log("Failed to find player", error);
      socket.emit("RPG:Error", { message: "Failed to find player", error });
      return null;
    }
  }

  async set(socket: Socket, player: Player) {
    try {
      const result = await this.collection.replaceOne({ _id: new ObjectId(player.id) }, player);
      if (!result) {
        socket.emit("RPG:Error", { message: "Failed to set player" });
        return null;
      }

      return Boolean(result.matchedCount);
    } catch (error) {
      console.log("Failed to set player", error);
      socket.emit("RPG:Error", { message: "Failed to set player" });
      return null;
    }
  }

  async update(socket: Socket, player: Partial<Player>, playerId: string) {
    try {
      const result = await this.collection.updateOne({ _id: new ObjectId(playerId) }, { $set: player });
      if (!result) {
        socket.emit("RPG:Error", { message: "Failed to update player" });
        return null;
      }

      return Boolean(result.matchedCount);
    } catch (error) {
      console.log("Failed to update player", error);
      socket.emit("RPG:Error", { message: "Failed to update player" });
      return null;
    }
  }
}
