import { Socket } from "socket.io";
import { Claire } from "../claire";
import { BaseManager } from "./base-manager";
import { BasePlayerInfo, DefaultPlayer, Player } from "../data/player";

export class AuthManager extends BaseManager {
  constructor(claire: Claire) {
    super(claire);
    claire.io.on("connection", this.handleSocketConnected);
  }

  handleSocketConnected = (socket: Socket) => {
    socket.on("disconnect", this.handleSocketConnected.bind(null, socket));
    console.log(">> socket connected");
    socket.once("RPG:CLIENT_CONNECT", this.handlePlayerClient.bind(this, socket));
  };

  handleSocketDisconnected = (socket: Socket) => {
    console.log(">> socket disconnected");
  };

  async handlePlayerClient(socket: Socket, playerId?: string) {
    const players = this.claire.db.players;

    if (playerId) {
      let player = await players.get(socket, playerId);
      if (!player) return;

      player = { ...DefaultPlayer, ...player };
      const playerNoId: any = { ...player };
      delete playerNoId._id;
      delete playerNoId.id;
      players.update(socket, playerNoId, player.id);
      socket.emit("RPG:SIGN_IN", player);

      this.initializeConnectedPlayer(socket, player);
    } else {
      // respond to the client that it needs to create new character
      socket.emit("RPG:SIGN_UP");
      socket.once("RPG:HANDLE_SIGN_UP", this.handlePlayerSignup.bind(null, socket));
    }
  }

  async handlePlayerSignup(socket: Socket, basePlayerInfo: BasePlayerInfo) {
    const player = await this.claire.db.players.create(socket, basePlayerInfo);

    if (!player) {
      return null;
    }

    socket.emit("RPG:COMPLETED_SIGN_UP", player);
    this.initializeConnectedPlayer(socket, player);
  }

  async handlePlayerUpdate(socket: Socket, basePlayerInfo: BasePlayerInfo & { id: string }) {
    console.log(">> handlePlayerUpdate", basePlayerInfo);
    if (!basePlayerInfo.id) return;
    if (!basePlayerInfo) return;

    if (await this.claire.db.players.update(socket, basePlayerInfo, basePlayerInfo.id)) {
      socket.emit("RPG:PLAYER_INFO_UPDATED", basePlayerInfo);
    }
  }

  async initializeConnectedPlayer(socket: Socket, player: Player) {
    console.log("initializeConnectedPlayer");
    socket.on("RPG:REQUEST", this.claire.router.handleRequest.bind(this.claire.router, socket, player));

    // socket.on("RPG:UPDATE_PLAYER_INFO", handlePlayerUpdate.bind(null, socket));
    // debug(socket, `Initializing Connection for ${player.id}`);
    // socket.emit("RPG:DUNGEON:LIST", claire.dungeons.list());
    // socket.on("Disconnect", () => {
    //   dungeon.leave(socket, player);
    // });
    // socket.on("RPG:DEV:JOIN_DUNGEON", () => {
    //   if (dungeon.join(socket, player)) {
    //     socket.emit("RPG:DEV:DUNGEON_JOINED", { battle: dungeon.battle });
    //   }
    // });
    // socket.on("RPG:DEV:START_BATTLE", () => {
    //   dungeon.battle.start();
    // });
  }
}
