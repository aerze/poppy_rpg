import { BadgeType } from "../../server/game/badge";
import { PlayerUserData } from "../../server/game/player";
import { SocketEvents } from "../../shared/events";
import { getLevelRequirement } from "../../shared/xp";
import { Scene } from "../scene";

enum PlayerClientTabs {
  Badges,
  Items,
  PlayerLogs,
  BattleLogs,
}

export class GameScene extends Scene {
  html = `
  <div id="game-scene" class="scene column light-gradient">
    <div class="player-display">
      <div class="player-view">
        <img id="game-view-character" class="full-width"/>
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
      </div>
      <div class="row button-row">
        <button id="heal-action" class="actions">Heal</button>
        <button id="revive-action" class="actions">Revive</button>
      </div>
    </div>

    <div class="tabs-container">
      <div class="tabs row">
        <button id="badge-tab" class="tab">Badges</button>
        <button id="items-tab" class="tab" disabled>Items</button>
        <button id="player-logs-tab" class="tab" disabled>Player Logs</button>
        <button id="battle-logs-tab" class="tab" disabled>Battle Logs</button>
      </div>
      <div id="tab-content" class="tab-content flex">
        <div id="badge-content" class="flex row" style="display: none;" />
      </div>
    </div>
  </div>
  `;

  $gameCharacter!: HTMLImageElement;
  $playerName!: HTMLHeadingElement;
  $playerJob!: HTMLSpanElement;
  $playerHealthBar!: HTMLProgressElement;
  $playerHealthText!: HTMLHeadingElement;
  $playerXPText!: HTMLHeadingElement;
  $playerAttack!: HTMLHeadingElement;
  $playerDefense!: HTMLHeadingElement;
  $playerHeal!: HTMLHeadingElement;
  $playerAction!: HTMLHeadingElement;
  $attackAction!: HTMLButtonElement;
  $defendAction!: HTMLButtonElement;
  $healAction!: HTMLButtonElement;
  $reviveAction!: HTMLButtonElement;

  $tabContent!: HTMLDivElement;
  $badgeTab!: HTMLButtonElement;
  $badgeContent!: HTMLDivElement;
  $itemsTab!: HTMLButtonElement;
  $playerLogsTab!: HTMLButtonElement;
  $battleLogsTab!: HTMLButtonElement;
  activeTab: PlayerClientTabs = PlayerClientTabs.Badges;

  $log!: HTMLDivElement;

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

    this.$attackAction?.addEventListener("click", this.handleAttack);
    this.$defendAction?.addEventListener("click", this.handleDefend);
    this.$healAction?.addEventListener("click", this.handleHeal);
    this.$reviveAction?.addEventListener("click", this.handleRevive);

    this.$tabContent = document.getElementById("tab-content") as HTMLDivElement;
    this.$badgeTab = document.getElementById("badge-tab") as HTMLButtonElement;
    this.$badgeContent = document.getElementById("badge-content") as HTMLDivElement;
    this.$itemsTab = document.getElementById("items-tab") as HTMLButtonElement;
    this.$playerLogsTab = document.getElementById("player-logs-tab") as HTMLButtonElement;
    this.$battleLogsTab = document.getElementById("battle-logs-tab") as HTMLButtonElement;

    this.$badgeTab.addEventListener("click", () => this.setTab(PlayerClientTabs.Badges));
    this.$itemsTab.addEventListener("click", () => this.setTab(PlayerClientTabs.Items));
    this.$playerLogsTab.addEventListener("click", () => this.setTab(PlayerClientTabs.PlayerLogs));
    this.$battleLogsTab.addEventListener("click", () => this.setTab(PlayerClientTabs.BattleLogs));

    this.$badgeContent.style.display = "flex";

    socket.on(SocketEvents.Update, this.handleUpdate);
    socket.on(SocketEvents.Log, this.handleLog);
  }

  badgeMap: Map<BadgeType, HTMLImageElement> = new Map();

  renderBadgesTab() {
    if (this.localPlayer?.banner?.length) {
      for (const badge of this.localPlayer.banner) {
        if (this.badgeMap.has(badge.type)) return;
        const badgeElement = document.createElement("img");
        badgeElement.classList.add("badge");
        badgeElement.src = `images/badges${badge.type + 1}.png`;
        this.$badgeContent.appendChild(badgeElement);
        this.badgeMap.set(badge.type, badgeElement);
      }
    }
  }

  renderItemsTab() {}

  renderPlayerLogsTab() {}

  renderBattleLogsTab() {}

  setTab(tab: PlayerClientTabs) {
    this.activeTab = tab;
    this.renderBadgesTab();
    this.renderItemsTab();
    this.renderPlayerLogsTab();
    this.renderBattleLogsTab();
  }

  handleUpdate = (player: Required<PlayerUserData>) => {
    const tempCharacterSpriteMap: { [key: string]: string } = {
      a: "sprites/tay_test.png",
      b: "sprites/abby_test.png",
    };

    this.$attackAction.disabled = Boolean(player.nextAction);
    this.$defendAction.disabled = Boolean(player.nextAction);
    this.$healAction.disabled = Boolean(player.nextAction);
    this.$gameCharacter.src = tempCharacterSpriteMap[player.preset];
    this.$playerName.innerText = player.name;
    this.$playerJob.innerText = `Lv:${player.level} ${player.job}`;
    this.$playerXPText.innerText = `XP: ${player.xp}/${getLevelRequirement(player.level)}`;
    this.$playerHealthText.innerText = `HP: ${player.health}/${player.maxHealth}`;
    this.$playerHealthBar.value = player.health;
    this.$playerHealthBar.max = player.maxHealth;
    this.$playerAttack.innerText = `ATK: ${player.attack}`;
    this.$playerDefense.innerText = `DEF: ${player.defense}`;
    this.$playerHeal.innerText = `HEAL: ${player.heal}`;
    this.$reviveAction.disabled = player.active;
    this.$playerAction.innerText = `ACT: ${player.action?.toUpperCase()}`;
    this.localPlayer = player;

    this.renderBadgesTab();
    this.renderItemsTab();
    this.renderPlayerLogsTab();
    this.renderBattleLogsTab();
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
