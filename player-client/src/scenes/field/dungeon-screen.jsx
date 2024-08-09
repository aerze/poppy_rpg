import React from "react";
import { DataType, SocketContext } from "../../context/socket";
import { TimerBar } from "../../components/timer-bar";
import { Battle } from "./battle";

function formalUrl(url) {
  return `app/${url}`;
}

export const Phase = {
  0: "INIT",
  1: "START",
  2: "BATTLE",
  3: "END",
};

export const TeamClasses = {
  0: "team-red",
  1: "team-blue",
};

export class DungeonScreen extends React.Component {
  state = {
    action: -1,
    assist: false,
  };

  handleAttackClick = () => {
    this.context.send(DataType.BATTLE_SET_ACTION, { action: 0 }, () => {
      this.setState({ action: 0 });
    });
  };

  handleDefendClick = () => {
    this.context.send(DataType.BATTLE_SET_ACTION, { action: 1 }, () => {
      this.setState({ action: 1 });
    });
  };

  handleAssistClick = () => {
    this.context.send(DataType.BATTLE_SET_ASSIST, { assist: !this.state.assist }, () => {
      this.setState({ assist: !this.state.assist });
    });
  };

  handleLeaveDungeon = () => {
    this.context.leaveDungeon();
  };

  render() {
    if (!this.context.battle) return "not in a battle yet";
    const playerId = this.context.player.id;
    return (
      <>
        <div className="battle-screen">
          <Battle />
        </div>
        <div className="battle-controls">
          <div>{Phase[this.context.battle.phase]}</div>
          <div className="turn-indicator">
            <TimerBar
              className="turn-progress"
              max={this.context.battle.countdownDuration}
              endAt={this.context.battle.countdownTarget}
            />
          </div>
          <div> Action set to {this.state.action} </div>
          <div className="battle-button-group">
            <button className="battle-button" onClick={this.handleAttackClick}>
              Attack
            </button>
            <button className="battle-button" onClick={this.handleDefendClick}>
              Defend
            </button>
            <button className="battle-button" onClick={this.handleAssistClick}>
              {this.state.assist ? "Rejoin" : "Assist"}
            </button>
            {/* <button className="battle-button">Ability 1</button>
            <button className="battle-button">Ability 2</button>
            <button className="battle-button">Ability 3</button>
            <button className="battle-button">Ability 4</button>
            <button className="battle-button">Item</button> */}
            <button className="battle-leave" onClick={this.handleLeaveDungeon}>
              Leave
            </button>
          </div>
        </div>
      </>
    );
  }
}

DungeonScreen.contextType = SocketContext;
