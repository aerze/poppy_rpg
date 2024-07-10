import { Component, createContext, useState } from "react";
import { io } from "socket.io-client";
import { local } from "../lib/local";

export const SocketContext = createContext(null);

/**
 * @readonly
 * @enum {number}
 */
export const DataType = {
  DUNGEON_LIST: 0,
  DUNGEON_INFO: 1,
  JOIN_DUNGEON: 2,
};

export class SocketProvider extends Component {
  state = {
    connected: false,
    newPlayer: null,
    player: local.get("player") ?? null,
    dungeons: [],
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

  /**
   * @param {DataType} dataType
   * @param {*} options
   * @param {*} callback
   */
  getData(dataType, options = null, callback) {
    this.socket.emit("RPG:GET_DATA", dataType, options, callback);
  }

  handleConnect = () => {
    console.log("handleConnect");
    const existingPlayerId = local.get("player")?.id;
    this.setState({ connected: true });
    this.socket.emit("RPG:CLIENT_CONNECT", existingPlayerId);
    this.socket.on("RPG:Error", this.handleError);
    this.socket.on("RPG:PLAYER_INFO_UPDATED", this.handlePlayerInfoUpdated);
    this.socket.once("RPG:SIGN_IN", this.handleSignIn);
    this.socket.once("RPG:SIGN_UP", this.handleSignUp);
  };

  handleError = ({ message, error }) => {
    console.error(message, error);
  };

  handlePlayerInfoUpdated = (playerInfo) => {
    this.setState(
      (state) => ({
        ...state,
        player: {
          ...state.player,
          ...playerInfo,
        },
      }),
      () => {
        console.log(">> setState callback", this.state);
        local.set("player", this.state.player);
      }
    );
  };

  handleDisconnect = () => {
    console.log(">> Client Disconnected");
    this.setState({ connected: false });
  };

  handleSignIn = (player) => {
    console.log(">> RPG:SIGN_IN");
    this.socket.off("RPG:SIGN_UP");
    this.setState({ player });
  };

  handleSignUp = () => {
    console.log(">> RPG:SIGN_UP");
    this.socket.off("RPG:SIGN_IN");
    this.socket.once("RPG:COMPLETED_SIGN_UP", this.handleCompletedSignUp);
    this.setState({ newPlayer: true });
  };

  handleCompletedSignUp = (player) => {
    console.log(">> RPG:COMPLETED_SIGN_UP");
    this.setState({ player, newPlayer: false });
    local.set("player", player);
  };

  render() {
    const value = {
      socket: this.socket,
      connected: this.state.connected,
      playerId: this.state.playerId,
      connect: this.connect,
      isNewPlayer: this.state.newPlayer,
      player: this.state.player,
      get: this.getData,
    };

    return <SocketContext.Provider value={value}>{this.props.children}</SocketContext.Provider>;
  }
}
