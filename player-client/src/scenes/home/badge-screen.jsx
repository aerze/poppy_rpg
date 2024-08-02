import React from "react";

export class BadgeScreen extends React.Component {
  componentDidMount() {
    // fetch list of badges
    // fetch list of displayed badges
  }

  handleDisplayBadge() {
    // tell server about new badge placement
    // update local list
  }

  render() {
    return (
      <div className="badge-tab full-height">
        <div className="badge-display column">
          <div className="badge-shelf row">
            <img className="trophy-badge" src="/app/images/badges3.png"></img>
            <img className="trophy-badge" src="/app/images/badges4.png"></img>
            <img className="trophy-badge" src="/app/images/badges5.png"></img>
          </div>
          <div className="badge-content column">
            <p className="badge-description">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit porro, temporibus eveniet quisquam veritatis
              dolorem labore nobis quos distinctio dolore adipisci inventore ad ipsam architecto optio explicabo.
              Minima, nisi velit!
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
    );
  }
}
