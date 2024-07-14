import { Component, createContext } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

/**
 * @readonly
 * @enum {number}
 */
export const DataType = {
  DUNGEON_LIST: 0,
  DUNGEON_INFO: 1,
  JOIN_DUNGEON: 2,
  BATTLE_SET_ACTION: 3,
  UPDATE_PLAYER: 4,
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
  sendData(dataType, options = null, callback) {
    this.socket.emit("RPG:REQUEST", dataType, options, callback);
  }

  handleConnect = () => {
    console.log("handleConnect");
    this.setState({ connected: true });
    this.socket.on("RPG:Error", this.handleError);
    this.socket.on("RPG:PLAYER_INFO_UPDATED", this.handlePlayerInfoUpdated);
    this.socket.once("RPG:SIGN_IN", this.handleSignIn);
    this.socket.once("RPG:SIGN_UP", this.handleSignUp);
  };

  updatePlayer = (playerInfo, callback) => {
    this.sendData(DataType.UPDATE_PLAYER, { playerInfo }, (player) => {
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
    this.sendData(DataType.DUNGEON_LIST, null, (dungeons) => {
      this.setState({ dungeons });
    });
  };

  getDungeonInfo = (dungeonId) => {
    this.sendData(DataType.DUNGEON_INFO, { dungeonId }, (dungeonInfo) => {
      this.setState({ dungeonInfo });
    });
  };

  joinDungeon = () => {
    const dungeonId = this.state.dungeonInfo.id;
    if (dungeonId === undefined) return;
    console.log(">> ", dungeonId);
    this.socket.on("RPG:BATTLE", this.handleBattleUpdate);
    this.sendData(DataType.JOIN_DUNGEON, { dungeonId });
  };

  handleBattleUpdate = ({ battle, timer }) => {
    console.log(">> battle", battle, timer);
    this.setState((state) => {
      return {
        timer,
        battle: { ...state.battle, ...battle },
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
      timer: this.state.timer,

      connect: this.connect,
      send: this.sendData,
      updatePlayer: this.updatePlayer,
      updateDungeonList: this.updateDungeonList,
      getDungeonInfo: this.getDungeonInfo,
      joinDungeon: this.joinDungeon,
    };

    return <SocketContext.Provider value={value}>{this.props.children}</SocketContext.Provider>;
  }
}
