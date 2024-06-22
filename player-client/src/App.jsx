import "./App.css";
import { useContext, useState } from "react";
import { SceneContext, SceneProvider } from "./context/scene";
import { Main } from "./components/main";
import { FieldScene } from "./scenes/field";
import { HUD } from "./components/hud";
import { CharacterScene } from "./scenes/character";
import { HomeScene } from "./scenes/home";
import { ShopScene } from "./scenes/shop";
import { ConfigScene } from "./scenes/config";

function SceneManager() {
  const { scene } = useContext(SceneContext);
  switch (scene) {
    case 0:
      return <FieldScene />;
    case 1:
      return <CharacterScene />;
    case 2:
      return <HomeScene />;
    case 3:
      return <ShopScene />;
    case 4:
      return <ConfigScene />;
    default:
      return <FieldScene />;
  }
}

function App() {
  const [connected, setConnected] = useState(false);

  if (!connected) {
    return <Main setConnected={setConnected} />;
  } else {
    return (
      <SceneProvider>
        <HUD />
        <div className="scene-container">
          <SceneManager />
        </div>
      </SceneProvider>
    );
  }
}

export default App;
