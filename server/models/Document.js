const mongoose = require("mongoose");

const VersionSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const DocumentSchema = new mongoose.Schema({
  activeVersion: VersionSchema,
  versions: [VersionSchema],
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: {
    type: String,
    enum: ["In Review", "Approved", "Requires Changes"],
    default: "In Review",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Document", DocumentSchema);
