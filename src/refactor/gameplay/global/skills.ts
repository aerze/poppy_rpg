export enum SkillType {
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

export type Skills = {
  [type in SkillType]?: number;
};
