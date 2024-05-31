import { Mini } from "../mini";
import { BaseManager } from "./base-manager";

export class AudioManager extends BaseManager {
  static defaultVolume = 0.5;

  static Files = ["audio/confirm.ogg", "audio/cancel.ogg"];

  audioMap: Map<string, HTMLAudioElement>;

  constructor(mini: Mini) {
    super(mini);
    /** @type {Map<string, HTMLAudioElement} */
    this.audioMap = new Map();

    for (const path of AudioManager.Files) {
      const key: string = path.split(".ogg")[0].split("/")[1];
      const audioEl = document.createElement("audio");
      audioEl.src = path;
      audioEl.volume = AudioManager.defaultVolume;
      document.body.appendChild(audioEl);
      this.audioMap.set(key, audioEl);
    }
  }

  play(key: string) {
    const audioEl = this.audioMap.get(key);
    if (!audioEl) return;

    audioEl.currentTime = 0;
    audioEl.play();
  }
}
