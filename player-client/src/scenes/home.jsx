import { useState } from "react";
import "./home.scss";

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
        {tab === 0 && (
          <div className="badge-tab full-height">
            <div className="badge-display column">
              <div className="badge-shelf row">
                <img className="trophy-badge" src="/app/images/badges3.png"></img>
                <img className="trophy-badge" src="/app/images/badges4.png"></img>
                <img className="trophy-badge" src="/app/images/badges5.png"></img>
              </div>
              <div className="badge-content column">
                <p className="badge-description">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit porro, temporibus eveniet quisquam
                  veritatis dolorem labore nobis quos distinctio dolore adipisci inventore ad ipsam architecto optio
                  explicabo. Minima, nisi velit!
                </p>
              </div>
            </div>
            <div className="badge-list-container column">
              <div className="badge-list row">
                <img className="badge" src="/app/images/badges3.png"></img>
                <img className="badge" src="/app/images/badges3.png"></img>
                <img className="badge" src="/app/images/badges3.png"></img>
                <img className="badge" src="/app/images/badges3.png"></img>
                <img className="badge" src="/app/images/badges3.png"></img>
                <img className="badge" src="/app/images/badges3.png"></img>
                <img className="badge" src="/app/images/badges3.png"></img>
                <img className="badge" src="/app/images/badges3.png"></img>
                <img className="badge" src="/app/images/badges3.png"></img>

                <img className="badge" src="/app/images/badges4.png"></img>
                <img className="badge" src="/app/images/badges4.png"></img>
                <img className="badge" src="/app/images/badges4.png"></img>
                <img className="badge" src="/app/images/badges4.png"></img>
                <img className="badge" src="/app/images/badges4.png"></img>
                <img className="badge" src="/app/images/badges4.png"></img>

                <img className="badge" src="/app/images/badges3.png"></img>
                <img className="badge" src="/app/images/badges3.png"></img>
                <img className="badge" src="/app/images/badges3.png"></img>
                <img className="badge" src="/app/images/badges3.png"></img>
                <img className="badge" src="/app/images/badges3.png"></img>
                <img className="badge" src="/app/images/badges3.png"></img>
              </div>
            </div>
          </div>
        )}
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
