import { Component, useCallback, useContext, useState } from "react";
import "./field.scss";
import { DataType, SocketContext } from "../context/socket";

export class FieldScene extends Component {
  state = {
    screen: "DUNGEON",
    battle: {},
    dungeons: [],
    dungeonInfo: null,
  };

  componentDidMount() {
    this.updateDungeonList();
  }

  componentWillUnmount() {
    this.context.socket.off("RPG:DUNGEON:LIST", this.handleDungeonList);
  }

  updateDungeonList = () => {
    this.context.get(DataType.DUNGEON_LIST, null, (dungeons) => {
      this.setState({ dungeons });
    });
  };

  handleDungeonList = (dungeons) => {
    this.setState(dungeons);
  };

  renderDevMenu() {
    return (
      <>
        <button onClick={this.getDungeonInfo}>Join Dungeon</button>
        <button onClick={this.startBattle}>Start Battle</button>
        <button onClick={this.equipWeapon}>Equip Weapons</button>
        <button onClick={this.fullHeal}>Full Heal</button>
      </>
    );
  }

  getDungeonInfo = (event, dungeonId) => {
    event.preventDefault();
    this.context.get(DataType.DUNGEON_INFO, { dungeonId }, (dungeonInfo) => {
      this.setState({ dungeonInfo });
    });
    // this.context.socket.emit("RPG:DEV:JOIN_DUNGEON");
    // this.context.socket.once("RPG:DEV:DUNGEON_JOINED", this.handleBattleJoined);
    // this.context.socket.on("RPG:DEV:TURN_DATA", this.handleTurnData);
  };

  handleBattleJoined = ({ battle }) => {
    console.log(">> battle", battle);
    this.setState({ battle });
  };

  handleTurnData = ({ turn, actions }) => {
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

  joinDungeon = (event) => {
    event.preventDefault();
    const dungeonId = this.state.dungeonInfo.id;

    console.log(">> JOIN DUNGEON", dungeonId);
    if (dungeonId === undefined) return;

    console.log(">> JOIN DUNGEON");
    this.context.get(DataType.JOIN_DUNGEON, { dungeonId }, (result) => {
      console.log(">> JOIN DUNGEON:", result);
      this.setState({ screen: "BATTLE" });
    });
  };

  renderDungeons() {
    return (
      <div className="dungeon-list">
        {this.state.dungeons.map((dungeon) => {
          return (
            <div key={dungeon.id} className="dungeon-item" onClick={(event) => this.getDungeonInfo(event, dungeon.id)}>
              {dungeon.type === 1 && <div className="dungeon-tag">LIMITED TIME EVENT</div>}
              {dungeon.type === 2 && <div className="dungeon-tag">SPECIAL EVENT</div>}
              <div className="dungeon-title">{dungeon.name} Dungeon</div>
            </div>
          );
        })}
      </div>
    );
  }

  renderDungeonInfo() {
    return (
      <div className="dungeon-info-container">
        <div className="dungeon-info">
          <div className="dungeon-title">{this.state.dungeonInfo?.name} Dungeon</div>
          <div className="dungeon-count">{this.state.dungeonInfo?.playerCount} Players</div>
        </div>
        <div className="join-dungeon" onClick={this.joinDungeon}>
          JOIN
        </div>
      </div>
    );
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
          <button className="battle-button">Ability 1</button>
          <button className="battle-button">Ability 2</button>
          <button className="battle-button">Ability 3</button>
          <button className="battle-button">Ability 4</button>
          <button className="battle-button">Item</button>
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
          {this.state.screen === "DUNGEON" && this.state.dungeonInfo && this.renderDungeonInfo()}
          {/* <pre style={{ fontSize: "12px" }}>
            {w}x{h} r:{r}
          </pre> */}
          {/* {this.state.battle?.turnOrder?.map((id) => {
            const combatant = this.state.battle.combatants[id];
            return (
              <div key={combatant.id} className="combantant">
                <pre>
                  {combatant.name}: {combatant.health}/{combatant.maxHealth}hp
                </pre>
              </div>
            );
          })} */}
        </div>
        <div className="battle-controls">
          {this.state.screen === "DUNGEON" && this.renderDungeons()}
          {this.state.screen === "DEV_MENU" && this.renderDevMenu()}
          {this.state.screen === "BATTLE" && this.renderBattle()}
        </div>
      </div>
    );
  }
}

FieldScene.contextType = SocketContext;
