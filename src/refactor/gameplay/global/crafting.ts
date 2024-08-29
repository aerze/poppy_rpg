import { Material, MaterialRequirement } from "./materials";

export type Recipe = {
  input: MaterialRequirement[];
  output: ItemFactory;
  // tool?: Item
};

export type ItemFactory = (input: Material[]) => Item;

export type ItemDefinition = {
  id: string;
  assetUrl: string;
  description: string;
  // price: number
};

export type Item = {
  id: string;
  def: ItemDefinition["id"];
  durability: number;
};
