const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Document = require("../models/Document");
const Comment = require("../models/Comment");
const mongoose = require("mongoose");

// @route   GET api/analytics/stats
// @desc    Get overall platform stats
router.get("/stats", auth, async (req, res) => {
  try {
    const totalDocs = await Document.countDocuments();
    const totalUsers = await mongoose.model("User").countDocuments();
    const totalComments = await Comment.countDocuments();
    const approvedDocs = await Document.countDocuments({ status: "Approved" });

    res.json({ totalDocs, totalUsers, totalComments, approvedDocs });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/analytics/docs-by-category
// @desc    Get the count of documents per category
router.get("/docs-by-category", auth, async (req, res) => {
  try {
    const stats = await Document.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } }, // Format for recharts
      { $sort: { value: -1 } },
    ]);
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/analytics/activity-over-time
// @desc    Get document uploads per day for the last 30 days
router.get("/activity-over-time", auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activity = await Document.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date
      { $project: { date: "$_id", documents: "$count", _id: 0 } },
    ]);
    res.json(activity);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
