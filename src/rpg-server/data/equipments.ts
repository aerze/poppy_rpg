import { Equipment } from "../types";
import { SkillType } from "./skills";

export const FISHING_CAP: Equipment = {
  name: "Fishing Cap",
  imageUrl: "",
  stats: {
    defense: 1,
    speed: -1,
  },
  abilities: {
    [SkillType.Fishing]: 1,
  },
};
