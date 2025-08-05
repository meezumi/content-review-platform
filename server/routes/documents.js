const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const { checkDocumentPermission } = require("../middleware/checkPermission");
const Document = require("../models/Document");
const User = require("../models/User");
const Comment = require('../models/Comment');
const axios = require("axios");
const router = express.Router();
const emailQueue = require("../queue");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

const generateSummary = async (text) => {
  if (!AI_SERVICE_URL) return "AI service is not configured.";
  try {
    // We send a very large chunk of text. A real app might chunk this.
    const response = await axios.post(`${AI_SERVICE_URL}/summarize`, {
      text: text.substring(0, 15000),
    });
    return response.data.summary;
  } catch (error) {
    console.error("Error contacting AI service for summary:", error.message);
    return "Failed to generate summary.";
  }
};

// --- GENERAL ROUTES (NO /:id) ---
// These must come before routes with /:id to avoid conflicts.

// @route   POST /upload
// @desc    Upload a NEW document (Version 1)
router.post("/upload", [auth, upload.single("file")], async (req, res) => {
  try {
    const { originalname, mimetype } = req.file;
    const { category } = req.body;

    let summary = "Summary is not applicable for this file type.";
    if (mimetype === "text/plain" || mimetype === "application/pdf") {
      // For this example, we'll use a placeholder for PDF text extraction.
      // A real app would need a library like 'pdf-parse'.
      // For now, we'll just "summarize" the filename. A real implementation is complex.
      const textToSummarize = `This document is named ${originalname}. It is a ${mimetype} file.`;
      summary = await generateSummary(textToSummarize);
    }

    const newVersion = { ...req.file, originalName: originalname };

    const newDocument = new Document({
      activeVersion: newVersion,
      versions: [newVersion],
      uploader: req.user.id,
      collaborators: [req.user.id], // Uploader is automatically a collaborator
      category: category || "General",
      summary: summary,
    });

    const doc = await newDocument.save();
    res.json(doc);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- NEW ROUTE for on-demand sentiment analysis ---
// @route   GET /:id/sentiment
// @desc    Calculate and get the sentiment for a document's comments
router.get('/:id/sentiment', [auth, checkDocumentPermission], async (req, res) => {
  if (!AI_SERVICE_URL) {
    return res.status(500).json({ msg: 'AI service is not configured.' });
  }
  try {
    const comments = await Comment.find({ document: req.params.id });
    const commentTexts = comments.map(c => c.text);

    const response = await axios.post(`${AI_SERVICE_URL}/sentiment`, { comments: commentTexts });
    const sentimentData = response.data;

    // Update the document in the database with the new sentiment
    req.document.sentiment = sentimentData;
    await req.document.save();

    res.json(sentimentData);
  } catch (error) {
    console.error('Error contacting AI for sentiment:', error.message);
    res.status(500).json({ msg: 'Failed to get sentiment.' });
  }
});

// @route   GET /mine
// @desc    Get all documents uploaded BY the current user
router.get("/mine", auth, async (req, res) => {
  try {
    const documents = await Document.find({ uploader: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /shared
// @desc    Get all documents shared WITH the current user (excluding their own)
router.get("/shared", auth, async (req, res) => {
  try {
    const documents = await Document.find({
      collaborators: req.user.id,
      uploader: { $ne: req.user.id }, // $ne means "not equal"
    })
      .populate("uploader", "username")
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- SPECIFIC DOCUMENT ROUTES (WITH /:id) ---
// These MUST come AFTER the general routes above.

// @route   GET /:id
// @desc    Get a single document by its ID (SECURED)
router.get("/:id", [auth, checkDocumentPermission], async (req, res) => {
  // The document is already fetched by the middleware and attached to req
  res.json(req.document);
});

// @route   POST /:id/version
// @desc    Upload a NEW VERSION of an existing document (SECURED)
router.post(
  "/:id/version",
  [auth, checkDocumentPermission, upload.single("file")],
  async (req, res) => {
    const document = req.document;
    const { filename, path, originalname, mimetype, size } = req.file;
    const newVersion = {
      filename,
      path,
      originalName: originalname,
      mimetype,
      size,
    };
    document.versions.push(newVersion);
    document.activeVersion = newVersion;
    document.status = "In Review";
    await document.save();
    res.json(document);
  }
);

// @route   PUT /:id/status
// @desc    Update the status of a document (SECURED)
router.put("/:id/status", [auth, checkDocumentPermission], async (req, res) => {
  const { status } = req.body;
  const allowedStatus = ["In Review", "Approved", "Requires Changes"];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ msg: "Invalid status value" });
  }
  req.document.status = status;
  await req.document.save();
  res.json(req.document);
});

// @route   POST /:id/collaborator
// @desc    Add a collaborator to a document (SECURED)
router.post(
  "/:id/collaborator",
  [auth, checkDocumentPermission],
  async (req, res) => {
    if (req.document.uploader.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Only the document owner can add collaborators." });
    }
    const userToAdd = await User.findOne({ email: req.body.email });
    if (!userToAdd) {
      return res.status(404).json({ msg: "User with that email not found." });
    }
    if (req.document.collaborators.includes(userToAdd.id)) {
      return res.status(400).json({ msg: "User is already a collaborator." });
    }
    req.document.collaborators.push(userToAdd.id);
    await req.document.save();

    const inviter = await User.findById(req.user.id);
    await emailQueue.add("send-invite-email", {
      to: userToAdd.email,
      subject: `You've been invited to collaborate on a document!`,
      html: `
            <h1>Collaboration Invitation</h1>
            <p>Hi ${userToAdd.username},</p>
            <p>${inviter.username} has invited you to review the document: <strong>${req.document.activeVersion.originalName}</strong>.</p>
            <p>You can access it by logging into your ContentFlow account.</p>
        `,
    });

    res.json(req.document);
  });

module.exports = router;
