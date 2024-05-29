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

let activeRooms = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", () => {
    let roomFound = false;
    for (let room of activeRooms) {
      if (room.length === 1) {
        room.push(socket.id);
        roomFound = true;
        io.to(room[0]).emit("user-joined", { userId: socket.id });
        io.to(socket.id).emit("room-assigned", { roomKey: room[0], users: room });
        break;
      }
    }

    if (!roomFound) {
      const newRoom = [socket.id];
      activeRooms.push(newRoom);
      socket.emit("room-assigned", { roomKey: socket.id, users: newRoom });
    }
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
    activeRooms = activeRooms.filter((room) => {
      if (room.includes(socket.id)) {
        const index = room.indexOf(socket.id);
        room.splice(index, 1);
        if (room.length === 1) {
          io.to(room[0]).emit("user-disconnected", { userId: socket.id });
        }
        return room.length > 0;
      }
      return true;
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
