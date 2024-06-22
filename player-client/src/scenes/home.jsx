import { useState } from "react";
import "./home.scss";

export function HomeScene() {
  const [tab, setTab] = useState(0);
  const handleTab = (target) => () => setTab(target);

  return (
    <div class="home-scene">
      <div class="tab-container row full-width">
        <button class="tab" onClick={handleTab(0)}>
          Badges
        </button>
        <button class="tab" onClick={handleTab(1)}>
          Titles
        </button>
      </div>
      <div className="tab-content">
        {tab === 0 && (
          <div class="badge-tab full-height">
            <div className="badge-display column">
              <div class="badge-shelf row">
                <img className="trophy-badge" src="/images/badges3.png"></img>
                <img className="trophy-badge" src="/images/badges4.png"></img>
                <img className="trophy-badge" src="/images/badges5.png"></img>
              </div>
              <div class="badge-content column">
                <p className="badge-description">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit porro, temporibus eveniet quisquam
                  veritatis dolorem labore nobis quos distinctio dolore adipisci inventore ad ipsam architecto optio
                  explicabo. Minima, nisi velit!
                </p>
              </div>
            </div>
            <div class="badge-list-container column">
              <div class="badge-list row">
                <img className="badge" src="/images/badges3.png"></img>
                <img className="badge" src="/images/badges3.png"></img>
                <img className="badge" src="/images/badges3.png"></img>
                <img className="badge" src="/images/badges3.png"></img>
                <img className="badge" src="/images/badges3.png"></img>
                <img className="badge" src="/images/badges3.png"></img>
                <img className="badge" src="/images/badges3.png"></img>
                <img className="badge" src="/images/badges3.png"></img>
                <img className="badge" src="/images/badges3.png"></img>

                <img className="badge" src="/images/badges4.png"></img>
                <img className="badge" src="/images/badges4.png"></img>
                <img className="badge" src="/images/badges4.png"></img>
                <img className="badge" src="/images/badges4.png"></img>
                <img className="badge" src="/images/badges4.png"></img>
                <img className="badge" src="/images/badges4.png"></img>

                <img className="badge" src="/images/badges3.png"></img>
                <img className="badge" src="/images/badges3.png"></img>
                <img className="badge" src="/images/badges3.png"></img>
                <img className="badge" src="/images/badges3.png"></img>
                <img className="badge" src="/images/badges3.png"></img>
                <img className="badge" src="/images/badges3.png"></img>
              </div>
            </div>
          </div>
        )}
        {tab === 1 && (
          <div class="title-tab">
            <div class="title-display">
              <div className="active-title"></div>
            </div>
            <div class="title-content">
              <p className="title-description"></p>
            </div>
            <div class="title-list">
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
