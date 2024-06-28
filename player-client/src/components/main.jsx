import "./main.scss";

export function Main({ setConnected }) {
  function handleStartGame() {
    setConnected(true);
  }

  function handleOpen() {
    window.open(document.location.href, "_blank", "popup=yes, left=0, top=0, innerWidth=499, innerHeight=880");
    return false;
  }

  return (
    <div className="main-menu">
      <div className="top">
        <header>
          <img src="images/frorg.png" />
          <h1>Poppy's Idle RPG</h1>
        </header>
      </div>
      <div className="middle">
        <div className="studio-logo">
          <div className="title">DEVELOPED BY</div>
          <div className="divider"></div>
          <div className="studio">MYTHRIL LABS</div>
        </div>
        <div className="illustration"></div>
      </div>
      <div className="bottom">
        <div className="menu-item" onClick={handleStartGame}>
          START GAME
        </div>
        <div className="menu-item" onClick={handleOpen}>
          POP OUT ↗
        </div>
        <div className="menu-item">RESET CHARACTER</div>
        <div className="menu-item">STREAM</div>
      </div>
    </div>
  );
}
