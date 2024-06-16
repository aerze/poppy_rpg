import { AudioManager } from "./managers/audio-manager";
import { SceneManager } from "./managers/scene-manager";
import { NetworkManger } from "./managers/network-manager";
import { PlayerManager } from "./managers/player-manager";

export class Mini {
  audio: AudioManager;
  scenes: SceneManager;
  network: NetworkManger;
  player: PlayerManager;

  constructor() {
    this.audio = new AudioManager(this);
    this.scenes = new SceneManager(this);
    this.network = new NetworkManger(this);
    this.player = new PlayerManager(this);
  }
}
