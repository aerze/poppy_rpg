import React from "react";
import "./levelup-modal.scss";
import { DataType, SocketContext } from "../context/socket";
import { NetContext } from "../context/net";

export class LevelUpModal extends React.Component {
  state = {
    stats: {
      attack: 0,
      defense: 0,
      health: 0,
      luck: 0,
      magic: 0,
      mana: 0,
      resist: 0,
      speed: 0,
    },
  };

  getStat(stat) {
    const localStat = this.state.stats?.[stat];
    const serverStat = this.context.player?.stats?.[stat];
    return localStat + serverStat;
  }

  getAllLocalStats() {
    return (
      this.state.stats.attack +
      this.state.stats.defense +
      this.state.stats.health +
      this.state.stats.luck +
      this.state.stats.magic +
      this.state.stats.mana +
      this.state.stats.resist +
      this.state.stats.speed
    );
  }

  handleIncrease = (stat) => {
    if (this.getAllLocalStats() >= this.context.player.availableStatPoints) return;
    this.setState((state) => {
      return {
        ...state,
        stats: {
          ...state.stats,
          [stat]: state.stats?.[stat] + 1,
        },
      };
    });
  };

  handleDecrease = (stat) => {
    this.setState((state) => {
      return {
        ...state,
        stats: {
          ...state.stats,
          [stat]: Math.max(0, state.stats[stat] - 1),
        },
      };
    });
  };

  handleReset = () => {
    this.setState({
      stats: {
        attack: 0,
        defense: 0,
        health: 0,
        luck: 0,
        magic: 0,
        mana: 0,
        resist: 0,
        speed: 0,
      },
    });
  };

  handleSave = () => {
    const player = this.context.player;
    const totalPoints = this.getAllLocalStats();
    if (totalPoints > player.availableStatPoints) {
      return this.handleReset();
    }
    this.setState({
      loading: true,
    });

    this.context.send(DataType.ASSIGN_STAT_POINTS, { stats: this.state.stats }, (result) => {
      if (result) {
        // fetch player
        this.context.refreshPlayer();
      }
      this.handleReset();
      this.setState({ loading: false });
    });
  };

  render() {
    if (!this.context.player?.availableStatPoints) return;

    return (
      <div className="levelup-modal">
        <div className="levelup">
          <h2 className="new-level">Level {this.context.player.level}</h2>
          <h3 className="remaining-point">
            {" "}
            points remaining: {this.context.player.availableStatPoints - this.getAllLocalStats()}
          </h3>
          <div className="stat-container">
            <div className="stat-row">
              <div className="stat-name">Attack</div>
              <div className="stat-points-container">
                <div className="stat-down" onClick={() => this.handleDecrease("attack")}>
                  ➖
                </div>
                <div className="stat-value">{this.state.stats.attack}</div>
                <div className="stat-up" onClick={() => this.handleIncrease("attack")}>
                  ➕
                </div>
              </div>
              <div className="new-stat-value">{this.getStat("attack")}</div>
            </div>

            <div className="stat-row">
              <div className="stat-name">Defense</div>
              <div className="stat-points-container">
                <div className="stat-down" onClick={() => this.handleDecrease("defense")}>
                  ➖
                </div>
                <div className="stat-value">{this.state.stats.defense}</div>
                <div className="stat-up" onClick={() => this.handleIncrease("defense")}>
                  ➕
                </div>
              </div>
              <div className="new-stat-value">{this.getStat("defense")}</div>
            </div>

            <div className="stat-row">
              <div className="stat-name">Health</div>
              <div className="stat-points-container">
                <div className="stat-down" onClick={() => this.handleDecrease("health")}>
                  ➖
                </div>
                <div className="stat-value">{this.state.stats.health}</div>
                <div className="stat-up" onClick={() => this.handleIncrease("health")}>
                  ➕
                </div>
              </div>
              <div className="new-stat-value">{this.getStat("health")}</div>
            </div>

            <div className="stat-row">
              <div className="stat-name">Luck</div>
              <div className="stat-points-container">
                <div className="stat-down" onClick={() => this.handleDecrease("luck")}>
                  ➖
                </div>
                <div className="stat-value">{this.state.stats.luck}</div>
                <div className="stat-up" onClick={() => this.handleIncrease("luck")}>
                  ➕
                </div>
              </div>
              <div className="new-stat-value">{this.getStat("luck")}</div>
            </div>

            <div className="stat-row">
              <div className="stat-name">Magic</div>
              <div className="stat-points-container">
                <div className="stat-down" onClick={() => this.handleDecrease("magic")}>
                  ➖
                </div>
                <div className="stat-value">{this.state.stats.magic}</div>
                <div className="stat-up" onClick={() => this.handleIncrease("magic")}>
                  ➕
                </div>
              </div>
              <div className="new-stat-value">{this.getStat("magic")}</div>
            </div>

            <div className="stat-row">
              <div className="stat-name">Mana</div>
              <div className="stat-points-container">
                <div className="stat-down" onClick={() => this.handleDecrease("mana")}>
                  ➖
                </div>
                <div className="stat-value">{this.state.stats.mana}</div>
                <div className="stat-up" onClick={() => this.handleIncrease("mana")}>
                  ➕
                </div>
              </div>
              <div className="new-stat-value">{this.getStat("mana")}</div>
            </div>

            <div className="stat-row">
              <div className="stat-name">Resist</div>
              <div className="stat-points-container">
                <div className="stat-down" onClick={() => this.handleDecrease("resist")}>
                  ➖
                </div>
                <div className="stat-value">{this.state.stats.resist}</div>
                <div className="stat-up" onClick={() => this.handleIncrease("resist")}>
                  ➕
                </div>
              </div>
              <div className="new-stat-value">{this.getStat("resist")}</div>
            </div>

            <div className="stat-row">
              <div className="stat-name">Speed</div>
              <div className="stat-points-container">
                <div className="stat-down" onClick={() => this.handleDecrease("speed")}>
                  ➖
                </div>
                <div className="stat-value">{this.state.stats.speed}</div>
                <div className="stat-up" onClick={() => this.handleIncrease("speed")}>
                  ➕
                </div>
              </div>
              <div className="new-stat-value">{this.getStat("speed")}</div>
            </div>
          </div>
          <div className="stat-buttons">
            <button className="stat-button-reset" onClick={this.handleReset}>
              Reset
            </button>
            <button className="stat-button-save" onClick={this.handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
}

LevelUpModal.contextType = NetContext;
