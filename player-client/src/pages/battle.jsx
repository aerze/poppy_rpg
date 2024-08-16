import React, { useContext } from "react";
import "./battle.scss";
import { DataType, SocketContext } from "../context/socket";
import { Navigate } from "react-router-dom";
import { TimerBar } from "../components/timer-bar";
import { Battle as OldBattle } from "../scenes/field/battle";

export const Phase = {
  0: "INIT",
  1: "START",
  2: "BATTLE",
  3: "END",
};

export class Battle extends React.Component {
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
    if (!this.context.battle) {
      return <Navigate to="/app/🐸/✨" replace={true} />;
    }

    return (
      <div className="simple-container column battle">
        <div className="hud-top-buffer"></div>
        <OldBattle />
        <div className="battle-info">
          {Phase[this.context.battle.phase]}
          <TimerBar
            className="turn-progress"
            max={this.context.battle.countdownDuration}
            endAt={this.context.battle.countdownTarget}
          />
        </div>
        <div className="battle-controls">
          <div className="battle-button button-leave" onClick={this.handleLeaveDungeon}>
            Run Away
          </div>
          <div className="battle-button button-assist" onClick={this.handleAssistClick}>
            Lurk Mode {this.state.assist ? "ON" : "OFF"}
          </div>
          <div className="battle-button-group">
            <div className="battle-button button-attack" onClick={this.handleAttackClick}>
              Attack
            </div>
            <div className="battle-button button-defend" onClick={this.handleDefendClick}>
              Defend
            </div>
          </div>
        </div>
        <div className="hud-bottom-buffer"></div>
      </div>
    );
  }
}

function BattleScreen() {
  return <div className="battle-screen"></div>;
}

Battle.contextType = SocketContext;
