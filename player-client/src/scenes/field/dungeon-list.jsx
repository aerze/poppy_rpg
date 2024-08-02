import "./dungeon-list.scss";
import React from "react";
import { SocketContext } from "../../context/socket";

export class DungeonListScreen extends React.Component {
  render() {
    const dungeonInfo = this.context.dungeonInfo;
    return (
      <>
        <div className="battle-screen">
          <div className="dungeon-info-container">
            <div className="dungeon-info">
              <div className="dungeon-title">{dungeonInfo?.name ?? "Select a Dungeon"}</div>
            </div>
            {dungeonInfo && (
              <div
                className="join-dungeon"
                onClick={() => {
                  this.context.joinDungeon();
                }}
              >
                JOIN
              </div>
            )}
          </div>
        </div>
        <div className="battle-controls">
          <div className="dungeon-list">
            {this.context.dungeons.map((dungeon) => {
              return (
                <div
                  key={dungeon.id}
                  className="dungeon-item"
                  onClick={(event) => this.context.getDungeonInfo(dungeon.id)}
                >
                  {dungeon.type === 0 && <div className="dungeon-tag">LIVE ON TWITCH</div>}
                  <div className="dungeon-title">{dungeon.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }
}

DungeonListScreen.contextType = SocketContext;
