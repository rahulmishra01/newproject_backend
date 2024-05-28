// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "https://newproject-frontend.onrender.com",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   },
// });

// app.use(cors());

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

app.use(cors());

let waitingUsers = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("findMatch", () => {
    if (waitingUsers.length > 0) {
      const match = waitingUsers.pop();
      io.to(match).emit("matchFound", { userId: socket.id });
      socket.emit("matchFound", { userId: match });
    } else {
      waitingUsers.push(socket.id);
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
    waitingUsers = waitingUsers.filter(user => user !== socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
