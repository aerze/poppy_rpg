import { Component } from "react";
import "./field.scss";
import { DataType, SocketContext } from "../context/socket";
import { TimerBar } from "../components/timer-bar";

const Phase = {
  0: "INIT",
  1: "START",
  2: "BATTLE",
  3: "END",
};

const PhaseTimers = {
  1: 30000,
  2: 8000,
  3: 30000,
};

const SCENE = {
  DUNGEON: 1,
  BATTLE: 2,
};

export class FieldScene extends Component {
  state = {
    scene: SCENE.DUNGEON,
  };

  componentDidMount() {
    console.log("FIELD: DID MOUNT");
    this.context.updateDungeonList();
    if (this.context.battle) {
      this.setState({ scene: SCENE.BATTLE });
    }
  }

  componentWillUnmount() {
    console.log("FIELD: WILL UNMOUNT");
  }

  renderDungeon() {
    return (
      <>
        <div className="battle-screen">{this.context.dungeonInfo && this.renderDungeonInfo()}</div>
        <div className="battle-controls">
          <div className="dungeon-list">
            {this.context.dungeons.map((dungeon) => {
              return (
                <div
                  key={dungeon.id}
                  className="dungeon-item"
                  onClick={(event) => this.context.getDungeonInfo(dungeon.id)}
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
          <div className="dungeon-title">{this.context.dungeonInfo?.name} Dungeon</div>
          <div className="dungeon-count">{this.context.dungeonInfo?.playerCount} Players</div>
        </div>
        <div
          className="join-dungeon"
          onClick={() => {
            this.context.joinDungeon();
          }}
        >
          JOIN
        </div>
      </div>
    );
  }

  renderBattle() {
    return (
      <>
        <div className="battle-screen">{this.context.battle && this.renderBattlefield()}</div>
        <div className="battle-controls">
          <div>{Phase[this.context.battle.phase]}</div>
          <div className="turn-indicator">
            <TimerBar
              className="turn-progress"
              max={PhaseTimers[this.context.battle.phase]}
              endAt={this.context.timer}
            />
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
        {this.context.battle.turnOrder.map((combatantId) => {
          const combatant = this.context.battle.combatants[combatantId];
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
    return <div className="field-scene">{!this.context.battle ? this.renderDungeon() : this.renderBattle()}</div>;
  }
}

FieldScene.contextType = SocketContext;
