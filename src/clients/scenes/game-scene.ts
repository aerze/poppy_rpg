import { PlayerUserData } from "../../server/game/player";
import { SocketEvents } from "../../shared/events";
import { getLevelRequirement } from "../../shared/xp";
import { Scene } from "../scene";

export class GameScene extends Scene {
  html = `
  <div id="game-screen" class="screen">
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

  $gameCharacter?: HTMLImageElement;
  $playerName?: HTMLHeadingElement;
  $playerJob?: HTMLSpanElement;
  $playerHealthBar?: HTMLProgressElement;
  $playerHealthText?: HTMLHeadingElement;
  $playerXPText?: HTMLHeadingElement;
  $playerAttack?: HTMLHeadingElement;
  $playerDefense?: HTMLHeadingElement;
  $playerHeal?: HTMLHeadingElement;
  $playerAction?: HTMLHeadingElement;
  $attackAction?: HTMLButtonElement;
  $defendAction?: HTMLButtonElement;
  $healAction?: HTMLButtonElement;
  $reviveAction?: HTMLButtonElement;
  $log?: HTMLDivElement;

  localPlayer?: Required<PlayerUserData>;

  create() {
    const socket = this.mini.network.socket;
    this.$gameCharacter = document.getElementById("game-view-character") as HTMLImageElement;
    this.$playerName = document.getElementById("player-name") as HTMLHeadingElement;
    this.$playerJob = document.getElementById("player-job") as HTMLSpanElement;
    this.$playerHealthBar = document.getElementById("player-hp-bar") as HTMLProgressElement;
    this.$playerHealthText = document.getElementById("player-hp-text") as HTMLHeadingElement;
    this.$playerXPText = document.getElementById("player-xp-text") as HTMLHeadingElement;
    this.$playerAttack = document.getElementById("player-attack") as HTMLHeadingElement;
    this.$playerDefense = document.getElementById("player-defense") as HTMLHeadingElement;
    this.$playerHeal = document.getElementById("player-heal") as HTMLHeadingElement;
    this.$playerAction = document.getElementById("player-action") as HTMLHeadingElement;
    this.$attackAction = document.getElementById("attack-action") as HTMLButtonElement;
    this.$defendAction = document.getElementById("defend-action") as HTMLButtonElement;
    this.$healAction = document.getElementById("heal-action") as HTMLButtonElement;
    this.$reviveAction = document.getElementById("revive-action") as HTMLButtonElement;
    this.$log = document.getElementById("log") as HTMLDivElement;

    socket.on(SocketEvents.Update, this.handleUpdate);

    socket.on(SocketEvents.Log, this.handleLog);
  }

  handleUpdate = (player: Required<PlayerUserData>) => {
    const tempCharacterSpriteMap: { [key: string]: string } = {
      a: "sprites/tay_test.png",
      b: "sprites/abby_test.png",
    };

    if (this.$attackAction) {
      this.$attackAction.disabled = Boolean(player.nextAction);
    }

    if (this.$defendAction) {
      this.$defendAction.disabled = Boolean(player.nextAction);
    }

    if (this.$healAction) {
      this.$healAction.disabled = Boolean(player.nextAction);
    }

    if (this.$gameCharacter && this.localPlayer?.preset !== player.preset) {
      this.$gameCharacter.src = tempCharacterSpriteMap[player.preset];
    }

    if (this.$playerName) {
      this.$playerName.innerText = player.name;
    }

    if (this.$playerJob) {
      this.$playerJob.innerText = `Lv:${player.level} ${player.job}`;
    }

    if (this.$playerXPText) {
      this.$playerXPText.innerText = `XP: ${player.xp}/${getLevelRequirement(player.level)}`;
    }

    if (this.$playerHealthText) {
      this.$playerHealthText.innerText = `HP: ${player.health}/${player.maxHealth}`;
    }

    if (this.$playerHealthBar) {
      this.$playerHealthBar.value = player.health;
    }

    if (this.$playerHealthBar) {
      this.$playerHealthBar.max = player.maxHealth;
    }

    if (this.$playerAttack) {
      this.$playerAttack.innerText = `ATK: ${player.attack}`;
    }

    if (this.$playerDefense) {
      this.$playerDefense.innerText = `DEF: ${player.defense}`;
    }

    if (this.$playerHeal) {
      this.$playerHeal.innerText = `HEAL: ${player.heal}`;
    }

    if (this.$reviveAction) {
      this.$reviveAction.disabled = player.active;
    }

    if (this.$playerAction) {
      this.$playerAction.innerText = `ACT: ${player.action?.toUpperCase()}`;
    }

    this.$attackAction?.addEventListener("click", this.handleAttack);
    this.$defendAction?.addEventListener("click", this.handleDefend);
    this.$healAction?.addEventListener("click", this.handleHeal);
    this.$reviveAction?.addEventListener("click", this.handleRevive);

    this.localPlayer = player;
  };

  handleLog = (text: string) => {
    const line = document.createElement("p");
    line.textContent = text;
    if (this.$log) {
      this.$log.insertBefore(line, this.$log.firstChild);
    }
  };

  handleAttack = (event: MouseEvent) => {
    event.preventDefault();
    if (this.localPlayer?.action === "attack") return;
    this.mini.network.socket.emit(SocketEvents.PlayerAction, { action: "attack" });
  };

  handleDefend = (event: MouseEvent) => {
    event.preventDefault();
    if (this.localPlayer?.action === "defend") return;
    this.mini.network.socket.emit(SocketEvents.PlayerAction, { action: "defend" });
  };

  handleHeal = (event: MouseEvent) => {
    event.preventDefault();
    if (this.localPlayer?.action === "heal") return;
    this.mini.network.socket.emit(SocketEvents.PlayerAction, { action: "heal" });
  };

  handleRevive = (event: MouseEvent) => {
    event.preventDefault();
    if (this.localPlayer?.action === "revive") return;
    this.mini.network.socket.emit(SocketEvents.PlayerRevive);
  };

  destroy() {
    this.mini.network.socket.off(SocketEvents.Log, this.handleLog);
  }
}
