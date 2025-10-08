const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Comment = require("../models/Comment");

// @route   GET api/comments/:documentId
// @desc    Get all comments for a document's active version, populating author's username
// @access  Private
router.get("/:documentId", auth, async (req, res) => {
  try {
    // First get the document to find the active version
    const Document = require("../models/Document");
    const document = await Document.findById(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    // Get comments for the active version, including legacy comments without version
    const comments = await Comment.find({ 
      document: req.params.documentId,
      $or: [
        { version: document.activeVersion._id },
        { version: { $exists: false } }, // Include legacy comments without version
        { version: null }
      ]
    })
      .populate("author", "username") // This joins the User collection to get the username
      .sort({ createdAt: "asc" });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/comments/:documentId/:versionId
// @desc    Get all comments for a specific document version
// @access  Private
router.get("/:documentId/:versionId", auth, async (req, res) => {
  try {
    const comments = await Comment.find({ 
      document: req.params.documentId,
      version: req.params.versionId
    })
      .populate("author", "username")
      .sort({ createdAt: "asc" });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
