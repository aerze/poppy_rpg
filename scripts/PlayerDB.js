const sanitize = require('mongo-sanitize');
const Player = require("./player");
const { ObjectId } = require('mongodb');

class PlayerDB {
  /** @type {import('mongodb').Collection} */
  static db = null;

  /**
   * @param {PlayerUserData} userData
   * @return {PlayerUserData}
   */
  static clean(userData) {
    return {
      name: sanitize(userData.name),
      action: sanitize(userData.action),
      color: sanitize(userData.color),
      job: sanitize(userData.job),
      active: Boolean(userData.active),
    };
  }

  /**
   * @param {PlayerUserData} data
   * @param {import('socket.io').Socket} socket
   * @returns
   */
  static async create(data, socket) {
    console.log(`Player:create ${data.name}`);
    const cleanData = PlayerDB.clean(data);
    const player = new Player(cleanData, socket);
    try {
      const result = await PlayerDB.db.insertOne(player.toJSON());
      player.id = result.insertedId.toString();
      return player;
    } catch (error) {
      console.warn(`Failed to create player`, error);
      return null;
    }
  }

  /**
   * @param {string} playerId 
   * @param {import('socket.io').Socket} socket 
   * @returns 
   */
  static async get(playerId, socket) {
    console.log(`Player:get ${playerId}`);
    try {
      const playerData = await PlayerDB.db.findOne(new ObjectId(playerId));
      if (!playerData) return null;
      const player = new Player(playerData, socket);
      player.id = playerId;
      return player;
    } catch (error) {
      console.warn(`PlayerDB find query failed: ${playerId}`, error);
      return null;
    }
  }

  /**
   * @param {Player} player 
   */
  static async save(player) {
    try {
      const result = await PlayerDB.db.replaceOne({ _id: new ObjectId(player.id) }, player.toJSON());
      return Boolean(result.matchedCount);
    } catch (error) {
      console.log(`Failed to save player ${player.id}`, error);
      return false;
    }
  }

  static delete() {}
}

module.exports = PlayerDB;
