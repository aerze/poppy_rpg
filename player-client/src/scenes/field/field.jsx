import "./field.scss";
import { Component } from "react";
import { SCREENS, SocketContext } from "../../context/socket";
import { DungeonListScreen } from "./dungeon-list";
import { DungeonScreen } from "./dungeon-screen";

export class FieldScene extends Component {
  componentDidMount() {
    this.context.updateDungeonList();
  }

  renderScreen() {
    // eslint-disable-next-line default-case
    switch (this.context.fieldScreen) {
      case SCREENS.DUNGEON_LIST:
        return <DungeonListScreen />;

      case SCREENS.BATTLEFIELD:
        return <DungeonScreen />;
      default:
        return "invalid screen id" + this.context.fieldScreen;
    }
  }

  render() {
    return <div className="field-scene">{this.renderScreen()}</div>;
  }
}

FieldScene.contextType = SocketContext;
