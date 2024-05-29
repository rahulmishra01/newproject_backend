const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://newproject-frontend.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.use(cors({
  origin: "https://newproject-frontend.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

const rooms = {};

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("createRoom", (roomId) => {
    rooms[roomId] = [socket.id];
    socket.join(roomId);
    console.log(`Room created: ${roomId}`);
  });

  socket.on("joinRoom", (roomId) => {
    if (rooms[roomId] && rooms[roomId].length === 1) {
      rooms[roomId].push(socket.id);
      socket.join(roomId);
      io.to(roomId).emit("userJoined", rooms[roomId]);
      console.log(`User joined room: ${roomId}`);
    } else {
      socket.emit("roomError", "Room is full or does not exist.");
    }
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
    console.log("user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
