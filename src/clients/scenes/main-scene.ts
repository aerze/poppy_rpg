import { Scene } from "../scene";

export class MainScene extends Scene {
  html = `
    <div id="main-scene" class="scene main-scene flex light-gradient">
    <header class="flex">
      <img src="images/frorg.png"/>
      <h1>
        Poppy's Idle RPG
      </h1>
    </header>

    <div class="flex main-button-group">
      <button id="connect">Start Game</button>
      <button type="button" onclick="window.open(document.location.href, 'minidash','left=0, top=0, width=400, height=800');return false;">Pop Out ↗</button>
    </div>
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
