import sanitize from "mongo-sanitize";
import { Socket } from "socket.io";
import { Collection, Db, ObjectId } from "mongodb";
import { Claire } from "../claire";
import { BaseManager } from "../base-manager";
import { Player, PlayerFormData, PlayerPresetToUrl } from "../../gameplay/global/player";

export class PlayerCollection extends BaseManager {
  collection: Collection<Player>;

  constructor(claire: Claire, mongoDb: Db) {
    super(claire);
    this.collection = mongoDb.collection<Player>("rpg_players");
  }

  clean(playerInfo: PlayerFormData): PlayerFormData {
    return {
      name: sanitize(playerInfo.name),
      color: sanitize(playerInfo.color),
      presetId: sanitize(playerInfo.presetId),
      backstory: sanitize(playerInfo.backstory),
    };
  }

  async create(socket: Socket, playerInfo: PlayerFormData) {
    const cleanData = this.clean(playerInfo);
    this.log(`creating ${cleanData.name}`);

    const player = {
      ...Player.create(playerInfo),
      twitchId: socket.data.session.userid,
      nextLevel: Player.getLevelRequirement(1),
    };

    try {
      const result = await this.collection?.insertOne(player);
      if (!result) {
        this.log(`failed to create ${cleanData.name}`);
        // socket.emit("RPG:ALERT", "Failed to create player");
        return null;
      }
      player.id = result.insertedId.toString();
      return player;
    } catch (error) {
      this.log(`failed to create ${cleanData.name}`, error);
      // socket.emit("RPG:ALERT", "Failed to create player");
      return null;
    }
  }

  async get(playerId: string) {
    try {
      const player = await this.collection.findOne(new ObjectId(playerId));
      if (!player) {
        this.log(`failed to find player by ID`);
        // socket.emit("RPG:ALERT", "Failed to find player");
        return null;
      }

      player.id = playerId;
      return player;
    } catch (error) {
      this.log(`failed to find player by ID`, error);
      // socket.emit("RPG:ALERT", "Failed to find player");
      return null;
    }
  }

  async getByTwitchId(socket: Socket) {
    try {
      const player = await this.collection.findOne({ twitchId: socket.data.session.userid });
      if (!player) {
        // socket.emit("RPG:ALERT", "You must be new here..");
        return null;
      }

      player.id = player._id.toString();
      player.assetUrl = PlayerPresetToUrl[player.presetId];
      return player;
    } catch (error) {
      this.log("failed to find player by twitch ID.", error);
      // socket.emit("RPG:ALERT", "Failed to find player");
      return null;
    }
  }

  async set(player: Player) {
    try {
      const result = await this.collection.replaceOne({ _id: new ObjectId(player.id) }, player);
      if (!result) {
        // socket.emit("RPG:Alert", "Failed to set player");
        return null;
      }

      return Boolean(result.matchedCount);
    } catch (error) {
      this.log("failed to set player test", error);
      // socket.emit("RPG:Alert", "Failed to set player");
      return null;
    }
  }

  async update(playerId: string, player: Partial<Player>) {
    const playerNoId = { ...player };
    delete (playerNoId as any)._id;
    delete playerNoId.id;
    delete playerNoId.roles;

    try {
      const result = await this.collection.updateOne({ _id: new ObjectId(playerId) }, { $set: player });
      if (!result) {
        this.log(`failed to update player by ID`);
        // socket.emit("RPG:Alert", "Failed to update player");
        return null;
      }

      return Boolean(result.matchedCount);
    } catch (error) {
      this.log(`failed to update player by ID`, error);
      // socket.emit("RPG:Alert", "Failed to update player");
      return null;
    }
  }
}