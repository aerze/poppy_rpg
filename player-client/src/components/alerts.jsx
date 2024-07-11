import React, { useCallback, useContext, useState } from "react";
import "./alerts.scss";
import { SocketContext } from "../context/socket";

// TODO: make counter infinite
let alertId = 0;

export class Alerts extends React.Component {
  state = {
    alerts: [],
  };

  componentDidMount() {
    console.log(">> binding alert");
    this.context?.socket.on("RPG:ALERT", this.handleAlert);
  }

  componentWillUnmount() {
    console.log(">> unbinding alert");
    this.context?.socket.off("RPG:ALERT", this.handleAlert);
  }

  handleAlert = (message) => {
    const id = alertId++;
    const alert = {
      id,
      message,
      timeoutId: setTimeout(() => {
        console.log(">>", id);
        this.removeAlert(id);
      }, 3000),
    };

    this.setState((state) => {
      return {
        alerts: [...state.alerts, alert],
      };
    });
  };

  removeAlert = (id) => {
    this.setState((state) => {
      return {
        alerts: state.alerts.filter((a) => a.id !== id),
      };
    });
  };

  render() {
    return (
      <div className="alerts-container">
        {this.state.alerts.map((alert) => (
          <div className="alert" key={alert.id} onClick={() => this.removeAlert(alert.id)}>
            {alert.message}
          </div>
        ))}
      </div>
    );
  }
}

Alerts.contextType = SocketContext;
