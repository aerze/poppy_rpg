import { Scene } from "../scene";

export class MainScene extends Scene {
  html = `
    <div id="main-screen" class="main screen center" style="display: flex">
    <header class="flex">
      <h1>
        Poppy's <br />
        Dungeon
      </h1>
    </header>

    <main class="flex">
      <button id="connect" class="display-button">Start Game</button>
    </main>
  </div>
  `;

  $connectButton?: HTMLButtonElement;

  create() {
    this.$connectButton = document.getElementById("connect") as HTMLButtonElement;
    this.$connectButton.addEventListener("click", this.handleConnectClick);
  }

  handleConnectClick = () => {
    this.mini.audio.play("confirm");
    this.mini.network.init();
  };

  destroy() {
    this.$connectButton?.removeEventListener("click", this.handleConnectClick);
  }
}
