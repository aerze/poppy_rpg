import React from "react";
import "./town.scss";
import { SocketContext } from "../context/socket";
import { Navigate } from "react-router-dom";
import { NetContext } from "../context/net";

export class Town extends React.Component {
  state = {
    players: [],
    positions: {},
  };

  componentDidMount() {
    this.socket = this.context.socket;
    this.socket.on("LOCAL", this.handleLocal);
    this.socket.emit("LOCAL", "town:mount", null, (state) => {
      this.setState(state);
    });
  }

  componentWillUnmount() {
    this.socket.off("LOCAL", this.handleLocal);
  }

  handleLocal = (systemName, data) => {
    if (systemName === "town") {
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
      <div className="simple-container column town main-background">
        <div className="hud-top-buffer"></div>
        <div className="town-players" onClick={this.handleMove}>
          {this.state.players.map((player) => {
            return (
              <TownPlayer
                key={player.id}
                assetUrl={player.assetUrl}
                position={this.state.positions[player.id] ?? [10, 200]}
              />
            );
          })}
        </div>
        <div className="hud-bottom-buffer"></div>
      </div>
    );
  }
}

function TownPlayer({ assetUrl, position }) {
  return (
    <img
      className="town-player"
      src={`/app/${assetUrl}`}
      style={{ transform: `translate(${position[0]}px, ${position[1]}px)` }}
    ></img>
  );
}

Town.contextType = NetContext;
