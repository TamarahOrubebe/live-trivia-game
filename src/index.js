const express = require('express');
const path = require('path');
const http = require('http');
const socket = require('socket.io');


const app = express();

const server = http.createServer(app); // create the HTTP server using the Express app created on the previous line

const io = socket(server); // connect Socket.IO to the HTTP server

const port = process.env.PORT || 8080;

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath))

io.on('connection', () => { // listen for new connections to Socket.IO
   console.log('A new player just connected');
});

server.listen(port, () => {
   console.log(`Server is up on port ${port}`)
});
