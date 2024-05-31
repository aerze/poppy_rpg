import { AudioManager } from "./managers/audio-manager";
import { SceneManager } from "./managers/scene-manager";
import { NetworkManger } from "./managers/network-manager";

export class Mini {
  audio: AudioManager;
  scenes: SceneManager;
  network: NetworkManger;

  constructor() {
    this.audio = new AudioManager(this);
    this.scenes = new SceneManager(this);
    this.network = new NetworkManger(this);
  }
}
