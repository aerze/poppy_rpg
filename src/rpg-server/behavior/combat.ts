import { Combatant } from "../data/combatant";

const GLOBAL_CRIT = 1.5;

export interface AttackOptions {}
export const attack = (source: Combatant, target: Combatant) => {
  let damage = source.stats.attack;
  const isCrit = Math.random() <= source.stats.luck / (source.stats.luck + 50);
  if (isCrit) {
    damage *= GLOBAL_CRIT;
  }

  const defenseMultiplier = target.stats.defense / (target.stats.defense + 50);
  damage -= damage * defenseMultiplier;

  const isDodge = Math.random() <= target.stats.luck / (target.stats.luck + 50);
  if (isDodge && target.stats.speed > source.stats.speed) {
    damage = 0;
  }

  target.health = Math.max(0, target.health - damage);
  return damage;
};

export interface HealOptions {}
export const heal = (source: Combatant, target: Combatant) => {
  let health = source.stats.attack;
  const isCrit = Math.random() <= source.stats.luck / (source.stats.luck + 50);
  if (isCrit) {
    health *= GLOBAL_CRIT;
  }

  target.health = Math.min(target.maxHealth, target.health + health);
  return health;
};

// DanktownBunny: this will take the percentage of the player's level and stick it between a min and max stat bonus
// math.max(0, level / 100) * (maxBonus - minBonus) + minBonus
