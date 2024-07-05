import { Component, useCallback, useContext, useState } from "react";
import "./field.scss";
import { SocketContext } from "../context/socket";

export class FieldScene extends Component {
  state = {
    screen: "DEV_MENU",
  };

  renderDevMenu() {
    return (
      <>
        <button>Start Battle</button>
        <button>Go to Dungeon</button>
        <button>Equip Weapons</button>
        <button>Full Heal</button>
      </>
    );
  }

  startBattle(event) {
    event.preventDefault();
    this.context.socket.emit("RPG:DEV:START_BATTLE");
  }

  goToDungeon(event) {
    event.preventDefault();
    this.context.socket.emit("RPG:DEV:GO_TO_DUNGEON");
  }

  equipWeapon(event) {
    event.preventDefault();
    this.context.socket.emit("RPG:DEV:EQUIP_WEAPON");
  }

  fullHeal(event) {
    event.preventDefault();
    this.context.socket.emit("RPG:DEV:FULL_HEAL");
  }

  renderBattle() {
    return (
      <>
        <div className="turn-indicator">
          <progress className="turn-progress" max={100} value={30} />
        </div>
        <div className="battle-button-group">
          <button className="battle-button">Attack</button>
          <button className="battle-button">Defend</button>
          <button className="battle-button">Heal</button>
          <button className="battle-button">Revive</button>
        </div>
      </>
    );
  }

  render() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const r = window.devicePixelRatio;

    return (
      <div className="field-scene">
        <div className="battle-screen">
          <pre>
            {w}x{h} r:{r}
          </pre>
        </div>
        <div className="battle-controls">
          {this.state.screen === "DEV_MENU" && this.renderDevMenu()}
          {this.state.screen === "BATTLE" && this.renderBattle()}
        </div>
      </div>
    );
  }
}

FieldScene.contextType = SocketContext;
