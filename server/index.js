require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

// Import Mongoose Models
const Comment = require("./models/Comment");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define API routes
app.use("/api/users", require("./routes/users"));
app.use("/api/documents", require("./routes/documents"));
app.use("/api/comments", require("./routes/comments")); // Add new comments route

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Socket.IO Middleware for Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded.user;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id, "with user ID:", socket.user.id);

  socket.on("joinRoom", (documentId) => {
    socket.join(documentId);
    console.log(`User ${socket.id} joined room ${documentId}`);
  });

  socket.on("leaveRoom", (documentId) => {
    socket.leave(documentId);
    console.log(`User ${socket.id} left room ${documentId}`);
  });

  socket.on("newComment", async ({ documentId, text }) => {
    try {
      const user = await User.findById(socket.user.id).select("username");
      const comment = new Comment({
        text,
        document: documentId,
        author: socket.user.id,
      });
      await comment.save();

      const commentData = {
        _id: comment._id,
        text: comment.text,
        author: { _id: user._id, username: user.username },
        createdAt: comment.createdAt,
      };

      // Broadcast to everyone in the specific document room
      io.to(documentId).emit("commentReceived", commentData);
      console.log(`Broadcasting new comment to room ${documentId}`);
    } catch (err) {
      console.error("Error saving or broadcasting comment:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
