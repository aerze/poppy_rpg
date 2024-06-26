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
  DeleteMonsters: "DeleteMonsters",
  ReviveParty: "ReviveParty",

  // Outgoing
  Log: "Log",
  Snapshot: "Snapshot",
  Update: "Update",
  PlayerRegistered: "PlayerRegistered",
  PlayerUpdate: "PlayerUpdate",
  PlayerUpdated: "PlayerUpdated",

  // Built-In
  Connect: "connect",
  Disconnect: "disconnect",

  // Display Clients
  PlayerStanceChange: "PlayerStanceChange",
  PlayerRevived: "PlayerRevived",
  ReadyPlayerHeal: "ReadyPlayerHeal",
  PlayerHealed: "PlayerHealed",
  ReadyPlayerAttack: "ReadyPlayerAttack",
  PlayerAttacked: "PlayerAttacked",
  ReadyEnemyAttack: "ReadyEnemyAttack",
  MonsterAttacked: "MonsterAttacked",
  PlayerDied: "PlayerDied",
  MonsterDied: "MonsterDied",
  Play: "Play",
  Pause: "Pause",
  RoundStart: "RoundStart",
  PlayerTurn: "PlayerTurn",
  EnemyTurn: "EnemyTurn",
  RoundEnd: "RoundEnd",
};
