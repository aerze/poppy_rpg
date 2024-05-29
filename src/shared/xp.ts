export function getLevelRequirement(level: number) {
  if (level === 1) {
    return 4;
  }

  return Math.pow(level, 3);
}

export function scaleStat(level: number, base: number) {
  return Math.floor(base * (1 + 0.2 * level));
}
