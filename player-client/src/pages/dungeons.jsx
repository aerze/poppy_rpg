import React, { useContext, useEffect } from "react";
import "./dungeons.scss";
import { SocketContext } from "../context/socket";
import { Navigate } from "react-router-dom";

export function BattleRedirect() {
  const { battle } = useContext(SocketContext);
  console.log(">> BR", battle);

  if (battle) {
    return <Navigate to="/app/🐸/✨/battle" replace={true} />;
  }
}

export class Dungeons extends React.Component {
  render() {
    if (this.context.isNewPlayer) {
      return <Navigate to="/app/🐸/🤔" replace={true} />;
    }

    return (
      <div className="simple-container column-reverse dungeons main-background">
        <BattleRedirect />
        <div className="hud-bottom-buffer"></div>
        <DungeonList />
        <DungeonPreview />
        <div className="hud-top-buffer"></div>
      </div>
    );
  }
}
Dungeons.contextType = SocketContext;

function DungeonPreview() {
  const { dungeonInfo, joinDungeon } = useContext(SocketContext);
  return (
    <div className="dungeon-preview">
      <div className="dungeon-title">{dungeonInfo?.name ?? "Select a Dungeon"}</div>
      <div className="dungeon-button">
        {dungeonInfo && (
          <div
            className="join-dungeon"
            onClick={() => {
              joinDungeon();
            }}
          >
            JOIN
          </div>
        )}
      </div>
    </div>
  );
}

export class DungeonList extends React.Component {
  componentDidMount() {
    this.context.updateDungeonList();
  }

  render() {
    return (
      <div className="dungeon-list">
        {this.context.dungeons.map((dungeon) => {
          return (
            <div key={dungeon.id} className="dungeon-item" onClick={(event) => this.context.getDungeonInfo(dungeon.id)}>
              {dungeon.type === 0 && <div className="dungeon-tag">LIVE ON TWITCH</div>}
              <div className="dungeon-title">{dungeon.name}</div>
            </div>
          );
        })}
      </div>
    );
  }
}
DungeonList.contextType = SocketContext;
