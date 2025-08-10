const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },

  type: {
    type: String,
    enum: ["General", "Pinned"],
    default: "General",
  },
  x_coordinate: { type: Number }, // Will store as percentage (0-100)
  y_coordinate: { type: Number }, // Will store as percentage (0-100)

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
