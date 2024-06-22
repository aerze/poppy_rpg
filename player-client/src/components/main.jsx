import "./main.css";

export function Main({ setConnected }) {
  function handleStartGame() {
    setConnected(true);
  }

  function handleOpen() {
    window.open(document.location.href, "minidash", "left=0, top=0, width=400, height=800");
    return false;
  }

  return (
    <div id="main-scene" className="scene main-scene flex light-gradient">
      <header className="flex">
        <img src="images/frorg.png" />
        <h1>Poppy's Idle RPG</h1>
      </header>

      <div className="flex main-button-group">
        <button id="connect" onClick={handleStartGame}>
          Start Game
        </button>
        <button type="button" onClick={handleOpen}>
          Pop Out ↗
        </button>
      </div>
    </div>
  );
}
