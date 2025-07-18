const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

const getReceiverSocketID = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId !== undefined) {
    userSocketMap[userId] = socket.id;
    socket.userId = userId;
  }

  // Notify all clients about online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Handle typing event correctly here
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketID(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      delete userSocketMap[socket.userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

module.exports = { getReceiverSocketID, app, io, server };
