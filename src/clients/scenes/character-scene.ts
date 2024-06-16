import { SocketEvents } from "../../shared/events";
import { PresetMap } from "../presets";
import { Scene } from "../scene";

export class CharacterScene extends Scene {
  html = `
  <div id="character-scene" class="scene flex column light-gradient">
    <form id="character-form">
      <div class="player-display">
        <div class="player-view">
          <img id="player-character" class="full-width"/>
        </div>
      </div>

      <div class="player-form">
        <div class="controls">
          <label>
            CHARACTER NAME:
            <input id="characterName" name="characterName" type="text" />
          </label>

          <label name="preset">
            PRESET NAME
            <select id="preset" name="preset">
              <option value="a">Volvo</option>
              <option value="b">Saab</option>
            </select>
          </label>

          <label name="job">
            Job Class
            <select id="job" name="job">
              <option value="healer">🐞Lady Healer</option>
              <option value="tank">🪲 Beetle Warden</option>
              <option value="knight">🐸 Frog Knight</option>
            </select>
          </label>

          <label name="color">
            Color
            <input type="color" id="color" name="color" />
          </label>

          <button id="character-submit">Create</button>
        </div>
      </div>
    </form>
  </div>
  `;

  $form!: HTMLFormElement;

  $characterName!: HTMLInputElement;
  $preset!: HTMLSelectElement;
  $job!: HTMLSelectElement;
  $color!: HTMLInputElement;
  $submit!: HTMLButtonElement;

  $characterImage!: HTMLImageElement;

  create() {
    this.$form = document.getElementById("character-form") as HTMLFormElement;
    this.$characterName = document.getElementById("characterName") as HTMLInputElement;
    this.$preset = document.getElementById("preset") as HTMLSelectElement;
    this.$job = document.getElementById("job") as HTMLSelectElement;
    this.$color = document.getElementById("color") as HTMLInputElement;
    this.$submit = document.getElementById("character-submit") as HTMLButtonElement;

    if (this.mini.player.localPlayer) {
      const { localPlayer } = this.mini.player;
      this.$characterName.value = localPlayer.name;
      this.$preset.value = localPlayer.preset;
      this.$job.value = localPlayer.job;
      this.$color.value = localPlayer.color;
      this.$submit.innerText = "Update";
    }

    this.$characterImage = document.getElementById("player-character") as HTMLImageElement;
    this.$preset.addEventListener("change", this.handlePresetChange);
    this.$form.addEventListener("submit", this.handleFormSubmit);

    const value = this.$preset.value as keyof typeof PresetMap;
    this.$characterImage.src = PresetMap[value];
  }

  handlePresetChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value as keyof typeof PresetMap;
    this.$characterImage.src = PresetMap[value];
  };

  handleFormSubmit = (event: SubmitEvent) => {
    const socket = this.mini.network.socket;
    event.preventDefault();

    const formData = (new FormData(event.target as HTMLFormElement) as any).entries();
    const data = Object.fromEntries(formData);
    if (!data.characterName.trim()) {
      return;
    }

    if (this.mini.player.localPlayer) {
      socket.once(SocketEvents.PlayerUpdated, this.handlePlayerRegistered);
      socket.emit(SocketEvents.PlayerUpdate, {
        playerId: this.mini.player.playerId,
        name: data.characterName,
        color: data.color,
        job: data.job,
        preset: data.preset,
      });
    } else {
      socket.once(SocketEvents.PlayerRegistered, this.handlePlayerRegistered);
      socket.emit(SocketEvents.PlayerConnected, {
        name: data.characterName,
        color: data.color,
        job: data.job,
        preset: data.preset,
        active: true,
      });
    }
  };

  handlePlayerRegistered = ({ playerId }: { playerId: string }) => {
    this.mini.player.setPlayerId(playerId);
    this.mini.scenes.open("game");
  };

  destroy() {}
}
