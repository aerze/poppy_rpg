import { Socket } from "socket.io";

export function registerPlayerClient(socket: Socket, playerId?: string) {
  if (playerId) {
    // fetch data from the server
    const playerData = {};
    socket.emit("RPG:SIGN_IN", playerData);
  } else {
    // respond to the client that it needs to create new character
    socket.emit("RPG:SIGN_UP");
  }
}
