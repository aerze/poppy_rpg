import "./hud.scss";
import { useContext } from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/socket";
import { Alerts } from "./alerts";
import { LevelUpModal } from "./levelup-modal";
import { Preview } from "react-dnd-preview";

function generatePreview({ itemType, item, style }) {
  return (
    <div style={{ ...style, zIndex: 1000, border: "2px solid black", background: "white" }}>
      <div style={{ width: "50px", height: "50px" }}>{item.image}</div>
    </div>
  );

  // return <img style={{ ...style, zIndex: 100 }} src="/images/fire_skill.png" />;
}

export function HUD() {
  const { connected, isNewPlayer } = useContext(SocketContext);
  const navigate = useNavigate();

  if (!connected) {
    console.log(">> not connected", connected);
    return <Navigate to="/app/menu" replace={true} />;
  }

  const disabled = isNewPlayer;

  return (
    <>
      <Preview generator={generatePreview} />
      <div className="hud">
        <Alerts />
        <LevelUpModal />

        <div className="hud-button-group">
          <NavLink to="🤔" className="hud-link">
            <button disabled={disabled} className="hud-button">
              🤔
            </button>
          </NavLink>
          <NavLink to="🏡" className="hud-link">
            <button disabled={true} className="hud-button">
              🏡
            </button>
          </NavLink>
          <NavLink to="✨" className="hud-link">
            <button disabled={disabled} className="hud-button">
              ⚔️
            </button>
          </NavLink>
          <NavLink to="🛒" className="hud-link">
            <button disabled={true} className="hud-button">
              🛒
            </button>
          </NavLink>
          <NavLink to="🪅" className="hud-link">
            <button disabled={true} className="hud-button">
              🪅
            </button>
          </NavLink>
        </div>
      </div>
      <div className="scene-container">
        <Outlet />
      </div>
    </>
  );
}
