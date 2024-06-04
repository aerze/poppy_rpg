import { BaseManager } from "./base-manager";
import { Mini } from "../mini";
import { Scene } from "../scene";
import { MainScene } from "../scenes/main-scene";
import { CharacterScene } from "../scenes/character-scene";
import { GameScene } from "../scenes/game-scene";

export class SceneManager extends BaseManager {
  static Scenes = {
    main: MainScene,
    character: CharacterScene,
    game: GameScene,
  };

  activeScene?: Scene;

  constructor(mini: Mini) {
    super(mini);
  }

  open(key: keyof typeof SceneManager.Scenes) {
    this.log("opening", key);
    // unload prev screen
    if (this.activeScene) {
      this.activeScene.unload();
    }

    // load new one
    const newScene = new SceneManager.Scenes[key](this.mini);
    this.activeScene = newScene;
    newScene.load();
  }
}
