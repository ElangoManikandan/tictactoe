const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

// Serve static files (client-side files)
app.use(express.static(path.join(__dirname, 'public')));

let arr = [];
let playingArray = [];

io.on("connection", (socket) => {
    // Listen for a 'find' event from the client
    socket.on("find", (e) => {
        if (e.name != null) {
            arr.push(e.name);

            if (arr.length >= 2) {
                let p1obj = {
                    p1name: arr[0],
                    p1value: "X",
                    p1move: ""
                };
                let p2obj = {
                    p2name: arr[1],
                    p2value: "O",
                    p2move: ""
                };

                let obj = {
                    p1: p1obj,
                    p2: p2obj,
                    sum: 1
                };
                playingArray.push(obj);

                arr.splice(0, 2);

                // Emit 'find' event to all clients with updated 'playingArray'
                io.emit("find", { allPlayers: playingArray });
            }
        }
    });

    // Listen for a 'playing' event from the client
    socket.on("playing", (e) => {
        if (e.value == "X") {
            let objToChange = playingArray.find(obj => obj.p1.p1name === e.name);

            objToChange.p1.p1move = e.id;
            objToChange.sum++;
        } else if (e.value == "O") {
            let objToChange = playingArray.find(obj => obj.p2.p2name === e.name);

            objToChange.p2.p2move = e.id;
            objToChange.sum++;
        }

        // Emit 'playing' event to all clients with updated 'playingArray'
        io.emit("playing", { allPlayers: playingArray });
    });

    // Listen for a 'gameOver' event from the client
    socket.on("gameOver", (e) => {
        playingArray = playingArray.filter(obj => obj.p1.p1name !== e.name);

        // Emit 'gameOver' event to all clients
        io.emit("gameOver", { allPlayers: playingArray });
    });
});

// Serve index.html for the root route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
