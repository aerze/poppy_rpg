export interface Badge {
  id: BadgeType;
  date: Date;
}

export type BadgeData = {
  name: string;
  desc: string;
  tags: BadgeTags[];
};

export enum BadgeTags {
  PoppyRPGPrototype,
  PoppyRPGAlpha,
}

export enum BadgeType {
  Template,
  SlimeDungeonClear,
  InsideJoke,
  SlimeForestClear,
  JellyCaveClear,
  FirstLevelUp,
  FirstDeath,
  Developer,
  Subscriber,
  NameChange,
  SpriteChange,
  ThisIsATest,
}

export const Badges: Record<BadgeType, BadgeData> = {
  [BadgeType.Template]: {
    name: "Template",
    desc: "This is a template badge",
    tags: [BadgeTags.PoppyRPGPrototype],
  },
  [BadgeType.SlimeDungeonClear]: {
    name: "Slime Dungeon: CLEAR",
    desc: "Cleared the Slime Dungeon [PoppyRPG Prototype]",
    tags: [BadgeTags.PoppyRPGPrototype],
  },
  [BadgeType.InsideJoke]: {
    name: "Inside Joke",
    desc: "If you know, you know  [PoppyRPG Prototype]",
    tags: [BadgeTags.PoppyRPGPrototype],
  },
  [BadgeType.SlimeForestClear]: {
    name: "Slime Forest: CLEAR",
    desc: "Cleared the Slime Forest Dungeon [PoppyRPG Prototype]",
    tags: [BadgeTags.PoppyRPGPrototype],
  },
  [BadgeType.JellyCaveClear]: {
    name: "Jelly Cave: CLEAR",
    desc: "Cleared the Jelly Cave Dungeon [PoppyRPG Prototype]",
    tags: [BadgeTags.PoppyRPGPrototype],
  },
  [BadgeType.FirstLevelUp]: {
    name: "First Level Up",
    desc: "Leveled up! [PoppyRPG Prototype]",
    tags: [BadgeTags.PoppyRPGPrototype],
  },
  [BadgeType.FirstDeath]: {
    name: "First Death :C",
    desc: "RIP [PoppyRPG Prototype]",
    tags: [BadgeTags.PoppyRPGPrototype],
  },

  // POPPYRPG ALPHA
  [BadgeType.Developer]: {
    name: "Developer",
    desc: "Has contributed code to PoppyRPG",
    tags: [BadgeTags.PoppyRPGAlpha],
  },
  [BadgeType.Subscriber]: {
    name: "Subscriber",
    desc: "Has subscribed to the Twitch channel",
    tags: [BadgeTags.PoppyRPGAlpha],
  },
  [BadgeType.NameChange]: {
    name: "Name Changer",
    desc: "Has changed name at least once",
    tags: [BadgeTags.PoppyRPGAlpha],
  },
  [BadgeType.SpriteChange]: {
    name: "Sprite Changer",
    desc: "Has changed character sprite at least once",
    tags: [BadgeTags.PoppyRPGAlpha],
  },
  [BadgeType.ThisIsATest]: {
    name: "This is a Test",
    desc: "For testing only.",
    tags: [BadgeTags.PoppyRPGAlpha],
  },
};
