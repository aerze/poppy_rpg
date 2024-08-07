import { range } from "../types";
import { MONSTERS } from "./monsters";
import { DungeonType, DungeonInstanceType, Room, RoomType, Floor } from "./types/dungeon-types";

export const DungeonTypes: DungeonType[] = [
  {
    id: "LIVE",
    type: DungeonInstanceType.Live,
    name: "Fairy Forest",
  },
  {
    id: "CHIKEM",
    type: DungeonInstanceType.Training,
    name: "Training: Chikem",
  },
  {
    id: "HORNED_RABBIT",
    type: DungeonInstanceType.Training,
    name: "Training: Horned Rabbit",
  },
];

export const DUNGEONS = {
  LIVE: (): Floor[] => {
    return [
      {
        rooms: [
          makeChikemRoom(2, [30, 30]),
          makeRabbitRoom(12, [1, 2]),
          makeChikemRoom(2, [1, 2]),
          makeRabbitRoom(2, [2, 3]),
          makeChikemRoom(2, [2, 4]),
          {
            type: RoomType.Boss,
            combatants: [
              {
                combatant: [MONSTERS.CHIKEM],
                quantity: 1,
                levelRange: [2, 4],
              },
            ],
          },
        ],
      },

      {
        rooms: [
          makeChikemRoom(3, [2, 4]),
          makeRabbitRoom(3, [2, 4]),
          makeRabbitRoom(3, [3, 4]),
          makeChikemRoom(3, [3, 4]),
          makeChikemRoom(3, [3, 5]),
          {
            type: RoomType.Boss,
            combatants: [
              {
                combatant: [MONSTERS.CHIKEM],
                quantity: 1,
                levelRange: [3, 5],
              },
            ],
          },
        ],
      },

      {
        rooms: [
          makeChikemRoom(5, [3, 5]),
          makeChikemRoom(5, [3, 5]),
          makeRabbitRoom(5, [4, 5]),
          makeChikemRoom(5, [5, 6]),
          makeRabbitRoom(5, [5, 7]),
          {
            type: RoomType.Boss,
            combatants: [
              {
                combatant: [MONSTERS.CHIKEM],
                quantity: 1,
                levelRange: [5, 7],
              },
            ],
          },
        ],
      },

      {
        rooms: [
          makeChikemRoom(7, [5, 7]),
          makeRabbitRoom(7, [6, 7]),
          makeChikemRoom(7, [7, 8]),
          makeChikemRoom(7, [7, 10]),
          makeRabbitRoom(7, [7, 12]),
          {
            type: RoomType.Boss,
            combatants: [
              {
                combatant: [MONSTERS.CHIKEM],
                quantity: 1,
                levelRange: [7, 12],
              },
            ],
          },
        ],
      },
    ];
  },

  CHIKEM: (): Floor[] => {
    return [
      {
        rooms: [
          makeChikemRoom(2, [1, 2]),
          makeChikemRoom(3, [3, 4]),
          makeChikemRoom(5, [4, 5]),
          {
            type: RoomType.Boss,
            combatants: [
              {
                combatant: [MONSTERS.CHIKEM],
                quantity: 1,
                levelRange: [5, 6],
              },
            ],
          },
        ],
      },

      {
        rooms: [
          makeChikemRoom(3, [4, 5]),
          makeChikemRoom(3, [5, 7]),
          makeChikemRoom(3, [6, 8]),
          {
            type: RoomType.Boss,
            combatants: [
              {
                combatant: [MONSTERS.CHIKEM],
                quantity: 1,
                levelRange: [8, 12],
              },
            ],
          },
        ],
      },
    ];
  },

  HORNED_RABBIT: (): Floor[] => {
    return [
      {
        rooms: [
          makeRabbitRoom(2, [1, 2]),
          makeRabbitRoom(3, [3, 4]),
          makeRabbitRoom(5, [4, 5]),
          {
            type: RoomType.Boss,
            combatants: [
              {
                combatant: [MONSTERS.CHIKEM],
                quantity: 1,
                levelRange: [5, 6],
              },
            ],
          },
        ],
      },

      {
        rooms: [
          makeRabbitRoom(3, [4, 5]),
          makeRabbitRoom(3, [5, 7]),
          makeRabbitRoom(3, [6, 8]),
          {
            type: RoomType.Boss,
            combatants: [
              {
                combatant: [MONSTERS.CHIKEM],
                quantity: 1,
                levelRange: [8, 12],
              },
            ],
          },
        ],
      },
    ];
  },
};

const makeChikemRoom = (quantity: number, levels: range): Room => {
  return {
    type: RoomType.Combat,
    combatants: [
      {
        combatant: [MONSTERS.CHIKEM],
        quantity,
        levelRange: levels,
      },
    ],
  };
};

const makeRabbitRoom = (quantity: number, levels: range) => {
  return {
    type: RoomType.Combat,
    combatants: [
      {
        combatant: [MONSTERS.HORNED_RABBIT],
        quantity,
        levelRange: levels,
      },
    ],
  };
};
