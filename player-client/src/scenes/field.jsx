import { Component, useCallback, useContext, useState } from "react";
import "./field.scss";
import { DataType, SocketContext } from "../context/socket";

export class FieldScene extends Component {
  state = {
    screen: "DUNGEON",
    dungeons: [],
    dungeonInfo: undefined,
    battle: undefined,
  };

  componentDidMount() {
    this.updateDungeonList();
  }

  componentWillUnmount() {}

  updateDungeonList = () => {
    this.context.send(DataType.DUNGEON_LIST, null, (dungeons) => {
      this.setState({ dungeons });
    });
  };

  getDungeonInfo = (event, dungeonId) => {
    event.preventDefault();
    this.context.send(DataType.DUNGEON_INFO, { dungeonId }, (dungeonInfo) => {
      this.setState({ dungeonInfo });
    });
  };

  joinDungeon = (event) => {
    event.preventDefault();
    const dungeonId = this.state.dungeonInfo.id;
    if (dungeonId === undefined) return;

    console.log(">> JOINING DUNGEON");
    this.context.socket.on("RPG:BATTLE", this.handleBattleUpdate);
    this.context.send(DataType.JOIN_DUNGEON, { dungeonId });
  };

  handleBattleUpdate = ({ battle }) => {
    console.log(">> battle update", battle);
    this.setState((state) => {
      return { battle: { ...state.battle, ...battle }, screen: "BATTLE" };
    });
  };

  renderDungeon() {
    return (
      <>
        <div className="battle-screen">{this.state.dungeonInfo && this.renderDungeonInfo()}</div>
        <div className="battle-controls">
          <div className="dungeon-list">
            {this.state.dungeons.map((dungeon) => {
              return (
                <div
                  key={dungeon.id}
                  className="dungeon-item"
                  onClick={(event) => this.getDungeonInfo(event, dungeon.id)}
                >
                  {dungeon.type === 1 && <div className="dungeon-tag">LIMITED TIME EVENT</div>}
                  {dungeon.type === 2 && <div className="dungeon-tag">SPECIAL EVENT</div>}
                  <div className="dungeon-title">{dungeon.name} Dungeon</div>
                </div>
              );
            })}
          </div>
        </div>
      </>
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
        <div className="battle-screen">{this.state.battle && this.renderBattlefield()}</div>
        <div className="battle-controls">
          <div className="turn-indicator">
            <progress className="turn-progress" max={100} value={30} />
          </div>
          <div className="battle-button-group">
            <button className="battle-button" onClick={this.handleAttackClick}>
              Attack
            </button>
            <button className="battle-button" onClick={this.handleDefendClick}>
              Defend
            </button>
            <button className="battle-button">Ability 1</button>
            <button className="battle-button">Ability 2</button>
            <button className="battle-button">Ability 3</button>
            <button className="battle-button">Ability 4</button>
            <button className="battle-button">Item</button>
          </div>
        </div>
      </>
    );
  }

  handleAttackClick = () => {
    this.context.send(DataType.BATTLE_SET_ACTION, { action: 0 });
  };

  handleDefendClick = () => {
    this.context.send(DataType.BATTLE_SET_ACTION, { action: 1 });
  };

  teamClasses = {
    0: "team-red",
    1: "team-blue",
  };

  renderBattlefield() {
    return (
      <div className="battlefield">
        {this.state.battle.turnOrder.map((combatantId) => {
          const combatant = this.state.battle.combatants[combatantId];
          return (
            <div key={combatant.id} className={`combatant ${this.teamClasses[combatant.teamFlag]}`}>
              {combatant.name}
              <br />
              <div className="health">
                {combatant.health}/{combatant.maxHealth}hp
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <div className="field-scene">
        {this.state.screen === "DUNGEON" && this.renderDungeon()}
        {this.state.screen === "BATTLE" && this.renderBattle()}
      </div>
    );
  }
}

FieldScene.contextType = SocketContext;
