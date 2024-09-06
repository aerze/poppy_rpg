import { Monster, MonsterBase } from "../monster";

export class Slime extends Monster {
  static BLUE_SLIME: MonsterBase = {
    name: "Blue Slime",
    color: "#0000FF",
    health: [6, 16],
    attack: [3, 5],
    defense: [1, 2],
    heal: [1, 2],
    xp: [8, 10],
    asset: "slime2.png",
  };

  static GREEN_SLIME: MonsterBase = {
    name: "Green Slime",
    color: "#00FF00",
    health: [2, 8],
    attack: [1, 4],
    defense: [1, 2],
    heal: [2, 4],
    xp: [8, 10],
    asset: "slime3.png",
  };

  static RED_SLIME: MonsterBase = {
    name: "Red Slime",
    color: "#FF0000",
    health: [8, 20],
    attack: [1, 4],
    defense: [1, 2],
    heal: [1, 2],
    xp: [8, 10],
    asset: "slime1.png",
  };

  static BOSS_SLIME: MonsterBase = {
    name: "Super Bear Slime",
    color: "#0000FF",
    health: [25, 40],
    attack: [2, 6],
    defense: [2, 4],
    heal: [1, 2],
    xp: [8, 10],
    asset: "slime4.png",
  };

  static KING_SLIME: MonsterBase = {
    name: "King Slime",
    health: [5000, 6000],
    attack: [20, 50],
    defense: [40, 60],
    heal: [50, 51],
    color: "#AB00B5",
    xp: [10000, 50000],
    asset: "slime5.png",
  };
}
