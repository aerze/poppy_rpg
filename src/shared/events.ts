export const SocketEvents = {
  // Incoming
  DisplayConnected: "DisplayConnected",
  DisplayDisconnected: "DisplayDisconnected",
  PlayerConnected: "PlayerConnected",
  PlayerDisconnected: "PlayerDisconnected",
  AddMonsters: "AddMonsters",
  AddBoss: "AddBoss",
  PlayerAction: "PlayerAction",
  PlayerRevive: "PlayerRevive",

  // Outgoing
  Log: "Log",
  Snapshot: "Snapshot",
  Update: "Update",
  PlayerRegistered: "PlayerRegistered",

  // Built-In
  Connect: "connect",
  Disconnect: "disconnect",

  // Display Clients
  PlayerStanceChange: "PlayerStanceChange",
  PlayerRevived: "PlayerRevived",
  PlayerHealed: "PlayerHealed",
  PlayerAttacked: "PlayerAttacked",
  MonsterAttacked: "MonsterAttacked",
  PlayerDied: "PlayerDied",
  MonsterDied: "MonsterDied",
};
