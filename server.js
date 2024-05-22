const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(
  cors({
    origin: "https://newproject-frontend.onrender.com",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("callUser", (data) => {
    io.to(data.to).emit("ring", { from: data.from });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
