import { Component, createContext, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export class SocketProvider extends Component {
  state = {
    connected: false,
    playerId: null,
    newPlayer: null,
    player: null,
  };

  socket = null;

  connect = () => {
    console.log(">> connect");
    if (!this.socket) {
      this.socket = io("localhost:3000");
      this.socket.on("connect", this.handleConnect);
      this.socket.on("disconnect", this.handleDisconnect);
    } else {
      this.socket.connect();
    }
  };

  handleConnect = () => {
    console.log("handleConnect");
    const existingPlayerId = localStorage.getItem("playerId");
    this.setState({ connected: true, playerId: existingPlayerId });
    this.socket.emit("RPG:CLIENT_CONNECT", existingPlayerId);
    this.socket.once("RPG:SIGN_IN", this.handleSignIn);
    this.socket.once("RPG:SIGN_UP", this.handleSignUp);
  };

  handleDisconnect = () => {
    console.log(">> Client Disconnected");
    this.setState({ connected: false });
  };

  handleSignIn = (playerData) => {
    console.log(">> RPG:SIGN_IN");
    this.socket.off("RPG:SIGN_UP");
    this.setState({ player: playerData });
  };

  handleSignUp = () => {
    console.log(">> RPG:SIGN_UP");
    this.socket.off("RPG:SIGN_IN");
    this.setState({ newPlayer: true });
  };

  render() {
    const value = {
      socket: this.socket,
      connected: this.state.connected,
      playerId: this.state.playerId,
      connect: this.connect,
    };

    return <SocketContext.Provider value={value}>{this.props.children}</SocketContext.Provider>;
  }
}
