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
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Preview } from "react-dnd-preview";

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

const hasNative = document && (document.elementsFromPoint || document.msElementsFromPoint);

function getDropTargetElementsAtPoint(x, y, dropTargets) {
  return dropTargets.filter((t) => {
    const rect = t.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y <= rect.bottom && y >= rect.top;
  });
}

// use custom function only if elementsFromPoint is not supported
const backendOptions = {
  enableMouseEvents: true,
  getDropTargetElementsAtPoint: !hasNative && getDropTargetElementsAtPoint,
};

function generatePreview({ itemType, item, style }) {
  return (
    <div style={{ ...style, zIndex: 1000, border: "2px solid black", background: "white" }}>
      <div style={{ width: "50px", height: "50px" }}>{item.image}</div>
    </div>
  );

  // return <img style={{ ...style, zIndex: 100 }} src="/images/fire_skill.png" />;
}

function App() {
  const [connected, setConnected] = useState(false);

  if (!connected) {
    return <Main setConnected={setConnected} />;
  } else {
    return (
      <SceneProvider>
        <DndProvider debugMode={true} backend={TouchBackend} options={backendOptions}>
          <Preview generator={generatePreview} />
          <HUD />
          <div className="scene-container">
            <SceneManager />
          </div>
        </DndProvider>
      </SceneProvider>
    );
  }
}

export default App;
