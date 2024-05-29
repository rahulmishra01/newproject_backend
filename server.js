// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   },
// });

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// const activeRooms = [];

// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   socket.on("callUser", ({ from, to }) => {
//     io.to(to).emit("ring", { from });
//   });

//   socket.on("answerCall", ({ to, signal }) => {
//     io.to(to).emit("callAccepted", signal);
//   });
//   socket.on("endCall", ({ to }) => {
//     io.to(to).emit("callEnded");
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected:", socket.id);
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


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

app.use(
  cors({
    origin: "https://newproject-frontend.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const activeRooms = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", () => {
    let roomKey;
    if (activeRooms.length === 0 || activeRooms[activeRooms.length - 1].length === 2) {
      roomKey = `room-${activeRooms.length + 1}`;
      activeRooms.push([socket.id]);
    } else {
      roomKey = `room-${activeRooms.length}`;
      activeRooms[activeRooms.length - 1].push(socket.id);
    }
    socket.join(roomKey);
    socket.emit("room-assigned", { roomKey, users: activeRooms[activeRooms.length - 1] });
    io.to(roomKey).emit("user-joined", { userId: socket.id });
    console.log("activeRooms:", activeRooms);
  });

  socket.on("callUser", ({ from, to }) => {
    io.to(to).emit("ring", { from });
  });

  socket.on("answerCall", ({ to, signal }) => {
    io.to(to).emit("callAccepted", signal);
  });

  socket.on("endCall", ({ to }) => {
    io.to(to).emit("callEnded");
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    activeRooms.forEach((room, index) => {
      const userIndex = room.indexOf(socket.id);
      if (userIndex !== -1) {
        room.splice(userIndex, 1);
        if (room.length === 0) {
          activeRooms.splice(index, 1);
        }
      }
    });
    io.emit("user-disconnected", { userId: socket.id });
    console.log("activeRooms after disconnect:", activeRooms);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
