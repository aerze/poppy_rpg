import "./main.scss";
import { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/socket";

const isMobileRegex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
function isMobile() {
  return isMobileRegex.test(navigator.userAgent);
}

export function Main() {
  const { connected, connect, newPlayer, player } = useContext(SocketContext);
  const navigate = useNavigate();

  function handleStartGame() {
    if (isMobile()) {
      document.body.requestFullscreen();
    }
    connect();
    navigate("/app/🐸/🏡");
  }

  function handleOpen() {
    window.open(document.location.href, "_blank", "popup=yes, left=0, top=0, innerWidth=430, innerHeight=880");
    return false;
  }

  function handleOpenStream() {
    console.log("test");
    window.open("https://www.twitch.tv/abby_the_lesbiab", "_blank");
  }

  if (connected) {
    return <Navigate to="/app/🐸" replace={true} />;
  }

  return (
    <>
      <div className="main-menu">
        <div className="top">
          <header>
            <img src="/app/images/frorg.png" />
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
            <img src="/app/images/image1.png" />
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
    </>
  );
}
