import { Scene } from "../scene";

export class GameScene extends Scene {
  html = `
  <div id="game-screen" class="screen" style="display: none">
    <div class="player-display">
      <div class="player-view">
        <img id="game-view-character" />
      </div>
      <div class="player-stats">
        <h2 id="player-name">Anon</h2>
        <span id="player-job">Healer</span>
        <div class="hp">
          <progress id="player-hp-bar" value="100" max="100"></progress>
          <h5 id="player-xp-text">XP: 0/0</h5>
          <h5 id="player-hp-text">HP: 80/80</h5>
        </div>
        <h5 id="player-attack">ATK: 12</h5>
        <h5 id="player-defense">DEF: 23</h5>
        <h5 id="player-heal">HEAL: 12</h5>
        <h5 id="player-action">ACT: ATTACK</h5>
      </div>
    </div>

    <div class="player-controls">
      <div class="row button-row">
        <button id="attack-action" class="actions">Attack</button>
        <button id="defend-action" class="actions">Defend</button>
        <button id="heal-action" class="actions">Heal</button>
        <button id="revive-action" class="actions">Revive</button>
      </div>
      <div id="log"></div>
    </div>
  </div>
  `;

  create() {}

  destroy() {}
}
