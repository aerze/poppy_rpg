import { Component, createContext } from "react";
import { redirect } from "react-router-dom";
import { io } from "socket.io-client";

export const NetContext = createContext(null);

export class NetProvider extends Component {
  state = {
    connected: false,
    newPlayer: null,
    player: null,
    instance: null,
    loading: false,
  };

  socket = null;

  connect = () => {
    console.log(">> connect");
    if (!this.socket) {
      if (process.env.NODE_ENV === "development") {
        this.socket = io("http://localhost:3000/", { autoConnect: false });
      } else {
        this.socket = io({ autoConnect: false });
      }

      window.socket = this.socket;
      this.socket.on("connect", this.handleConnect);
      this.socket.on("disconnect", this.handleDisconnect);
    }

    this.socket.connect();
  };

  handleConnect = () => {
    console.log("handleConnect");
    this.setState({ connected: true });
    this.socket.on("RPG", this.handleGlobalUpdate);
    this.socket.once("RPG:SIGN_IN", this.handleSignIn);
    this.socket.once("RPG:SIGN_UP", this.handleSignUp);
  };

  handleGlobalUpdate = (state) => {
    this.setState(state);
  };

  handleDisconnect = () => {
    console.log(">> Client Disconnected");
    redirect("/app");
    this.setState({ connected: false });
  };

  handleSignIn = ({ player }) => {
    // console.log(">> RPG:SIGN_IN", player);
    this.socket.off("RPG:SIGN_UP");
    this.setState({ player });
  };

  handleSignUp = ({ name }) => {
    console.log(">> RPG:SIGN_UP");
    this.socket.off("RPG:SIGN_IN");
    this.socket.once("RPG:COMPLETED_SIGN_UP", this.handleCompletedSignUp);
    this.setState({ newPlayer: true, player: { name, presetId: 0 } });
  };

  handleCompletedSignUp = (player) => {
    console.log(">> RPG:COMPLETED_SIGN_UP");
    this.setState({ player, newPlayer: false });
  };

  send(event, data, callback) {
    this.socket.emit("LOCAL", event, data, callback);
  }

  sendGlobal(event, data, callback) {
    this.socket.emit("RPG", event, data, callback);
  }

  render() {
    const value = {
      ...this.state,

      socket: this.socket,
      connect: this.connect,
      send: this.send,
      sendGlobal: this.sendGlobal,
    };

    return <NetContext.Provider value={value}>{this.props.children}</NetContext.Provider>;
  }
}
