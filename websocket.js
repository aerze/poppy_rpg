const { Socket } = require("socket.io");

function websocket (io) {
    /**
     * 
     * @param {Socket} socket 
     */
    function handleNewClient(socket) {
        console.log(">> client connected");
        
        socket.on('player-command', command => {
            console.log(`${command.name} says ${command.value}`);
            socket.broadcast.emit("player-response", { name: command.name, value: command.value })
        });

        socket.on('disconnect', () => {
            console.log(">> client disconnected");
        });
      }


    io.on('connection', handleNewClient);
}

module.exports = websocket;