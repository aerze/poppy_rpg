import React from "react";
import "./town.scss";
import { SocketContext } from "../context/socket";
import { Navigate } from "react-router-dom";

export class Town extends React.Component {
  render() {
    if (this.context.isNewPlayer) {
      return <Navigate to="/app/🐸/🤔" replace={true} />;
    }

    return (
      <div className="simple-container column-reverse town">
        <div className="hud-bottom-buffer"></div>
        {/* <div className="main-actions row">
        <div className="left-action">Character</div>
        <div className="main-action">FIGHT!</div>
        <div className="right-action">Shops</div>
      </div> */}
        <div className="town-players">
          {this.context.town?.players.map((player) => {
            return <TownPlayer key={player.id} player={player} />;
          })}
        </div>
      </div>
    );
  }
}

function TownPlayer({ player }) {
  return <img className="town-player" src={`/app/${player.assetUrl}`}></img>;
}

Town.contextType = SocketContext;
