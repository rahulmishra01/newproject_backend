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

// app.use(cors());

// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   socket.on("callUser", ({ from, to }) => {
//     io.to(to).emit("ring", { from });
//   });

//   socket.on("answerCall", ({ to, signal }) => {
//     io.to(to).emit("callAccepted", signal);
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

let users = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  users.push(socket.id);

  if (users.length === 2) {
    const [user1, user2] = users;
    io.to(user1).emit("pair", { partnerId: user2 });
    io.to(user2).emit("pair", { partnerId: user1 });
    users = []; // Reset the users array
  }

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    users = users.filter((id) => id !== socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
