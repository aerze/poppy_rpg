import { TeamFlag } from "../behavior/dungeon";
import { Combatant, Monster } from "../types";
import { Player } from "./player";

export function PlayerToCombatant(player: Player, teamFlag: TeamFlag): Combatant {
  return {
    id: player.id,
    type: player.type,
    name: player.name,
    maxHealth: player.maxHealth,
    health: player.health,
    maxMana: player.maxMana,
    mana: player.mana,
    stats: player.stats,
    abilitySlots: player.abilitySlots,
    statuses: player.statuses,
    activeTitle: player.activeTitle,
    level: player.level,
    xp: player.xp,
    defaultAction: player.defaultAction,
    teamFlag,
  };
}

export function MonsterToCombatant(monster: Monster, teamFlag: TeamFlag): Combatant {
  return {
    id: monster.id,
    type: monster.type,
    name: monster.name,
    maxHealth: monster.maxHealth,
    health: monster.health,
    maxMana: monster.maxMana,
    mana: monster.mana,
    stats: monster.stats,
    statuses: [],
    level: monster.level,
    xp: monster.xp,
    defaultAction: monster.defaultAction,
    abilitySlots: monster.abilitySlots,
    teamFlag,
  };
}
