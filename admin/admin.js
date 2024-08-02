const socket = io();
function getById(id) {
  return document.getElementById(id);
}

function bind(el, event, dataFn) {
  el.addEventListener("click", () => {
    socket.emit(event, dataFn());
  });
}

function bindFn(el, fn) {
  el.addEventListener("click", fn);
}

const $connected = getById("connected");

socket.on("connect", () => {
  setTimeout(() => socket.emit("ADMIN"), 1000);
});

socket.on("ADMIN:CONNECTED", () => {
  $connected.textContent = "Connected";
});

const $selectedDungeonType = getById("selected-dungeon-type");
const $refreshDungeonType = getById("refresh-dungeon-type");
const $createDungeonType = getById("create-dungeon-type");
const $listDungeonType = getById("list-dungeon-type");
var selectedDungeonType = null;

bindFn($refreshDungeonType, () => {
  socket.emit("RPG:REQUEST", 0, null, (list) => {
    $listDungeonType.innerHTML = "";
    for (const dungeon of list) {
      const button = document.createElement("button");
      button.textContent = `${dungeon.name}:${dungeon.id} - ${dungeon.type}`;
      button.addEventListener("click", () => {
        selectedDungeonType = dungeon;
        $selectedDungeonType.textContent = `${dungeon.name}:${dungeon.id} - ${dungeon.type}`;
      });
      $listDungeonType.appendChild(button);
    }
  });
});

bind($createDungeonType, "ADMIN:create-dungeon", () => selectedDungeonType);

const $selectedDungeonInstance = getById("selected-dungeon-instance");
const $refreshDungeonInstance = getById("refresh-dungeon-instance");
const $deleteDungeonInstance = getById("delete-dungeon-instance");
const $listDungeonInstance = getById("list-dungeon-instance");
const $selectedDungeon = getById("selected-dungeon");
var selectedDungeonInstance = null;
var timeoutId = null;

function getDungeonInfo() {
  socket.emit("RPG:REQUEST", 2, { id: selectedDungeonInstance.id }, (result) => {
    if (!result) {
      $selectedDungeon.textContent = "no result";
      return;
    }
    $selectedDungeon.textContent = JSON.stringify(result, null, 2);
    timeoutId = setTimeout(getDungeonInfo, 1000);
  });
}

bindFn($refreshDungeonInstance, () => {
  socket.emit("RPG:REQUEST", 1, null, (list) => {
    $listDungeonInstance.innerHTML = "";
    for (const dungeon of list) {
      const button = document.createElement("button");
      button.textContent = `${dungeon.name}:${dungeon.id} - ${dungeon.type}`;
      button.addEventListener("click", () => {
        selectedDungeonInstance = dungeon;
        $selectedDungeonInstance.textContent = `${dungeon.name}:${dungeon.id} - ${dungeon.type}`;
        clearTimeout(timeoutId);
        getDungeonInfo();
      });
      $listDungeonInstance.appendChild(button);
    }
  });
});

bind($deleteDungeonInstance, "ADMIN:delete-dungeon", () => selectedDungeonInstance);
