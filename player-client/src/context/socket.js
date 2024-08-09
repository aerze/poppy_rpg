import { Component, createContext } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export const SCREENS = {
  DUNGEON_LIST: 0,
  BATTLEFIELD: 1,
};

/**
 * @readonly
 * @enum {number}
 */
export const DataType = {
  DUNGEON_LIST: 0,
  DUNGEON_INSTANCE_LIST: 1,
  DUNGEON_INSTANCE_INFO: 2,
  JOIN_DUNGEON: 3,
  LEAVE_DUNGEON: 4,
  BATTLE_SET_ACTION: 5,
  BATTLE_SET_ASSIST: 6,
  BATTLE_SET_TARGET: 7,
  GET_PLAYER: 8,
  UPDATE_PLAYER: 9,
  ASSIGN_STAT_POINTS: 10,
};

export class SocketProvider extends Component {
  state = {
    connected: false,
    newPlayer: null,
    player: null,
    dungeons: [],
    dungeonInfo: undefined,
    battle: undefined,
    timer: undefined,
    fieldScreen: SCREENS.DUNGEON_LIST,
  };

  socket = null;

  connect = () => {
    console.log(">> connect");
    if (!this.socket) {
      this.socket = io("localhost:3000");
      this.socket.on("connect", this.handleConnect);
      this.socket.on("disconnect", this.handleDisconnect);
    } else {
      this.socket.connect();
    }
  };

  /**
   * @param {DataType} dataType
   * @param {*} options
   * @param {*} callback
   */
  send(dataType, options = null, callback) {
    this.socket.emit("RPG:REQUEST", dataType, options, callback);
  }

  handleConnect = () => {
    console.log("handleConnect");
    this.setState({ connected: true });
    this.socket.on("RPG:Error", this.handleError);
    this.socket.on("RPG:PLAYER_INFO_UPDATED", this.handlePlayerInfoUpdated);
    this.socket.on("RPG:DUNGEON", this.handleDungeonUpdate);
    this.socket.once("RPG:SIGN_IN", this.handleSignIn);
    this.socket.once("RPG:SIGN_UP", this.handleSignUp);
  };

  updatePlayer = (playerInfo, callback) => {
    this.send(DataType.UPDATE_PLAYER, { playerInfo }, (player) => {
      this.setState((state) => ({
        ...state,
        player: {
          ...state.player,
          ...player,
        },
      }));
      callback();
    });
  };

  handleError = ({ message, error }) => {
    console.error(message, error);
  };

  handlePlayerInfoUpdated = (playerInfo) => {};

  handleDisconnect = () => {
    console.log(">> Client Disconnected");
    this.setState({ connected: false });
  };

  handleSignIn = (player) => {
    console.log(">> RPG:SIGN_IN");
    this.socket.off("RPG:SIGN_UP");
    this.setState({ player });
    this.updateDungeonList();
  };

  handleSignUp = ({ name }) => {
    console.log(">> RPG:SIGN_UP");
    this.socket.off("RPG:SIGN_IN");
    this.socket.once("RPG:COMPLETED_SIGN_UP", this.handleCompletedSignUp);
    this.setState({ newPlayer: true, player: { name } });
  };

  handleCompletedSignUp = (player) => {
    console.log(">> RPG:COMPLETED_SIGN_UP");
    this.setState({ player, newPlayer: false });
  };

  updateDungeonList = () => {
    this.send(DataType.DUNGEON_LIST, null, (dungeons) => {
      this.setState({ dungeons });
    });
  };

  getDungeonInfo = (dungeonId) => {
    this.setState({ dungeonInfo: this.state.dungeons.find((d) => d.id === dungeonId) });
  };

  joinDungeon = () => {
    const dungeonId = this.state.dungeonInfo.id;
    if (dungeonId === undefined) return;
    this.send(DataType.JOIN_DUNGEON, { dungeonId }, (dungeonJoined) => {
      if (dungeonJoined) {
        this.setState({ fieldScreen: SCREENS.BATTLEFIELD });
      }
    });
  };

  leaveDungeon = () => {
    this.send(DataType.LEAVE_DUNGEON, null, (result) => {
      if (result) {
        this.setState({ fieldScreen: SCREENS.DUNGEON_LIST });
      }
    });
  };

  handleDungeonUpdate = ({ battle }) => {
    console.log("DUNGEON >>", battle);
    this.setState((state) => {
      return {
        ...state,
        battle: {
          ...state.battle,
          ...battle,
        },
      };
    });
  };

  refreshPlayer = () => {
    this.send(DataType.GET_PLAYER, null, (player) => {
      this.handlePlayerUpdate({ player });
    });
  };

  handlePlayerUpdate = ({ player }) => {
    console.log("PLAYER >>", player);
    this.setState((state) => {
      return {
        ...state,
        player: {
          ...state.player,
          ...player,
        },
      };
    });
  };

  render() {
    const value = {
      socket: this.socket,

      connected: this.state.connected,
      isNewPlayer: this.state.newPlayer,
      player: this.state.player,
      dungeons: this.state.dungeons,
      dungeonInfo: this.state.dungeonInfo,
      battle: this.state.battle,
      fieldScreen: this.state.fieldScreen,

      connect: this.connect,
      send: this.send,
      updatePlayer: this.updatePlayer,
      updateDungeonList: this.updateDungeonList,
      getDungeonInfo: this.getDungeonInfo,
      joinDungeon: this.joinDungeon,
      leaveDungeon: this.leaveDungeon,
      refreshPlayer: this.refreshPlayer,
    };

    return <SocketContext.Provider value={value}>{this.props.children}</SocketContext.Provider>;
  }
}
