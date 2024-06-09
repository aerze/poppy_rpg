export enum BadgeType {
  Template,
  SlimeDungeonClear,
  InsideJoke,
  SlimeForestClear,
  JellyCaveClear,
  FirstLevelUp,
  FirstDeath,
}

export class Badge {
  type: BadgeType;
  date: Date;

  constructor(type: BadgeType) {
    this.type = type;
    this.date = new Date();
  }
}
