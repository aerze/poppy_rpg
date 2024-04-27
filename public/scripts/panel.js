
var name = "anon";
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
            console.log(">> json", json);
            name = json.data[0].display_name;

            initializeSocket(auth.userId);
        }
    }
});

const log = document.getElementById("log");
const status = document.getElementById("status");
const attackButton = document.getElementById("attack");
const defendButton = document.getElementById("defend");
const healButton = document.getElementById("heal");
const reviveButton = document.getElementById("revive");
const health = document.getElementById("health");
const active = document.getElementById("active");


// name = "Poppy",
// initializeSocket("poppy");

function appendToLog(text) {
    const line = document.createElement('p');
    line.textContent = text;
    log.insertBefore(line, log.firstChild);
}

function disableAllButtons(value) {
    attackButton.disabled = value;
    defendButton.disabled = value;
    healButton.disabled = value;
}

function initializeSocket(uid) {
    const socket = io("wss://starfish-app-ew3jj.ondigitalocean.app");
    socket.on('connect', () => {
        status.textContent = "connected";
        socket.emit("create-character", { uid, name });
    });

    socket.on('disconnect', () => {
        status.textContent = "disconnected";
        appendToLog(name + " : disconnected from the server :C");
    });

    socket.on("update", ({ player }) => {
        health.textContent = player.health;
        active.textContent = player.active ? "Alive" : "Dead";

        if (!player.active) {
            revive.disabled = false;
        }
    });
    
    attackButton.addEventListener('click', (event) => {
        disableAllButtons(true);
        event.preventDefault();
        setTimeout(() => {disableAllButtons(false)}, 500);
        socket.emit("attack");
    });

    defendButton.addEventListener('click', (event) => {
        event.preventDefault();
        disableAllButtons(true);
        setTimeout(() => {disableAllButtons(false)}, 500);
        socket.emit("defend");
    });

    healButton.addEventListener('click', (event) => {
        event.preventDefault();
        disableAllButtons(true);
        setTimeout(() => {disableAllButtons(false)}, 500);
        socket.emit("heal");
    });

    reviveButton.addEventListener('click', (event) => {
        event.preventDefault();
        socket.emit("revive");
        reviveButton.disabled = true;
    });

    socket.on('log', (data) => {
        appendToLog(data);
    });
}
