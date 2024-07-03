export enum Ability {
  Emoting,
  Slapping,
  // collecting
  Gathering,
  Herbalism,
  Enchanting,
  Fishing,
  Ranching,
  Lumbering,
  Mining,
  // making
  Alchemy,
  Crafting,
  Cooking,
  WorkWorking,
  Metalworking,
  Tailor,
  // other
  PetCare,
}

export type Abilities = {
  [type in Ability]?: number;
};
