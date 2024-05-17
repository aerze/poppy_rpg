const SocketEvents = {
    // Incoming
    DisplayConnected: 'DisplayConnected',
    DisplayDisconnected: 'DisplayDisconnected',
    PlayerConnected: 'PlayerConnected',
    PlayerDisconnected: 'PlayerDisconnected',
    AddMonsters: 'AddMonsters',
    AddBoss: 'AddBoss',
    PlayerAction: 'PlayerAction',
    PlayerRevive: 'PlayerRevive',

    // Outgoing
    Log: "Log",
    Snapshot: "Snapshot",
    Update: "Update",
    PlayerRegistered: "PlayerRegistered",
    
    // Built-In
    Connect: 'connect',
    Disconnect: 'disconnect',
    
    // Display Clients
    PlayerStanceChange: "PlayerStanceChange",
    PlayerRevived: "PlayerRevived",
    PlayerHealed: "PlayerHealed",
    PlayerAttacked: "PlayerAttacked",
    MonsterAttacked: "MonsterAttacked",
    PlayerDied: "PlayerDied",
    MonsterDied: "MonsterDied",
}

function getLevelRequirement(level) {
    if (level === 1) {
        return 4;
    }

    return Math.pow(level, 3);
}

let twitchName = '';
window.Twitch.ext.onAuthorized(async function (auth) {
    const viewerUserId = window.Twitch.ext.viewer.id;
    if (viewerUserId) {
        const defaultOptions = {
            headers: {
                'Authorization': auth.helixToken ? `Extension ${auth.helixToken}` : '',
                'client-id': auth.clientId,
            }
        }

        const response = await fetch(`https://api.twitch.tv/helix/users?id=${viewerUserId}`, defaultOptions)
        const json = await response.json();
        if (json) {
            twitchName = json.data[0].display_name;

            // initializeSocket(auth.userId);
        }
    }
});

const $mainScreen = document.getElementById("main-screen");
const $connectButton = document.getElementById("connect");

const $characterScreen = document.getElementById("character-screen");
const $characterForm = document.getElementById('character-form');
const $characterName = document.getElementById('characterName');

const $gameScreen = document.getElementById("game-screen");
const $playerName = document.getElementById("player-name");
const $playerJob = document.getElementById("player-job");
const $playerHealthBar = document.getElementById("player-hp-bar");
const $playerHealthText = document.getElementById("player-hp-text");
const $playerXPText = document.getElementById("player-xp-text");
const $playerAttack = document.getElementById("player-attack");
const $playerDefense = document.getElementById("player-defense");
const $playerHeal = document.getElementById("player-heal");
const $playerAction = document.getElementById("player-action");
const $attackAction = document.getElementById("attack-action");
const $defendAction = document.getElementById("defend-action");
const $healAction = document.getElementById("heal-action");
const $reviveAction = document.getElementById("revive-action");
const $log = document.getElementById("log");


const screens = {
    screenElements: [$mainScreen, $characterScreen, $gameScreen],
    open(screenToOpen) {
        this.screenElements.forEach(screenElement => {
            if (screenToOpen === screenElement) {
                screenElement.style.display = "flex";
            } else {
                screenElement.style.display = "none";
            }
        });
    }
};

let localPlayer = {};
window.localPlayer = localPlayer;
let socket = null;

$connectButton.addEventListener('click', () => {
    initConnection();
});

function initConnection() {
    // socket = io("wss://starfish-app-ew3jj.ondigitalocean.app");
    if (socket) {
        socket.connect();
    } else {
        socket = io();
    }
    socket.on(SocketEvents.Connect, () => {
        screens.open($characterScreen);
        $characterName.value = twitchName;
    });

    socket.on(SocketEvents.Disconnect, () => {
        screens.open($mainScreen);
    });
}

$characterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    if (!data.characterName.trim()) {
        return;
    }

    socket.once(SocketEvents.PlayerRegistered, () => {
        screens.open($gameScreen);
        initializeGameScreen();
    });
    socket.emit(SocketEvents.PlayerConnected, {
        name: data.characterName,
        action: 'attack',
        color: data.color,
        job: data.job,
        preset: data.preset,
        active: true
    });
});


function initializeGameScreen() {
    socket.on(SocketEvents.Update, (player) => {
        localPlayer = player;
        $playerName.innerText = player.name;
        $playerJob.innerText = `Lv:${player.level} ${player.job}`;
        $playerXPText.innerText = `XP: ${player.xp}/${getLevelRequirement(player.level)}`;
        $playerHealthText.innerText = `HP: ${player.health}/${player.maxHealth}`;
        $playerHealthBar.value = player.health;
        $playerHealthBar.max = player.maxHealth;
        $playerAttack.innerText = `ATK: ${player.attack}`;
        $playerDefense.innerText = `DEF: ${player.defense}`;
        $playerHeal.innerText = `HEAL: ${player.heal}`;
        $reviveAction.disabled = player.active;
        $playerAction.innerText = `ACT: ${player.action?.toUpperCase()}`;

    });

    socket.on(SocketEvents.Log, (text) => {
        const line = document.createElement('p');
        line.textContent = text;
        $log.insertBefore(line, $log.firstChild);
    });
}


$attackAction.addEventListener('click', (event) => {
    event.preventDefault();

    socket.emit(SocketEvents.PlayerAction, { action: "attack" });
});

$defendAction.addEventListener('click', (event) => {
    event.preventDefault();

    socket.emit(SocketEvents.PlayerAction, { action: "defend" });
});

$healAction.addEventListener('click', (event) => {
    event.preventDefault();

    socket.emit(SocketEvents.PlayerAction, { action: "heal" });
});

$reviveAction.addEventListener('click', (event) => {
    event.preventDefault();

    socket.emit(SocketEvents.PlayerRevive);
});