const express = require("express");
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/auth");
const Document = require("../models/Document");

const router = express.Router();

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this 'uploads' directory exists
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// @route   POST api/documents/upload
// @desc    Upload a document
// @access  Private
router.post("/upload", [auth, upload.single("file")], async (req, res) => {
  try {
    const { filename, path, originalname, mimetype, size } = req.file;
    const newDocument = new Document({
      filename,
      path,
      originalName: originalname,
      mimetype,
      size,
      uploader: req.user.id,
    });

    const doc = await newDocument.save();
    res.json(doc);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/documents
// @desc    Get all documents for the logged-in user
// @access  Private
router.get("/", auth, async (req, res) => {
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

router.get("/:id", auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }
    // For this project, we assume if a user has the ID, they can view it.
    res.json(document);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Document not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
