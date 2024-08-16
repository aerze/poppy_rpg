import { Component, createContext } from "react";
import { redirect } from "react-router-dom";
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
    player: {},
    dungeons: [],
    dungeonInfo: undefined,
    battle: undefined,
    timer: undefined,
    town: undefined,
  };

  socket = null;

  connect = () => {
    console.log(">> connect");
    if (!this.socket) {
      this.socket = io("localhost:3000");
      window.socket = this.socket;
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
    // console.log("handleConnect");
    // redirect("/app/town");
    // console.log("did the redirect");
    this.setState({ connected: true });
    this.socket.on("RPG:Error", this.handleError);
    this.socket.on("RPG:PLAYER_INFO_UPDATED", this.handlePlayerInfoUpdated);
    this.socket.on("RPG:DUNGEON", this.handleDungeonUpdate);
    this.socket.on("RPG:ROOM", this.handleLobbyUpdate);
    this.socket.once("RPG:SIGN_IN", this.handleSignIn);
    this.socket.once("RPG:SIGN_UP", this.handleSignUp);
  };

  handleLobbyUpdate = (data) => {
    this.setState((state) => ({
      ...state,
      town: {
        ...state.town,
        ...data,
      },
    }));
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

  createPlayer = (playerInfo, callback) => {
    this.socket.emit("RPG:HANDLE_SIGN_UP", playerInfo);
    this.socket.once("RPG:COMPLETED_SIGN_UP", callback);
  };

  handleError = ({ message, error }) => {
    console.error(message, error);
  };

  handleDisconnect = () => {
    console.log(">> Client Disconnected");
    redirect("/app");
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
    this.setState({ newPlayer: true, player: { name, presetId: 0 } });
  };

  handleCompletedSignUp = (player) => {
    console.log(">> RPG:COMPLETED_SIGN_UP");
    this.setState({ player, newPlayer: false });
  };

  updateDungeonList = () => {
    console.log(">> updating dungeon list");
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
    this.send(DataType.JOIN_DUNGEON, { dungeonId });
  };

  leaveDungeon = () => {
    this.send(DataType.LEAVE_DUNGEON, null, (result) => {
      if (result) {
        this.setState({ battle: undefined });
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
    console.log("socket.render()");
    const value = {
      // local read-only data
      socket: this.socket,
      connected: this.state.connected,
      isNewPlayer: this.state.newPlayer,

      // socket read-only data
      town: this.state.town,
      player: this.state.player,

      // local methods
      connect: this.connect,
      updateLocalPlayer: this.handlePlayerUpdate,

      // socket methods
      send: this.send,
      createPlayer: this.createPlayer,
      updatePlayer: this.updatePlayer,

      dungeons: this.state.dungeons,
      dungeonInfo: this.state.dungeonInfo,
      battle: this.state.battle,
      fieldScreen: this.state.fieldScreen,

      updateDungeonList: this.updateDungeonList,
      getDungeonInfo: this.getDungeonInfo,
      joinDungeon: this.joinDungeon,
      leaveDungeon: this.leaveDungeon,
      refreshPlayer: this.refreshPlayer,
    };

    return <SocketContext.Provider value={value}>{this.props.children}</SocketContext.Provider>;
  }
}
