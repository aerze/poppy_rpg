import "./hud.scss";
import { Component, useContext, useState } from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/socket";
import { Alerts } from "./alerts";
import { LevelUpModal } from "./levelup-modal";
import { Preview } from "react-dnd-preview";
import { NetContext } from "../context/net";

function generatePreview({ itemType, item, style }) {
  return (
    <div style={{ ...style, zIndex: 1000, border: "2px solid black", background: "white" }}>
      <div style={{ width: "50px", height: "50px" }}>{item.image}</div>
    </div>
  );

  // return <img style={{ ...style, zIndex: 100 }} src="/images/fire_skill.png" />;
}

export class HUD extends Component {
  render() {
    const { connected, isNewPlayer, player, instance } = this.context;
    console.log(">>", this.context.instance);

    if (!connected) {
      console.log("HUD: not connected, redirecting to /app/menu");
      return <Navigate to="/app/menu" replace={true} />;
    }

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
            {instance?.isTown ? (
              <NavLink to="🏡" className="hud-link">
                <div className="hud-button">⛲</div>
              </NavLink>
            ) : (
              <NavLink
                className="hud-link"
                onClick={() => {
                  this.context.sendGlobal("warpToTown");
                }}
              >
                <div className="hud-button">🏙️</div>
              </NavLink>
            )}

            {instance?.systems.includes("char") && (
              <NavLink to="🤔" className="hud-link">
                <div disabled={isNewPlayer} className="hud-button">
                  🤔
                </div>
              </NavLink>
            )}

            {instance?.systems.includes("cross") && (
              <NavLink to="🗺️" className="hud-link">
                <div disabled={isNewPlayer} className="hud-button">
                  🗺️
                </div>
              </NavLink>
            )}

            {instance?.systems.includes("combat") && (
              <NavLink to="⚔️" className="hud-link">
                <div disabled={isNewPlayer} className="hud-button">
                  ⚔️
                </div>
              </NavLink>
            )}

            {/* <NavLink disabled={true} to="🪅" className="hud-link  disabled">
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
            </NavLink> */}
          </div>
        </div>
      </>
    );
  }
}

HUD.contextType = NetContext;
