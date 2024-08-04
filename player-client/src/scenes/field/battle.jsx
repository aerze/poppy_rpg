import React from "react";
import { DataType, SocketContext } from "../../context/socket";

const HIGHLIGHT = "rgb(0, 255, 162)";
const NORMAL = "rgb(131, 131, 131)";
const HIGHLIGHT_SIZE = "2px";
const NORMAL_SIZE = "1px";

export class Battle extends React.Component {
  state = {
    targetId: null,
  };

  handleTargetClick = (targetId) => {
    this.context.send(DataType.BATTLE_SET_TARGET, { targetId }, (result) => {
      if (result) {
        this.setState({ targetId });
      }
    });
  };

  render() {
    if (!this.context.battle) return null;
    return (
      <div className="battlefield">
        {this.renderPlayer()}
        <div className="players-list">{this.renderPlayers()}</div>
        <div className="enemies-list">{this.renderEnemies()}</div>
      </div>
    );
  }

  renderPlayer() {
    const playerId = this.context.player.id;
    const player = this.context.battle.players[playerId];
    const isTarget = this.state.targetId === playerId;
    return (
      <div
        className="player-self-container"
        onClick={() => {
          this.handleTargetClick(player.id);
        }}
        style={{
          borderColor: isTarget ? HIGHLIGHT : NORMAL,
          borderWidth: isTarget ? HIGHLIGHT_SIZE : NORMAL_SIZE,
        }}
      >
        <div
          className="player-image"
          style={{
            width: "100px",
            height: "100px",
            backgroundImage: `url('app/${player.assetUrl}')`,
            backgroundSize: "contain",
          }}
        ></div>
        <div className="player-name">{player.name}</div>
        <progress className="health-bar" value={player.health} max={player.maxHealth}></progress>
        <progress className="mana-bar" value={player.mana} max={player.maxMana}></progress>
      </div>
    );
  }

  renderPlayers() {
    const playerId = this.context.player.id;
    const players = Object.values(this.context.battle?.players ?? {});
    // const player = this.context.battle.players[playerId];
    // const players = [
    //   player,
    //   player,
    //   player,
    //   player,
    //   player,
    //   player,
    //   player,
    //   player,
    //   player,
    //   player,
    //   player,
    //   player,
    //   player,
    //   player,
    // ];
    return players.map((player) => {
      if (player.id === playerId) return null;
      const isTarget = this.state.targetId === player.id;
      return (
        <div
          key={player.id}
          className="player-container"
          onClick={() => {
            this.handleTargetClick(player.id);
          }}
          style={{
            borderColor: isTarget ? HIGHLIGHT : NORMAL,
            borderWidth: isTarget ? HIGHLIGHT_SIZE : NORMAL_SIZE,
          }}
        >
          <div
            className="player-image"
            style={{
              width: "65px",
              height: "65px",
              backgroundImage: `url('app/${player.assetUrl}')`,
              backgroundSize: "contain",
            }}
          ></div>
          <div className="player-name">{player.name}</div>
          <progress className="health-bar" value={player.health} max={player.maxHealth}></progress>
          <progress className="mana-bar" value={player.mana} max={player.maxMana}></progress>
        </div>
      );
    });
  }

  renderEnemies() {
    const enemies = Object.values(this.context.battle?.enemies ?? {});
    return enemies.map((enemy) => {
      const isTarget = this.state.targetId === enemy.id;
      return (
        <div
          key={enemy.id}
          className="enemy-container"
          onClick={() => {
            this.handleTargetClick(enemy.id);
          }}
          style={{
            borderColor: isTarget ? HIGHLIGHT : NORMAL,
            borderWidth: isTarget ? HIGHLIGHT_SIZE : NORMAL_SIZE,
          }}
        >
          <div
            className="enemy-image"
            style={{
              width: "65px",
              height: "65px",
              backgroundImage: `url('app/${enemy.assetUrl}')`,
              backgroundSize: "contain",
            }}
          ></div>
          <div className="enemy-name">{enemy.name}</div>
          <progress className="health-bar" value={enemy.health} max={enemy.maxHealth}></progress>
          <progress className="mana-bar" value={enemy.mana} max={enemy.maxMana}></progress>
        </div>
      );
    });
  }
}

Battle.contextType = SocketContext;
