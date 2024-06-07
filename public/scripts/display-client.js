const SocketEvents = {
  // Incoming
  DisplayConnected: "DisplayConnected",
  DisplayDisconnected: "DisplayDisconnected",
  PlayerConnected: "PlayerConnected",
  PlayerDisconnected: "PlayerDisconnected",
  AddMonsters: "AddMonsters",
  AddBoss: "AddBoss",
  PlayerAction: "PlayerAction",
  PlayerRevive: "PlayerRevive",
  DeleteMonsters: "DeleteMonsters",
  ReviveParty: "ReviveParty",

  // Outgoing
  Log: "Log",
  Snapshot: "Snapshot",
  Update: "Update",
  PlayerRegistered: "PlayerRegistered",

  // Built-In
  Connect: "connect",
  Disconnect: "disconnect",

  // Display Clients
  PlayerStanceChange: "PlayerStanceChange",
  PlayerRevived: "PlayerRevived",
  PlayerHealed: "PlayerHealed",
  PlayerAttacked: "PlayerAttacked",
  MonsterAttacked: "MonsterAttacked",
  PlayerDied: "PlayerDied",
  MonsterDied: "MonsterDied",
  Play: "Play",
  Pause: "Pause",
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Sprite {
  static PresetMap = {
    a: "/sprites/tay_test.png",
    b: "/sprites/abby_test.png",
    c: "/sprites/tay_test.png",
    d: "/sprites/abby_test.png",
  };

  constructor(type, data) {
    this.id = data.id;
    this.type = type;
    this.asset = data.asset;
    this.data = data;
    this.x = 0;
    this.y = 0;
    this.elements = this.createBaseElements();
    this.root = this.elements.base;
  }

  initPosition(x, y) {
    this.initialPosition = [x, y];
    this.x = x;
    this.y = y;
  }

  resetPosition() {
    this.x = this.initialPosition[0];
    this.y = this.initialPosition[1];
    this.updatePosition();
  }

  createBaseElements() {
    const base = document.createElement("div");
    base.classList.add("sprite");

    const image = document.createElement("img");
    if (this.asset) {
      image.classList.add("monster");
      image.src = `images/${this.asset}`;
    } else {
      image.src = Sprite.PresetMap[this.data.preset];
    }
    base.appendChild(image);

    const hud = document.createElement("div");
    base.appendChild(hud);
    hud.style.backgroundColor = `${this.data.color}44`;
    hud.classList.add("hud");

    const name = document.createElement("h5");
    hud.appendChild(name);
    name.classList.add("name");

    const job = document.createElement("p");
    hud.appendChild(job);
    job.classList.add("job");

    const hpLabel = document.createElement("label");
    hud.appendChild(hpLabel);
    hpLabel.classList.add("hpLabel");

    const hpBar = document.createElement("progress");
    hud.appendChild(hpBar);
    hpBar.classList.add("hpBar");

    // const stance = document.createElement('p');
    // hud.appendChild(stance);
    // hpBar.classList.add("stance");

    document.body.appendChild(base);

    return {
      base,
      hud,
      name,
      job,
      hpLabel,
      hpBar,
      // stance
    };
  }

  updatePosition() {
    this.elements.base.style.top = `${this.y}px`;
    this.elements.base.style.left = `${this.x}px`;
  }

  update(data) {
    this.data = data;
    this.elements.name.innerText = this.data.name;
    this.elements.job.innerText = `Lv:${this.data.level} ${this.data.job ?? ""}`;
    this.elements.hpLabel.innerText = `hp:${this.data.health}/${this.data.maxHealth}`;
    this.elements.hpBar.value = this.data.health;
    this.elements.hpBar.max = this.data.maxHealth;

    this.updatePosition();

    if (this.type === "player") {
      // this.elements.stance.innerText = this.data.action.toUpperCase();
      if (this.data.active) {
        this.elements.base.style.opacity = "1";
      } else {
        this.elements.base.style.opacity = "0.33";
      }
    }
  }

  remove() {
    // this.elements.name.remove();
    // this.elements.job.remove();
    // this.elements.hpLabel.remove();
    // this.elements.hpBar.remove();
    // this.elements.hud.remove();
    this.elements.base.remove();
  }
}

const scene = {
  TOP: 0,
  BOTTOM: 600,
  LEFT: 0,
  RIGHT: 800,

  /** @type {Map<string, CharacterSprite>} */
  spriteMap: new Map(),

  playerSpawn: {
    left: 150,
    right: 500,
    top: 200,
    bottom: 250,
  },

  monsterSpawn: {
    left: 1200,
    right: 1600,
    top: 150,
    bottom: 250,
  },

  playerAnchor: [900, 150],
  healerAnchor: [825, 150],
  monsterAnchor: [1100, 200],

  previousPlayerId: 0,
  previousHealerId: 0,
  previousMonsterId: 0,

  moveSpriteTo(spriteId, position) {
    const playerChanged = spriteId == position.spriteId;
    if (!playerChanged) return;

    const prevPlayer = this.spriteMap.get(this.previousPlayerId);
    if (prevPlayer) {
      prevPlayer.resetPosition();
    }

    const player = this.spriteMap.get(spriteId);
    if (!player) return;
  },

  setPlayer(id) {
    const prevPlayer = this.spriteMap.get(this.previousPlayerId);
    if (prevPlayer) {
      prevPlayer.resetPosition();
    }

    const player = this.spriteMap.get(id);
    if (!player) return;

    const [anchorX, anchorY] = this.playerAnchor;

    this.previousPlayerId = player.id;
    player.x = anchorX;
    player.y = anchorY;

    player.updatePosition();
  },

  setHealer(id) {
    const prevHealer = this.spriteMap.get(this.previousHealerId);
    if (prevHealer) {
      prevHealer.resetPosition();
    }

    const player = this.spriteMap.get(id);
    if (!player) return;

    const [anchorX, anchorY] = this.healerAnchor;

    this.previousHealerId = player.id;
    player.x = anchorX;
    player.y = anchorY;

    player.updatePosition();
  },

  setMonster(id) {
    const prevMonster = this.spriteMap.get(this.previousMonsterId);
    if (prevMonster) {
      prevMonster.resetPosition();
    }

    const monster = this.spriteMap.get(id);
    if (!monster) return;

    const [anchorX, anchorY] = this.monsterAnchor;

    this.previousMonsterId = monster.id;
    monster.x = anchorX;
    monster.y = anchorY;

    monster.updatePosition();
  },

  animateText(id, number, isDamage, isPlayer) {
    const sprite = this.spriteMap.get(id);
    if (!sprite) return;

    const damageElement = document.createElement("h1");
    const type = isDamage ? "damage" : "heal";
    let x = isPlayer ? sprite.x + 25 : sprite.x + 50;
    let y = sprite.y - 50;

    damageElement.innerText = number;
    damageElement.classList.add("flyaway", type);
    document.body.appendChild(damageElement);
    damageElement.style.top = `${y}px`;
    damageElement.style.left = `${x}px`;

    setTimeout(() => {
      x = isPlayer ? x - getRandomInt(0, 75) : x + getRandomInt(0, 75);
      y = y - getRandomInt(100, 150);
      damageElement.style.top = `${y}px`;
      damageElement.style.left = `${x}px`;
    }, 10);

    // damageElement.style.top = `${sprite.y - 20}px`;
    // damageElement.style.left = `${sprite.x}px`;

    setTimeout(() => {
      damageElement.remove();
    }, 500);
  },

  add(id, data, type) {
    const sprite = new Sprite(type, data);
    this.spriteMap.set(id, sprite);

    switch (type) {
      case "player": {
        const x = getRandomInt(this.playerSpawn.left, this.playerSpawn.right);
        const y = getRandomInt(this.playerSpawn.top, this.playerSpawn.bottom);
        sprite.initPosition(x, y);
        break;
      }

      case "monster": {
        const x = getRandomInt(this.monsterSpawn.left, this.monsterSpawn.right);
        const y = getRandomInt(this.monsterSpawn.top, this.monsterSpawn.bottom);
        sprite.initPosition(x, y);
        break;
      }
    }

    sprite.update(data);
  },

  remove(id) {
    if (this.spriteMap.has(id)) {
      const sprite = this.spriteMap.get(id);
      sprite.remove();
      this.spriteMap.delete(id);
    }
  },

  update(id, data) {
    if (this.spriteMap.has(id)) {
      const sprite = this.spriteMap.get(id);
      sprite.update(data);
    }
  },
};

const dungeonInfo = document.getElementById("dungeon-info");
const addButton = document.getElementById("add");
const addBossButton = document.getElementById("add-boss");
const deleteMonstersButton = document.getElementById("delete-monsters");
const revivePartyButton = document.getElementById("revive-party");
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const playerMap = new Map();
const monsterMap = new Map();
const socket = io();

socket.on(SocketEvents.Connect, () => {
  console.log("Connected");
  socket.emit(SocketEvents.DisplayConnected);
});

dungeonInfo.addEventListener("click", () => {
  document.getElementById("buttons").classList.toggle("hidden");
});

addButton.addEventListener("click", (event) => {
  event.preventDefault();
  socket.emit(SocketEvents.AddMonsters);
});

addBossButton.addEventListener("click", (event) => {
  event.preventDefault();
  socket.emit(SocketEvents.AddBoss);
});

deleteMonstersButton.addEventListener("click", (event) => {
  event.preventDefault();
  socket.emit(SocketEvents.DeleteMonsters);
});

revivePartyButton.addEventListener("click", (event) => {
  event.preventDefault();
  socket.emit(SocketEvents.ReviveParty);
});

playButton.addEventListener("click", (event) => {
  event.preventDefault();
  socket.emit(SocketEvents.Play);
});

pauseButton.addEventListener("click", (event) => {
  event.preventDefault();
  socket.emit(SocketEvents.Pause);
});

socket.on(SocketEvents.Disconnect, () => {
  console.log(">> disconnected");
});

socket.on(SocketEvents.Snapshot, ([type, snapshot]) => {
  console.groupCollapsed(">> snapshot");
  const { players, monsters, dungeon } = snapshot;
  dungeonInfo.innerText = `${dungeon.name} - Stage:${dungeon.currentRoom}/${dungeon.roomCount}`;

  const playerIds = new Set(playerMap.keys());

  for (const player of players) {
    playerIds.delete(player.id);

    const playerExists = playerMap.has(player.id);
    if (playerExists) {
      updatePlayer(player);
    } else {
      createPlayer(player);
    }
  }

  for (const playerId of playerIds) {
    const player = playerMap.get(playerId);
    if (player) removePlayer(player);
  }

  const monsterIds = new Set(monsterMap.keys());

  for (const monster of monsters) {
    monsterIds.delete(monster.id);

    const monsterExists = monsterMap.has(monster.id);
    if (monsterExists) {
      updateMonster(monster);
    } else {
      createMonster(monster);
    }
  }

  for (const monsterId of monsterIds) {
    const monster = monsterMap.get(monsterId);
    if (monster) removeMonster(monster);
  }
  console.groupEnd();
});

socket.on(SocketEvents.PlayerStanceChange, playerStanceChange);

socket.on(SocketEvents.PlayerRevived, playerRevived);

socket.on(SocketEvents.PlayerHealed, playerHealed);

socket.on(SocketEvents.PlayerAttacked, playerAttacked);

socket.on(SocketEvents.MonsterAttacked, monsterAttacked);

socket.on(SocketEvents.PlayerDied, playerDied);

socket.on(SocketEvents.MonsterDied, monsterDied);

function createPlayer(player) {
  console.log(">> createPlayer");

  playerMap.set(player.id, player);
  scene.add(player.id, player, "player");
}

function updatePlayer(player) {
  console.log(">> updatePlayer");

  playerMap.set(player.id, player);
  scene.update(player.id, player);
}

function removePlayer(player) {
  console.log(">> removePlayer");

  scene.remove(player.id);
  playerMap.delete(player.id);
}

function createMonster(monster) {
  console.log(">> createMonster");

  monsterMap.set(monster.id, monster);
  scene.add(monster.id, monster, "monster");
}

function updateMonster(monster) {
  console.log(">> updateMonster");

  monsterMap.set(monster.id, monster);
  scene.update(monster.id, monster);
}

function removeMonster(monster) {
  console.log(">> removeMonster");

  monsterMap.delete(monster.id);
  scene.remove(monster.id);
}

function playerStanceChange([playerId, playerAction]) {
  console.log(">> playerStanceChange");
  const player = playerMap.get(playerId);
  if (player) {
    player.action = playerAction;
    scene.update(player.id, player);
  }
}

function playerRevived(player) {
  console.log(">> playerRevived");
  playerMap.set(player.id, player);
  scene.update(player.id, player);
}

function playerHealed({ healer, target, heal }) {
  console.log(">> playerHealed");
  playerMap.set(target.id, target);
  scene.update(target.id, target);
  scene.setPlayer(target.id);
  scene.setHealer(healer.id);

  if (heal) {
    scene.animateText(target.id, heal, false, true);
  }
}

function playerAttacked({ attacker, target, damage }) {
  console.log(">> playerAttacked");
  monsterMap.set(target.id, target);
  scene.update(target.id, target);
  scene.setPlayer(attacker.id);
  scene.setMonster(target.id);
  if (damage) {
    scene.animateText(target.id, damage, true, false);
  }
}

function monsterAttacked({ monster, target, damage }) {
  console.log(">> monsterAttacked");
  playerMap.set(target.id, target);
  scene.update(target.id, target);
  scene.setPlayer(target.id);
  scene.setMonster(monster.id);
  if (damage) {
    scene.animateText(target.id, damage, true, true);
  }
}

function playerDied(playerId) {
  const player = playerMap.get(playerId);
  if (!player) return;
  player.active = false;
  scene.update(player.id, player);
}

function monsterDied(monsterId) {
  removeMonster(monsterId);
}
