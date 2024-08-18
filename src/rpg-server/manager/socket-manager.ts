import { Socket } from "socket.io";
import { Claire } from "../claire";
import { BaseManager } from "./base-manager";
import { BasePlayerInfo, DefaultPlayer, Player, PlayerPresetToUrl } from "../data/player";
import { getSession } from "../../server/auth";
import { parseCookies } from "../lib/helpers";
import { DungeonType } from "../data/types/dungeon-types";
import { SafeCounter } from "../../shared/safe-counter";

export class SocketManager extends BaseManager {
  overlayCounter: SafeCounter;

  constructor(claire: Claire) {
    super(claire);
    claire.io.on("connection", this.handleSocketConnected);
    this.overlayCounter = new SafeCounter();
  }

  debugSession = {
    userid: "59227136",
    username: "abby_the_lesbiab",
  };

  handleSocketConnected = async (socket: Socket) => {
    const cookies = parseCookies(socket.request.headers.cookie);
    const sessionid = cookies?.["oauth-session"];
    let session = getSession(sessionid);

    const sessionIsMissing = !session;
    const socketIsOverlay = socket.request.headers.referer?.includes(`/overlay/`);
    const socketIsLocalDevClient = socket.request.headers.origin === "http://localhost:3001";
    const socketIsLocalDevAdmin = socket.request.headers.referer === "http://localhost:3000/admin/";

    if (socketIsOverlay) {
      this.initializeOverlay(socket);
      return;
    }

    if (sessionIsMissing) {
      if (socketIsLocalDevAdmin) {
        this.log(`Admin Connected`);
        socket.on("ADMIN", this.handleAdmin.bind(null, socket));
        socket.on("disconnect", this.handleSocketDisconnected.bind(null, undefined));
        return;
      }

      if (socketIsLocalDevClient) {
        session = this.debugSession;
      } else {
        this.error(`Socket missing session cookie`);
        socket.disconnect();
        return;
      }
    }

    socket.data.session = session;

    await this.populateSocketPlayer(socket);
  };

  async populateSocketPlayer(socket: Socket) {
    const player = await this.claire.db.players.getByTwitchId(socket);

    const playerDoesNotExist = player === null;

    if (playerDoesNotExist) {
      socket.emit("RPG:SIGN_UP", { name: socket.data.session.username });
      socket.once("RPG:HANDLE_SIGN_UP", this.handlePlayerSignup.bind(this, socket));
    } else {
      const connectedPlayer = { ...DefaultPlayer, ...player };
      this.claire.db.players.update(player.id, connectedPlayer, socket);

      socket.emit("RPG:SIGN_IN", { ...player, assetUrl: PlayerPresetToUrl[player.presetId] });
      this.initializeConnectedPlayer(socket, player);
    }
  }

  async handlePlayerSignup(socket: Socket, basePlayerInfo: BasePlayerInfo) {
    const player = await this.claire.db.players.create(socket, basePlayerInfo);

    if (!player) {
      this.error("Failed to create player with", basePlayerInfo);
      return null;
    }

    socket.emit("RPG:COMPLETED_SIGN_UP", { ...player, assetUrl: PlayerPresetToUrl[player.presetId] });
    this.initializeConnectedPlayer(socket, player);
  }

  async initializeConnectedPlayer(socket: Socket, player: Player) {
    this.log(`${player.name} has connected.`);
    this.claire.players.add(player.id, player, socket);
    socket.on(
      "RPG:REQUEST",
      this.claire.router.handleRequest.bind(this.claire.router, socket, player.id, player.roles)
    );
    socket.on("disconnect", this.handleSocketDisconnected.bind(null, player));
  }

  handleSocketDisconnected = (player?: Player) => {
    if (player) {
      this.claire.players.remove(player.id);
      this.log(`${player.name} has disconnected.`);
    }
  };

  handleAdmin = (socket: Socket) => {
    socket.emit("ADMIN:CONNECTED");
    socket.on("ADMIN:create-dungeon", (dungeonType: DungeonType) => {
      const verifiedDungeonType = this.claire.dungeons.dungeonTypes.find((d) => d.id === dungeonType.id);
      if (!verifiedDungeonType) {
        this.log(`invalid dungeonType.id ${dungeonType.id}`);
        // TODO: respond to socket with invalid data error;
        return;
      }
      this.claire.dungeons.createInstance(verifiedDungeonType);
    });
    this.log("admin has connected");
  };

  async handlePlayerUpdate(socket: Socket, basePlayerInfo: BasePlayerInfo & { id: string }) {
    if (!basePlayerInfo) return;
    if (!basePlayerInfo.id) return;
    this.debug(`updating player info`);

    const result = await this.claire.db.players.update(basePlayerInfo.id, basePlayerInfo, socket);
    if (result) {
      return basePlayerInfo;
    }
  }

  overlayMap = new Map<number, Socket>();

  async initializeOverlay(socket: Socket) {
    const overlayId = this.overlayCounter.next();
    this.log(`Overlay ${overlayId} Connected`);
    this.overlayMap.set(overlayId, socket);

    const dungeon = this.claire.dungeons.singletons.get("LIVE");
    if (dungeon) {
      dungeon.connectOverlay(overlayId, socket);
    }

    socket.on("OVERLAY", this.handleOverlay.bind(null, socket, overlayId));
    socket.on("disconnected", this.handleOverlayDisconnected.bind(null, socket, overlayId));
  }

  async handleOverlay(socket: Socket, overlayId: number, command: string, data: any) {
    this.log(`Overlay ${overlayId}: ${command}`, data);
  }

  async handleOverlayDisconnected(socket: Socket, overlayId: number) {
    this.log(`Overlay ${overlayId} Disconnected`);
  }
}
