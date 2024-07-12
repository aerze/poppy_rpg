import { SocketManager } from "./manager/socket-manager";
import { DungeonManager } from "./manager/dungeon-manager";
import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { Db, MongoClient } from "mongodb";
import { PlayerCollection } from "./player-collection";
import { ClientRouter } from "./manager/client-router";
import { PlayerManager } from "./manager/player-manager";

export let claire: Claire;

export class Claire {
  static async initialize(io: Server, http: HTTPServer, mongo: MongoClient) {
    console.log("CLAIRE: INITIALIZING");

    try {
      await mongo.connect();
    } catch (e) {
      console.log("CLAIRE: Mongo failed to connect");
      console.error(e);
      throw e;
    }

    console.log("CLAIRE: Mongo Connected");
    claire = new Claire(io, http, mongo);

    claire.http;
    return claire;
  }

  io: Server;
  http: HTTPServer;
  mongo: MongoClient;
  mongodb: Db;
  socket: SocketManager;
  router: ClientRouter;

  players: PlayerManager;

  db: {
    players: PlayerCollection;
  };

  dungeons: DungeonManager;

  constructor(io: Server, http: HTTPServer, mongo: MongoClient) {
    this.io = io;
    this.http = http;
    this.mongo = mongo;
    this.mongodb = this.mongo.db("poppyrpg");
    this.socket = new SocketManager(this);
    this.router = new ClientRouter(this);
    this.players = new PlayerManager(this);
    this.db = {
      players: new PlayerCollection(this.mongodb),
    };
    this.dungeons = new DungeonManager();
  }
}
