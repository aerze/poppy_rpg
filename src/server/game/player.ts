import { Socket } from "socket.io";

export interface SavedPlayerData {
  name: string;
  action: string;
  color: string;
  job: keyof typeof Player.JOBS;
  active: boolean;
  preset: string;
  maxHealth: number;
  health: number;
  attack: number;
  defense: number;
  heal: number;
  type: string;
  level: number;
  xp: number;
}

export interface PlayerUserData extends Partial<SavedPlayerData> {
  name: string;
  action: string;
  color: string;
  job: keyof typeof Player.JOBS;
  active: boolean;
}

export interface PlayerExistingData {
  playerId: string;
}

export class Player {
  static ACTION = {
    ATTACK: "attack",
    DEFEND: "defend",
    HEAL: "heal",
  };

  static JOBS = {
    healer: {
      maxHealth: 50,
      health: 50,
      attack: 1,
      defense: 2,
      heal: 5,
    },
    tank: {
      maxHealth: 120,
      health: 120,
      attack: 2,
      defense: 5,
      heal: 1,
    },
    knight: {
      maxHealth: 80,
      health: 80,
      attack: 4,
      defense: 2,
      heal: 3,
    },
  };

  id: string;
  socket: Socket;
  name: string;
  active: boolean;
  color: string;
  preset: string;
  job: keyof typeof Player.JOBS;

  action: string;
  maxHealth: number;
  health: number;
  attack: number;
  defense: number;
  heal: number;

  type: string;
  level: number;
  xp: number;

  constructor(data: SavedPlayerData | PlayerUserData, socket: Socket) {
    this.id = "";
    this.socket = socket;
    this.name = data.name ?? "Stranger";
    this.action = data.action ?? "attack";
    this.color = data.color ?? "#b00b1e";
    this.active = data.active ?? true;
    this.preset = data.preset ?? "a";
    this.job = data.job ?? "";
    console.log(data);
    const job = Player.JOBS[this.job];
    this.maxHealth = data.maxHealth ?? job.maxHealth;
    this.health = data.health ?? job.health;
    this.attack = data.attack ?? job.attack;
    this.defense = data.defense ?? job.defense;
    this.heal = data.heal ?? job.heal;
    this.type = data.type ?? "";
    this.level = data.level ?? 1;
    this.xp = data.xp ?? 0;
  }

  updatePlayerClient() {
    this.socket.emit("Update", this);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      action: this.action,
      color: this.color,
      active: this.active,
      preset: this.preset,
      job: this.job,
      maxHealth: this.maxHealth,
      health: this.health,
      attack: this.attack,
      defense: this.defense,
      heal: this.heal,
      type: this.type,
      level: this.level,
      xp: this.xp,
    };
  }
}
