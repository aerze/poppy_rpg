import { Socket } from "socket.io";
import { Badge, BadgeType } from "./badge";

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
  banner: [{ type: number; date: Date }];
}

export interface PlayerUserData extends Partial<SavedPlayerData> {
  name: string;
  action: string;
  nextAction: string;
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
  nextAction: string | null;
  maxHealth: number;
  health: number;
  attack: number;
  defense: number;
  heal: number;

  type: string;
  level: number;
  xp: number;
  banner: Badge[];
  bannerSet: Set<BadgeType>;

  constructor(data: SavedPlayerData | PlayerUserData, socket: Socket) {
    console.log(data);
    this.id = "";
    this.socket = socket;
    this.name = data.name ?? "Stranger";
    this.action = data.action ?? "attack";
    this.nextAction = null;
    this.color = data.color ?? "#b00b1e";
    this.active = data.active ?? true;
    this.preset = data.preset ?? "a";
    this.job = data.job ?? "";
    const job = Player.JOBS[this.job];
    this.maxHealth = data.maxHealth ?? job.maxHealth;
    this.health = data.health ?? job.health;
    this.attack = data.attack ?? job.attack;
    this.defense = data.defense ?? job.defense;
    this.heal = data.heal ?? job.heal;
    this.type = data.type ?? "";
    this.level = data.level ?? 1;
    this.xp = data.xp ?? 0;
    this.banner = data.banner ?? [];
    this.bannerSet = new Set(this.banner.map((b) => b.type));
  }

  addBadge(badgeType: BadgeType) {
    if (this.bannerSet.has(badgeType)) return false;
    const badge = new Badge(badgeType);
    this.banner.push(badge);
    this.bannerSet.add(badgeType);
    return true;
  }

  updatePlayerClient() {
    this.socket.emit("Update", this);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      action: this.action,
      nextAction: this.nextAction,
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
      banner: this.banner,
    };
  }
}
