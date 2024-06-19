import { useContext } from "react";
import "./hud.css";
import { SceneContext } from "../context/scene";
export function HUD() {
  const { scene, setScene } = useContext(SceneContext);

  function makeHandleSceneChange(targetScene) {
    return () => {
      if (scene !== targetScene) {
        setScene(targetScene);
      }
    };
  }

  return (
    <div class="hud">
      <div class="button-group">
        <button class="hud-button" onClick={makeHandleSceneChange(1)}>
          🤔
        </button>
        <button class="hud-button" onClick={makeHandleSceneChange(2)}>
          🏠
        </button>
        <button class="hud-button" onClick={makeHandleSceneChange(0)}>
          ⚔️
        </button>
        <button class="hud-button" onClick={makeHandleSceneChange(3)}>
          🏪
        </button>
        <button class="hud-button" onClick={makeHandleSceneChange(4)}>
          ⚙️
        </button>
      </div>
    </div>
  );
}
