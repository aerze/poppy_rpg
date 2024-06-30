import "./App.css";
import { SceneProvider } from "./context/scene";
import { Main } from "./components/main";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { PlayerProvider } from "./context/player";
import { SocketProvider } from "./context/socket";

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

function App() {
  return (
    <SocketProvider>
      <SceneProvider>
        <PlayerProvider>
          <DndProvider backend={TouchBackend} options={backendOptions}>
            <Main />
          </DndProvider>
        </PlayerProvider>
      </SceneProvider>
    </SocketProvider>
  );
}

export default App;
