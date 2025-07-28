const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Comment = require("../models/Comment");

// @route   GET api/comments/:documentId
// @desc    Get all comments for a document, populating author's username
// @access  Private
router.get("/:documentId", auth, async (req, res) => {
  try {
    const comments = await Comment.find({ document: req.params.documentId })
      .populate("author", "username") // This joins the User collection to get the username
      .sort({ createdAt: "asc" });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
