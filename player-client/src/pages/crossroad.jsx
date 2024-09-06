import React from "react";
import "./crossroad.scss";
import { Navigate } from "react-router-dom";
import { NetContext } from "../context/net";

export class Crossroad extends React.Component {
  state = {
    locations: [],
    currentLocation: "",
    loading: false,
  };

  componentDidMount() {
    this.context.send("cross:mount", null, (state) => {
      this.setState(state);
    });
  }

  render() {
    if (this.context.isNewPlayer) {
      return <Navigate to="/app/🐸/🤔" replace={true} />;
    }

    return (
      <div className="simple-container column crossroad main-background">
        <div className="hud-top-buffer"></div>
        <div className="signpost column">
          {this.state.locations.map((location) => (
            <Sign
              key={location.id}
              name={location.name}
              current={this.state.currentLocation === location.id}
              onClick={() => {
                if (this.state.loading || this.state.currentLocation === location.id) return;
                this.setState({ loading: true });
                console.log("traveling to", location.id);
                this.context.send("cross:travel", location.id);
              }}
            ></Sign>
          ))}
        </div>
        <div className="hud-bottom-buffer"></div>
      </div>
    );
  }
}

function Sign({ name, current, onClick }) {
  return (
    <div className={`sign ${current ? "current" : ""}`} onClick={onClick}>
      <div className="label">{name}</div>
      {current && <label className="yah"> YOU ARE HERE </label>}
    </div>
  );
}

Crossroad.contextType = NetContext;
