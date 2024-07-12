import { Socket } from "socket.io";
import { Claire } from "../claire";
import { BaseManager } from "./base-manager";
import { BasePlayerInfo, DefaultPlayer, Player } from "../data/player";
import { getSession } from "../../server/auth";

export class SocketManager extends BaseManager {
  constructor(claire: Claire) {
    super(claire);
    claire.io.on("connection", this.handleSocketConnected);
  }

  parseCookies(cookieString: string = "") {
    return cookieString.split(";").reduce((map: Record<string, string>, cookie: string) => {
      const [key, value] = cookie.trim().split("=");
      map[key] = value;
      return map;
    }, {});
  }

  debugSession = {
    userid: "59227136",
    username: "abby_the_lesbiab",
  };

  handleSocketConnected = async (socket: Socket) => {
    const cookies = this.parseCookies(socket.request.headers.cookie);
    const sessionid = cookies?.["oauth-session"];
    let session = getSession(sessionid);
    if (!session) {
      if (socket.request.headers.origin === "http://localhost:3001") {
        session = this.debugSession;
      } else {
        throw new Error("ur missing the session cookie wtf");
      }
    }

    socket.data.session = session;

    await this.populateSocketPlayer(socket);

    socket.on("disconnect", this.handleSocketConnected.bind(null, socket));
  };

  async populateSocketPlayer(socket: Socket) {
    const player = await this.claire.db.players.getByTwitchId(socket);
    if (player === null) {
      socket.emit("RPG:SIGN_UP", { name: socket.data.session.username });
      socket.once("RPG:HANDLE_SIGN_UP", this.handlePlayerSignup.bind(this, socket));
    } else {
      const connectedPlayer = { ...DefaultPlayer, ...player };
      this.claire.db.players.update(socket, connectedPlayer, player.id);

      socket.emit("RPG:SIGN_IN", connectedPlayer);
      this.initializeConnectedPlayer(socket, player);
    }
  }

  handleSocketDisconnected = (socket: Socket) => {
    console.log(">> socket disconnected");
  };

  async handlePlayerClient(socket: Socket, playerId?: string) {
    const players = this.claire.db.players;

    if (playerId) {
      let player = await players.get(socket, playerId);
      if (!player) return;

      player = { ...DefaultPlayer, ...player };

      players.update(socket, player, player.id);
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
    if (!basePlayerInfo) return;
    if (!basePlayerInfo.id) return;

    const result = await this.claire.db.players.update(socket, basePlayerInfo, basePlayerInfo.id);
    if (result) {
      return basePlayerInfo;
    }
  }

  async initializeConnectedPlayer(socket: Socket, player: Player) {
    console.log(`${player.name} has connected`);
    this.claire.players.set(player.id, player);
    socket.on("RPG:REQUEST", this.claire.router.handleRequest.bind(this.claire.router, socket, player.id));

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
