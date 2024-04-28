const Game = require("./game.js");

function websocket (io) {
    const game = new Game(io);
    io.on('connection', game.handleConnection);
    game.main();
}

module.exports = websocket;