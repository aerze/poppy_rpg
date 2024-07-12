import "./main.scss";
import { useContext } from "react";
import { SocketContext } from "../context/socket";
import { Preview } from "react-dnd-preview";
import { HUD } from "./hud";
import { FieldScene } from "../scenes/field";
import { CharacterScene } from "../scenes/character";
import { HomeScene } from "../scenes/home";
import { ShopScene } from "../scenes/shop";
import { ConfigScene } from "../scenes/config";
import { SceneContext } from "../context/scene";
import { LoadingPanel } from "./loadingPanel";

function generatePreview({ itemType, item, style }) {
  return (
    <div style={{ ...style, zIndex: 1000, border: "2px solid black", background: "white" }}>
      <div style={{ width: "50px", height: "50px" }}>{item.image}</div>
    </div>
  );

  // return <img style={{ ...style, zIndex: 100 }} src="/images/fire_skill.png" />;
}

function SceneManager() {
  const { scene } = useContext(SceneContext);
  const { isNewPlayer } = useContext(SocketContext);

  if (isNewPlayer) {
    return <CharacterScene />;
  }

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

export function Main() {
  const { connected, connect, newPlayer, player } = useContext(SocketContext);

  function handleStartGame() {
    connect();
  }

  function handleOpen() {
    window.open(document.location.href, "_blank", "popup=yes, left=0, top=0, innerWidth=430, innerHeight=880");
    return false;
  }

  function handleOpenStream() {
    console.log("test");
    window.open("https://www.twitch.tv/abby_the_lesbiab", "_blank");
  }

  const isLoading = newPlayer === null && player === null;

  if (connected) {
    return (
      <>
        <Preview generator={generatePreview} />
        <HUD />
        <div className="scene-container">
          <SceneManager />
        </div>
        {isLoading && <LoadingPanel />}
      </>
    );
  }

  return (
    <div className="main-menu">
      <div className="top">
        <header>
          <img src="images/frorg.png" />
          <h1>Tales of the Pond</h1>
        </header>
      </div>
      <div className="middle">
        <div className="studio-logo">
          <div className="title">DEVELOPED BY</div>
          <div className="divider"></div>
          <div className="studio">MYTHRIL LABS</div>
        </div>
        <div className="illustration">
          <img src="images/image1.png" />
        </div>
      </div>
      <div className="bottom">
        <div className="menu-item" onClick={handleStartGame}>
          {player ? "CONTINUE" : "START GAME"}
        </div>
        <div className="menu-item" onClick={handleOpen}>
          POP OUT ↗
        </div>
        {/* <div className="menu-item">RESET CHARACTER</div> */}
        <div className="menu-item" onClick={handleOpenStream}>
          STREAM
        </div>
      </div>
    </div>
  );
}
