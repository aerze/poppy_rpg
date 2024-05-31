import { Scene } from "../scene";

export class CharacterScene extends Scene {
  html = `
  <div id="character-screen" class="screen" style="display: none">
    <form id="character-form">
      <div class="player-display">
        <div class="player-view">
          <img id="player-character" />
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

          <button>Create</button>
        </div>
      </div>
    </form>
  </div>
  `;

  $form?: HTMLFormElement;

  $characterName?: HTMLInputElement;

  $characterImage?: HTMLImageElement;

  $characterPreset?: HTMLSelectElement;

  create() {
    this.$form = document.getElementById("character-form") as HTMLFormElement;
    this.$characterName = document.getElementById("characterName") as HTMLInputElement;
    this.$characterImage = document.getElementById("player-character") as HTMLImageElement;
    this.$characterPreset = document.getElementById("preset") as HTMLSelectElement;
  }

  destroy() {}
}
