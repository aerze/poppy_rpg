import { Socket } from "socket.io";
import { BaseManager } from "./base-manager";
import { Claire } from "./claire";
import { parseCookies } from "../../rpg-server/lib/helpers";
import { getSession } from "../../server/auth";
import { PlayerClientManager } from "./client";

export class ClientManager extends BaseManager {
  players: PlayerClientManager;

  constructor(claire: Claire) {
    super(claire);
    this.players = new PlayerClientManager(claire);
    claire.io.on("connection", this.handleSocketConnection.bind(this));
  }

  /** move to env vars */
  debugSession = {
    userid: "59227136",
    username: "abby_the_lesbiab",
  };

  async handleSocketConnection(socket: Socket) {
    const cookies = parseCookies(socket.request.headers.cookie);
    const sessionid = cookies?.["oauth-session"];
    let session = getSession(sessionid);

    const sessionIsMissing = !session;
    const socketIsOverlay = socket.request.headers.referer?.includes(`/overlay/`);
    const socketIsLocalDevClient = socket.request.headers.origin === "http://localhost:3001";
    // const socketIsLocalDevAdmin = socket.request.headers.referer === "http://localhost:3000/admin/";

    if (socketIsOverlay) {
      this.handleOverlayClient(socket);
      return;
    }

    if (sessionIsMissing) {
      if (socketIsLocalDevClient) {
        session = this.debugSession;
      } else {
        this.error(`Socket is missing session cookie`);
        socket.disconnect();
        return;
      }
    }

    socket.data.session = session;

    this.handlePlayerClient(socket);
  }

  async handlePlayerClient(socket: Socket) {
    const player = await this.claire.db.players.getByTwitchId(socket.data.session.userid);
    if (player === null) {
      this.players.signUp(socket);
    } else {
      this.players.signIn(socket, player);
    }
  }

  handleOverlayClient(socket: Socket) {}
}
