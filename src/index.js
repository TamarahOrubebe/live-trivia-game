const express = require('express');
const path = require('path');
const http = require('http');
const socket  = require('socket.io');

const formatMessage = require("./utils/formatMessage.js");

const {
  addPlayer,
  getAllPlayers,
  getPlayer,
  removePlayer,
} = require("./utils/players.js");
const { log } = require('npm');


const app = express();

const server = http.createServer(app); // create the HTTP server using the Express app created on the previous line

const io =  socket(server, {}); // connect Socket.IO to the HTTP server

const port = process.env.PORT || 8080;

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => { // listen for new connections to Socket.IO

   console.log('A new player just connected');
   

   socket.on('join', ({ playerName, room }, callback) => {
     
      const { error, newPlayer } = addPlayer({ id: socket.id, playerName, room });

      if (error) return callback(error.message);
      callback(); // The callback can be called without data.

      
      socket.join(newPlayer.room);

      socket.emit('message', formatMessage('Admin', 'Welcome!'));

      socket.broadcast
         .to(newPlayer.room)
         .emit(
            'message',
            formatMessage('Admin', `${newPlayer.playerName} has joined the game!`)
      );

      io.in(newPlayer.room).emit('room', {
      room: newPlayer.room,
      players: getAllPlayers(newPlayer.room),
      });
      
      socket.on("disconnect", () => {
         console.log("A player disconnected.");

         const disconnectedPlayer = removePlayer(socket.id);

         if (disconnectedPlayer) {
            const { playerName, room } = disconnectedPlayer;
            io.in(room).emit(
               "message",
               formatMessage("Admin", `${playerName} has left!`)
            );

            io.in(room).emit("room", {
               room,
               players: getAllPlayers(room),
            });
         }
      });

      socket.on("sendMessage", (message, callback) => {
         const { error, player } = getPlayer(socket.id);

         if (error) return callback(error.message);

         if (player) {
            io.to(player.room).emit(
               "message",
               formatMessage(player.playerName, message)
            );
            callback(); // invoke the callback to trigger event acknowledgment
         }
      });
   })
      
      
      
});

server.listen(port, () => {
   console.log(`Server is up on port ${port}`)
});
