import { useState } from "react";
import "./home.scss";
import { BadgeScreen } from "./home/badge-screen";

export function HomeScene() {
  const [tab, setTab] = useState(0);
  const handleTab = (target) => () => setTab(target);

  return (
    <div className="home-scene">
      <div className="tab-container row full-width">
        <button className="tab" onClick={handleTab(0)}>
          Badges
        </button>
        <button disabled={true} className="tab" onClick={handleTab(1)}>
          Titles
        </button>
      </div>
      <div className="tab-content">
        {tab === 0 && <BadgeScreen />}
        {tab === 1 && (
          <div className="title-tab">
            <div className="title-display">
              <div className="active-title"></div>
            </div>
            <div className="title-content">
              <p className="title-description"></p>
            </div>
            <div className="title-list">
              <div className="title"></div>
              <div className="title"></div>
              <div className="title"></div>
              <div className="title"></div>
              <div className="title"></div>
              <div className="title"></div>
              <div className="title"></div>
              <div className="title"></div>
              <div className="title"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
