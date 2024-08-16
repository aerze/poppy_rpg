import React from "react";
import "./character.scss";
import { SocketContext } from "../context/socket";

export const CHARACTER_SPRITE_MAP = {
  0: "/app/images/tay_test.png",
  1: "/app/images/abby_test.png",
};

export class Character extends React.Component {
  state = {
    disabled: false,
  };

  handleFormSubmit = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const formData = { ...data, presetId: this.context.player.presetId };

    if (!data.name.trim() || !this.context.socket) {
      return;
    }
    this.setState({ disabled: true });

    if (this.context.player.id) {
      this.context.updatePlayer({ ...formData, id: this.context.player.id }, () => {
        this.setState({ disabled: false });
      });
    } else {
      this.context.createPlayer(formData, () => {
        this.setState({ disabled: false });
      });
    }
  };

  handleLeftClick = () => {
    this.context.updateLocalPlayer({
      player: { presetId: Math.max((this.context.player?.presetId ?? 0) - 1, 0) },
    });
  };

  handleRightClick = () => {
    this.context.updateLocalPlayer({
      player: { presetId: Math.min((this.context.player?.presetId ?? 0) + 1, 1) },
    });
  };

  render() {
    return (
      <div className="character-container simple-container column">
        <div className="hud-top-buffer"></div>
        <CharacterView player={this.context.player} />
        <div className="character-form-container">
          <form className="character-form" onSubmit={this.handleFormSubmit}>
            <div className="character-button-group">
              <label>Name</label>
              <input type="text" name="name" id="name" defaultValue={this.context.player?.name} autoComplete="off" />
            </div>
            <div className="character-button-group">
              <label>Color</label>
              <input type="color" name="color" id="color" defaultValue={this.context.player?.color} />
            </div>
            <div className="character-button-group">
              <label>
                Preset Character <br />
                (char: {this.context.player?.presetId})
              </label>
              <div className="preset-container">
                <button type="button" className="arrow left-arrow" onClick={this.handleLeftClick}>
                  ◀️
                </button>
                <button type="button" className="arrow right-arrow" onClick={this.handleRightClick}>
                  ▶️
                </button>
              </div>
            </div>
            <div className="character-button-group">
              <label>
                Backstory <br /> (tragedy optional)
              </label>
              <div className="preset-container">
                <textarea defaultValue={this.context.player.backstory} name="backstory" id="backstory" rows={3} />
              </div>
            </div>
            <div className="character-button-group">
              <button disabled={this.state.disabled} className="submit-button" type="submit">
                {this.context.isNewPlayer ? "Create" : "Save"}
              </button>
            </div>
          </form>
        </div>
        <div className="hud-bottom-buffer"></div>
      </div>
    );
  }
}

function CharacterView({ player }) {
  const assetUrl = player.presetId !== undefined ? CHARACTER_SPRITE_MAP[player.presetId] : `/app/${player.assetUrl}`;
  return (
    <div className="character-view column">
      <CharacterNameplate player={player} />
      <div className="row">
        <div className="character-image-container">
          <img className="character-image" src={assetUrl} />
        </div>
        <div className="character-stats">
          <CharacterStats player={player} />
        </div>
      </div>
    </div>
  );
}

function CharacterNameplate({ player }) {
  return (
    <div className="nameplate row">
      <div className="level" style={{ borderColor: player?.color ?? "white" }}>
        {player.level ?? 1}
      </div>
      <div className="column">
        <div className="name">{player.name}</div>
        <div className="title">{player.activeTitle ?? ""}</div>
        <div className="bar health-bar">
          <label>
            HP: {player?.health ?? 0}/{player?.maxHealth ?? 0}
          </label>
          <div className="fill" style={{ width: `${Math.floor((player.health / player.maxHealth) * 100)}%` }}></div>
        </div>
        <div className="bar mana-bar">
          <label>
            MP: {player?.mana ?? 0}/{player?.maxMana ?? 0}
          </label>
          <div className="fill" style={{ width: `${Math.floor((player.mana / player.maxMana) * 100)}%` }}></div>
        </div>
      </div>
    </div>
  );
}

function CharacterStats({ player }) {
  return (
    <div className="stats">
      <div className="stat xp">
        XP: <span className="value">{player?.xp ?? 0}</span>
      </div>
      <div className="stat attack">
        Attack: <span className="value">{player.stats?.attack}</span>
      </div>
      <div className="stat defense">
        Defense: <span className="value">{player.stats?.defense}</span>
      </div>
      <div className="stat health">
        Health: <span className="value">{player.stats?.health}</span>
      </div>
      <div className="stat luck">
        Luck: <span className="value">{player.stats?.luck}</span>
      </div>
      <div className="stat magic">
        Magic: <span className="value">{player.stats?.magic}</span>
      </div>
      <div className="stat mana">
        Mana: <span className="value">{player.stats?.mana}</span>
      </div>
      <div className="stat resist">
        Resist: <span className="value">{player.stats?.resist}</span>
      </div>
      <div className="stat speed">
        Speed: <span className="value">{player.stats?.speed}</span>
      </div>
    </div>
  );
}

Character.contextType = SocketContext;
