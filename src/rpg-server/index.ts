import { Socket } from "socket.io";
import { PlayerCollection } from "./player-collection";
import { BasePlayerInfo, Player, DefaultPlayer } from "./player";
import { Dungeon } from "./behavior/dungeon";

function debug(socket: Socket, message: string) {
  socket.emit("RPG:ALERT", message);
}

const dungeon = new Dungeon();
dungeon.spawnMonsters();

export async function registerPlayerClient(socket: Socket, playerId?: string) {
  if (playerId) {
    let player = await PlayerCollection.get(socket, playerId);
    if (!player) {
      return;
    }

    player = { ...DefaultPlayer, ...player };
    const playerNoId: any = { ...player };
    delete playerNoId._id;
    delete playerNoId.id;
    PlayerCollection.update(socket, playerNoId, player.id);

    socket.emit("RPG:SIGN_IN", player);

    initializeConnectedPlayer(socket, player);
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
  initializeConnectedPlayer(socket, player);
}

export async function handlePlayerUpdate(socket: Socket, basePlayerInfo: BasePlayerInfo & { id: string }) {
  console.log(">> handlePlayerUpdate", basePlayerInfo);
  if (!basePlayerInfo.id) return;
  if (!basePlayerInfo) return;

  if (await PlayerCollection.update(socket, basePlayerInfo, basePlayerInfo.id)) {
    socket.emit("RPG:PLAYER_INFO_UPDATED", basePlayerInfo);
  }
}

export async function initializeConnectedPlayer(socket: Socket, player: Player) {
  socket.on("RPG:UPDATE_PLAYER_INFO", handlePlayerUpdate.bind(null, socket));
  debug(socket, `Initializing Connection for ${player.id}`);

  socket.on("Disconnect", () => {
    dungeon.leave(socket, player);
  });

  socket.on("RPG:DEV:JOIN_DUNGEON", () => {
    if (dungeon.join(socket, player)) {
      socket.emit("RPG:DEV:DUNGEON_JOINED", { battle: dungeon.battle });
    }
  });

  socket.on("RPG:DEV:START_BATTLE", () => {
    dungeon.battle.start();
  });
}
