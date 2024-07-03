import { Equipment } from "../types";
import { Ability } from "./abilities";

export const FISHING_CAP: Equipment = {
  name: "Fishing Cap",
  imageUrl: "",
  stats: {
    defense: 1,
    speed: -1,
  },
  abilities: {
    [Ability.Fishing]: 1,
  },
};
