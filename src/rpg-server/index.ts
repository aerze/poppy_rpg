import { Socket } from "socket.io";
import { PlayerCollection } from "./player-collection";
import { BasePlayerInfo } from "./player";

export async function registerPlayerClient(socket: Socket, playerId?: string) {
  if (playerId) {
    const player = await PlayerCollection.get(socket, playerId);
    if (!player) {
      return;
    }

    socket.emit("RPG:SIGN_IN", player);
    console.log(">> binding event");
    initializeConnectedPlayer(socket);
  } else {
    // respond to the client that it needs to create new character
    socket.emit("RPG:SIGN_UP");
    socket.once("RPG:HANDLE_SIGN_UP", handlePlayerSignup.bind(null, socket));
  }
}

export async function handlePlayerSignup(socket: Socket, basePlayerInfo: BasePlayerInfo) {
  const player = await PlayerCollection.create(socket, basePlayerInfo);

  if (!player) {
    return null;
  }

  socket.emit("RPG:COMPLETED_SIGN_UP", player);
  initializeConnectedPlayer(socket);
}

export async function handlePlayerUpdate(socket: Socket, basePlayerInfo: BasePlayerInfo & { id: string }) {
  console.log(">> handlePlayerUpdate", basePlayerInfo);
  if (!basePlayerInfo.id) return;
  if (!basePlayerInfo) return;

  if (await PlayerCollection.update(socket, basePlayerInfo, basePlayerInfo.id)) {
    socket.emit("RPG:PLAYER_INFO_UPDATED", basePlayerInfo);
  }
}

export async function initializeConnectedPlayer(socket: Socket) {
  socket.on("RPG:UPDATE_PLAYER_INFO", handlePlayerUpdate.bind(null, socket));
  socket.on("RPG:DEV:START_BATTLE", () => {});
}
