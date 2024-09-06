import { Item } from "../global/crafting";
import { Material, MaterialDefinition } from "../global/materials";
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

export type Loot = [drop: Material | MaterialDefinition | Item, dropRate: number];
