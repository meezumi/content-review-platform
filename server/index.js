require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const emailQueue = require("./queue");

// Import Mongoose Models
const Comment = require("./models/Comment");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "http://localhost:3000", // Allow only our React client to connect
  optionsSuccessStatus: 200, // For legacy browser support
};

// Middleware
app.use(cors(corsOptions));
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
app.use("/api/comments", require("./routes/comments")); 
app.use('/api/analytics', require('./routes/analytics')); 

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

  socket.on("newComment", async ({ documentId, text, type, coordinates, pageNumber, version }) => {
    try {
      const user = await User.findById(socket.user.id).select("username");

      const newCommentData = {
        text,
        document: documentId,
        author: socket.user.id,
        type: type || "General", // Default to 'General' if not provided
        version: version, // Add version to associate comment with specific document version
      };

      if (type === "Pinned" && coordinates) {
        newCommentData.x_coordinate = coordinates.x;
        newCommentData.y_coordinate = coordinates.y;
        if (pageNumber) {
          newCommentData.pageNumber = pageNumber; // <-- Save the page number
        }
      }

      const comment = new Comment(newCommentData);
      await comment.save();

      const populatedComment = await Comment.findById(comment._id).populate('author', 'username');

      const commentData = {
        _id: comment._id,
        text: comment.text,
        author: { _id: user._id, username: user.username },
        createdAt: comment.createdAt,
      };

      // Broadcast to everyone in the specific document room
      io.to(documentId).emit("commentReceived", populatedComment);

      const mentionRegex = /@\[(.+?)\]\((.+?)\)/g;
      let match;
      const mentionedUserIds = new Set();

      while ((match = mentionRegex.exec(text)) !== null) {
        mentionedUserIds.add(match[2]); // The user ID is in the second capture group
      }

      if (mentionedUserIds.size > 0) {
        const document = await Document.findById(documentId);
        for (const userId of mentionedUserIds) {
          // Don't notify a user if they mention themselves
          if (userId === socket.user.id) continue;

          const mentionedUser = await User.findById(userId);
          if (mentionedUser) {
            await emailQueue.add("send-mention-email", {
              to: mentionedUser.email,
              subject: `You were mentioned in a comment by ${user.username}`,
              html: `
                    <h1>You Were Mentioned!</h1>
                    <p>Hi ${mentionedUser.username},</p>
                    <p>${
                      user.username
                    } mentioned you in a comment on the document <strong>${
                document.activeVersion.originalName
              }</strong>:</p>
                    <blockquote style="border-left: 2px solid #ccc; padding-left: 1em; margin-left: 1em; color: #555;">
                        ${text.replace(
                          mentionRegex,
                          (m, name) => `<strong>@${name}</strong>`
                        )}
                    </blockquote>
                    <p>Log in to your ContentFlow account to reply.</p>
                  `,
            });
          }
        }
      }
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
