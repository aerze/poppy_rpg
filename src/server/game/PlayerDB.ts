import sanitize from "mongo-sanitize";
import { Collection, ObjectId } from "mongodb";
import { Player, PlayerUserData, SavedPlayerData } from "./player";
import { Socket } from "socket.io";

export class PlayerDB {
  static db: Collection | null = null;

  /**
   * @param {PlayerUserData} userData
   * @return {PlayerUserData}
   */
  static clean(userData: PlayerUserData) {
    return {
      name: sanitize(userData.name),
      action: sanitize(userData.action),
      nextAction: sanitize(userData.nextAction),
      color: sanitize(userData.color),
      preset: sanitize(userData.preset),
      job: sanitize(userData.job),
      active: Boolean(userData.active),
    };
  }

  static async create(data: PlayerUserData, socket: Socket): Promise<Player | null> {
    console.log(`Player:create ${data.name}`);
    const cleanData = PlayerDB.clean(data);
    const player = new Player(cleanData, socket);
    try {
      const result = await PlayerDB.db?.insertOne(player.toJSON());
      if (!result) return null;

      player.id = result.insertedId.toString();
      return player;
    } catch (error) {
      console.warn(`Failed to create player`, error);
      return null;
    }
  }

  static async get(playerId: string, socket: Socket) {
    console.log(`Player:get ${playerId}`);
    try {
      const playerData = await PlayerDB.db?.findOne<SavedPlayerData>(new ObjectId(playerId));
      if (!playerData) return null;
      const player = new Player(playerData as SavedPlayerData, socket);
      player.id = playerId;
      return player;
    } catch (error) {
      console.warn(`PlayerDB find query failed: ${playerId}`, error);
      return null;
    }
  }

  static async save(player: Player) {
    try {
      const result = await PlayerDB.db?.replaceOne({ _id: new ObjectId(player.id) }, player.toJSON());
      if (!result) return false;

      return Boolean(result.matchedCount);
    } catch (error) {
      console.log(`Failed to save player ${player.id}`, error);
      return false;
    }
  }

  static delete() {}
}
