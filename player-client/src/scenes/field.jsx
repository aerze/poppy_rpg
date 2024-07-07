import { Component, useCallback, useContext, useState } from "react";
import "./field.scss";
import { SocketContext } from "../context/socket";

export class FieldScene extends Component {
  state = {
    screen: "DEV_MENU",
    battle: {},
  };

  renderDevMenu() {
    return (
      <>
        <button onClick={this.joinDungeon}>Join Dungeon</button>
        <button onClick={this.startBattle}>Start Battle</button>
        <button onClick={this.equipWeapon}>Equip Weapons</button>
        <button onClick={this.fullHeal}>Full Heal</button>
      </>
    );
  }

  joinDungeon = (event) => {
    event.preventDefault();
    this.context.socket.emit("RPG:DEV:JOIN_DUNGEON");
    this.context.socket.once("RPG:DEV:DUNGEON_JOINED", this.handleBattleJoined);
    this.context.socket.on("RPG:DEV:TURN_ACTIONS", this.handleTurnActions);
  };

  handleBattleJoined = ({ battle }) => {
    console.log(">> battle", battle);
    this.setState({ battle });
  };

  handleTurnActions = (actions) => {
    console.log(actions);
  };

  startBattle = (event) => {
    event.preventDefault();
    this.context.socket.emit("RPG:DEV:START_BATTLE");
  };

  equipWeapon = (event) => {
    event.preventDefault();
    this.context.socket.emit("RPG:DEV:EQUIP_WEAPON");
  };

  fullHeal = (event) => {
    event.preventDefault();
    this.context.socket.emit("RPG:DEV:FULL_HEAL");
  };

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
          <pre style={{ fontSize: "12px" }}>
            {w}x{h} r:{r}
          </pre>
          {this.state.battle?.turnOrder?.map((id) => {
            const combatant = this.state.battle.combatants[id];
            return (
              <div key={combatant.id} className="combantant">
                <pre>
                  {combatant.name}: {combatant.health}/{combatant.maxHealth}hp
                </pre>
              </div>
            );
          })}
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
