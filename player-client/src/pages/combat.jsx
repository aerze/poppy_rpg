import React from "react";
import "./combat.scss";
import { Navigate } from "react-router-dom";
import { NetContext } from "../context/net";

export class Combat extends React.Component {
  state = {};

  componentDidMount() {
    this.socket = this.context.socket;
    this.socket.on("LOCAL", this.handleLocal);
    // this.socket.emit("LOCAL", "town:mount", null, (state) => {
    //   this.setState(state);
    // });
  }

  componentWillUnmount() {
    this.socket.off("LOCAL", this.handleLocal);
  }

  handleLocal = (systemName, data) => {
    if (systemName === "combat") {
      this.setState(data);
    }
  };

  handleMove = (event) => {
    const offset = event.target.getBoundingClientRect();
    const position = [event.clientX - offset.x, event.clientY - offset.y];
    this.context.send("town:move", { position });
  };

  render() {
    if (this.context.isNewPlayer) {
      return <Navigate to="/app/🐸/🤔" replace={true} />;
    }

    return (
      <div className="simple-container column combat main-background">
        <div className="hud-top-buffer"></div>
        <div className="dev-container">
          <pre>{JSON.stringify(this.state, null, 2)}</pre>
          <pre>{JSON.stringify(this.context.player, null, 2)}</pre>
        </div>
        <div className="hud-bottom-buffer"></div>
      </div>
    );
  }
}

Combat.contextType = NetContext;
