import { Server as HTTPServer } from "http";
import { Db, MongoClient } from "mongodb";
import { Server } from "socket.io";
import { PlayerCollection } from "./db/player-collection";
import { PlayerManager } from "./player-manager";
import { ClientManager } from "./client-manager";
import { Instance, InstanceManager } from "./instance-manager";
import { TownSystem } from "../gameplay/town/town-system";

// import { SocketManager } from "./manager/socket-manager";
// import { DungeonManager } from "./manager/dungeon-manager";
// import { PlayerCollection } from "./player-collection";
// import { Router } from "./manager/router";
// import { PlayerManager } from "./manager/player-manager";

export let claire: Claire;

export class Claire {
  static async initialize(io: Server, http: HTTPServer, mongo: MongoClient) {
    console.log("CLAIRE: INITIALIZING 👩‍❤️‍💋‍👩");

    try {
      await mongo.connect();
    } catch (e) {
      console.log("CLAIRE: Mongo failed to connect");
      console.error(e);
      throw e;
    }

    console.log("CLAIRE: Mongo Connected 🥭");
    claire = new Claire(io, http, mongo);
    return claire;
  }

  io: Server;
  http: HTTPServer;
  mongo: MongoClient;
  mongodb: Db;
  db: {
    players: PlayerCollection;
  };

  players: PlayerManager;
  clients: ClientManager;
  instances: InstanceManager;

  constructor(io: Server, http: HTTPServer, mongo: MongoClient) {
    this.io = io;
    this.http = http;
    this.mongo = mongo;
    this.mongodb = this.mongo.db("poppyrpg");
    this.db = {
      players: new PlayerCollection(this, this.mongodb),
    };

    this.clients = new ClientManager(this);
    this.players = new PlayerManager(this);
    this.instances = new InstanceManager(this);
  }
}
