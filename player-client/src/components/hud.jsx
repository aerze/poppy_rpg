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
  const { connected, isNewPlayer, player } = useContext(SocketContext);
  const navigate = useNavigate();

  if (!connected) {
    console.log(">> not connected", connected);
    return <Navigate to="/app/menu" replace={true} />;
  }

  const disabled = isNewPlayer;

  console.log("p", player);
  return (
    <>
      <Preview generator={generatePreview} />
      <div className="scene-container">
        <Outlet />
      </div>
      <div className="hud">
        <div className="header">
          <div className="level">Lv. {player.level} </div>
          <div className="xp">
            <div className="value">
              <label className="label">XP</label> {player.xp} / {player.nextLevel}
            </div>
            <div className="fill" style={{ width: `${Math.floor(100 * (player.xp / player.nextLevel))}` }}></div>
          </div>
        </div>
        <Alerts />
        <LevelUpModal />

        <div className="hud-button-group">
          <NavLink to="🏡" className="hud-link">
            <div disabled={true} className="hud-button">
              🏡
            </div>
          </NavLink>

          <NavLink to="🤔" className="hud-link">
            <div disabled={disabled} className="hud-button">
              🤔
            </div>
          </NavLink>

          <NavLink to="✨" className="hud-link">
            <div disabled={disabled} className="hud-button">
              ⚔️
            </div>
          </NavLink>
          <NavLink disabled={true} to="🪅" className="hud-link  disabled">
            <div disabled={true} className="hud-button">
              🪅
            </div>
          </NavLink>

          <NavLink to="⚖️" className="hud-link  disabled">
            <div disabled={true} className="hud-button">
              ⚖️
            </div>
          </NavLink>
          <NavLink disabled={true} to="⚜️" className="hud-link disabled">
            <div disabled={true} className="hud-button">
              ⚜️
            </div>
          </NavLink>
        </div>
      </div>
    </>
  );
}
