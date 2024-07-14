import "./debug.scss";
import { useContext } from "react";
import { SocketContext } from "../context/socket";

export function Debug() {
  const { connected } = useContext(SocketContext);
  return (
    <div className="debug-container">
      <div className="connection-light">
        <div className={`light ${connected ? "green" : "red"}`}></div>
      </div>
    </div>
  );
}
