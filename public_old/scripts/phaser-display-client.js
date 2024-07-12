const socket = io();

class Display extends Phaser.Scene {
  preload() {
    this.load.image("background", "images/background_forest.png");
    this.load.image("abby_test", "sprites/abby_test.png");
    this.load.image("tay_test", "sprites/tay_test.png");
    this.load.image("slime1", "images/slime1.png");
    this.load.image("slime2", "images/slime2.png");
    this.load.image("slime3", "images/slime3.png");
    this.load.image("slime4", "images/slime4.png");
    this.load.image("slime5", "images/slime5.png");
  }

  presetMap = {
    a: "tay_test",
    b: "abby_test",
    c: "tay_test",
    d: "abby_test",
  };

  defaultText = {
    fontFamily: "Yuruka",
    fontSize: 50,
    fontWeight: "bold",
    stroke: "#000",
    strokeThickness: 4,
  };

  playerMap = new Map();
  playerSpriteMap = new Map();

  monsterMap = new Map();
  monsterSpriteMap = new Map();

  createPlayer(player) {
    console.log(">> creating player", player);
    const playerGroup = this.physics.add.group();
    const playerSprite = this.physics.add.sprite(200, 200, this.presetMap[player.preset]);

    this.playerSpriteMap.set(player.id, playerGroup);
    this.playerMap.set(player.id, player);

    window.sprite = playerSprite;

    playerSprite.scale = 1 / 3;
    playerSprite.body.setCollideWorldBounds(true);
    playerSprite.body.setEnable(false);
  }

  yeet = (gob = window.sprite) => {
    gob.body.setEnable(true);
    gob.body.setVelocity(5000, -50);
    gob.body.setDrag(50, 50);
    gob.body.setBounce(0.8, 0.8);
    gob.body.setMass(3);
  };

  updatePlayer(player) {
    this.playerMap.set(player.id, player);
    const playerSprite = this.playerSpriteMap.get(player.id);
    if (playerSprite) {
    }
  }

  removePlayer(player) {
    this.playerMap.delete(player.id, player);
    const playerSprite = this.playerSpriteMap.get(player.id);
    if (playerSprite) {
      playerSprite.destroy();
    }
    this.playerSpriteMap.delete(player.id);
  }

  createMonster() {}

  updateMonster() {}

  removeMonster() {}

  create() {
    this.tilesprite = this.add.tileSprite(2560 / 2, 400 / 2, 2560, 400, "background");
    this.tilesprite.setTileScale(2 / 3);
    this.connectionString = this.add.text(2300, 0, "DISCONNECTED", {
      ...this.defaultText,
      fontSize: 30,
      strokeThickness: 2,
    });
    this.titleString = this.add.text(0, 0, "Lost", this.defaultText);

    const particles = this.add.particles(0, 0, "red", {
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: "ADD",
    });

    const logo = this.physics.add.image(400, 100, "logo");

    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    particles.startFollow(logo);

    this.socket = io();
    this.socket.on(SocketEvents.Connect, this.handleSocketConnection);
    this.socket.on(SocketEvents.Disconnect, this.handleSocketDisconnection);
    this.socket.on(SocketEvents.Snapshot, this.handleSocketSnapshot);
  }

  handleSocketConnection = () => {
    console.log(">> CONNECTED");
    this.connectionString.setText("CONNECTED");
    this.socket.emit(SocketEvents.DisplayConnected);
  };

  handleSocketDisconnection = () => {
    console.log(">> DISCONNECTED");
    this.connectionString.setText("DISCONNECTED");
  };

  handleSocketSnapshot = ([type, snapshot]) => {
    const { players, monsters, dungeon } = snapshot;
    this.titleString.setText(`${dungeon.name} - Stage:${dungeon.currentRoom}/${dungeon.roomCount}`);

    // current player tracker
    const playerIds = new Set(this.playerMap.keys());

    for (const player of players) {
      playerIds.delete(player.id);

      const playerExists = this.playerMap.has(player.id);
      if (playerExists) {
        console.log("update player");
        this.updatePlayer(player);
      } else {
        console.log("create player");
        this.createPlayer(player);
      }
    }

    for (const playerId of playerIds) {
      const player = this.playerMap.get(playerId);
      if (player) this.removePlayer(player);
    }

    const monsterIds = new Set(this.monsterMap.keys());

    for (const monster of monsters) {
      monsterIds.delete(monster.id);

      const monsterExists = this.monsterMap.has(monster.id);
      if (monsterExists) {
        this.updateMonster(monster);
      } else {
        this.createMonster(monster);
      }
    }

    for (const monsterId of monsterIds) {
      const monster = this.monsterMap.get(monsterId);
      if (monster) this.removeMonster(monster);
    }
  };

  update() {}
}

const config = {
  parent: document.body,
  createContainer: true, // create DOM container
  type: Phaser.AUTO,
  width: 2560,
  height: 400,
  scene: Display,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
    },
  },
  fps: {
    target: 60,
  },
};

const game = new Phaser.Game(config);
window.game = game;
window.scene = () => game.scene.scenes[0];

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
