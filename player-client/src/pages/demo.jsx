import React from "react";
import "./town.scss";
import { SocketContext } from "../context/socket";
import { Navigate } from "react-router-dom";
import { NetContext } from "../context/net";

export class Demo extends React.Component {
  socket = null;

  componentDidMount() {
    this.socket = this.context.socket;
    this.socket.on("LOCAL", this.handleLocal);
  }

  componentWillUnmount() {
    this.socket.off("LOCAL", this.handleLocal);
  }

  handleLocal = (...args) => {
    console.log("LOCAL", ...args);
  };

  handleMove = () => {
    this.socket.emit("LOCAL", "join", this.context.player.id);
  };

  render() {
    if (this.context.isNewPlayer) {
      return <Navigate to="/app/🐸/🤔" replace={true} />;
    }

    return (
      <div className="simple-container column">
        <div className="hud-top-buffer" />
        <h1>Demo</h1>
        <button onClick={this.handleMove}>move</button>
      </div>
    );
  }
}

Demo.contextType = NetContext;
