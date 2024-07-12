import "./hud.scss";
import { useContext } from "react";
import { SceneContext } from "../context/scene";
import { SocketContext } from "../context/socket";
import { Alerts } from "./alerts";

export function HUD() {
  const { scene, setScene } = useContext(SceneContext);
  const { isNewPlayer } = useContext(SocketContext);

  function makeHandleSceneChange(targetScene) {
    return () => {
      if (scene !== targetScene) {
        setScene(targetScene);
      }
    };
  }

  const disabled = isNewPlayer;

  return (
    <div className="hud">
      <Alerts />

      <div className="hud-button-group">
        <button disabled={disabled} className="hud-button" onClick={makeHandleSceneChange(1)}>
          🤔
        </button>
        <button disabled={disabled} className="hud-button" onClick={makeHandleSceneChange(2)}>
          🏠
        </button>
        <button disabled={disabled} className="hud-button" onClick={makeHandleSceneChange(0)}>
          ⚔️
        </button>
        <button disabled={true} className="hud-button" onClick={makeHandleSceneChange(3)}>
          🛍️
        </button>
        <button disabled={true} className="hud-button" onClick={makeHandleSceneChange(4)}>
          🪅
        </button>
      </div>
    </div>
  );
}
