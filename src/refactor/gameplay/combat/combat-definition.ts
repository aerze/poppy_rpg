import { Item } from "../global/crafting";
import { Material } from "../global/materials";
import { MonsterDefinition } from "./monsters";

export type CombatDefinition = {
  encounters: Encounter[];
  bossEncounter: Encounter[];
};

export type Encounter = {
  roomType: string;
  monsters: MonsterDefinition[];
  loot: Loot[];
};

export type Loot = [drop: Material | Item, dropRate: number];
