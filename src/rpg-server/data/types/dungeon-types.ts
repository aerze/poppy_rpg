import { Item } from "../../types";
import { DUNGEONS } from "../dungeon-data";
import { MONSTERS } from "./../monsters";

export enum DungeonInstanceType {
  Live,
  Training,
}

export interface DungeonData {
  floors: Floor[];
}

export interface Floor {
  rooms: Room[];
}

export enum RoomType {
  Combat,
  Boss,
  Healing,
  Gacha,
}

export interface Room {
  type: RoomType;
  combatants?: Array<{
    combatant: Array<(typeof MONSTERS)[keyof typeof MONSTERS]>;
    quantity: number;
    levelRange: [number, number];
  }>;
  loot?: Item[];
}

export interface DungeonType {
  id: keyof typeof DUNGEONS;
  type: DungeonInstanceType;
  name: string;
}
