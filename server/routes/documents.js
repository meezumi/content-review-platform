const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const Document = require("../models/Document");
const router = express.Router();

// Configure Multer Storage (no changes here)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// @route   POST api/documents/upload
// @desc    Upload a NEW document (Version 1)
// @access  Private
router.post("/upload", [auth, upload.single("file")], async (req, res) => {
  try {
    const { filename, path, originalname, mimetype, size } = req.file;
    const newVersion = {
      filename,
      path,
      originalName: originalname,
      mimetype,
      size,
    };

    const newDocument = new Document({
      activeVersion: newVersion,
      versions: [newVersion], // The first version is added to the history
      uploader: req.user.id,
    });

    const doc = await newDocument.save();
    res.json(doc);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/documents/:id/version
// @desc    Upload a NEW VERSION of an existing document
// @access  Private
router.post("/:id/version", [auth, upload.single("file")], async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ msg: "Document not found" });

    const { filename, path, originalname, mimetype, size } = req.file;
    const newVersion = {
      filename,
      path,
      originalName: originalname,
      mimetype,
      size,
    };

    document.versions.push(newVersion);
    document.activeVersion = newVersion; // The new version becomes the active one
    document.status = "In Review"; // Reset status when a new version is uploaded

    await document.save();
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/documents/:id/status
// @desc    Update the status of a document
// @access  Private
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatus = ["In Review", "Approved", "Requires Changes"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // Return the updated document
    );
    if (!document) return res.status(404).json({ msg: "Document not found" });

    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/documents/all ...
router.get("/all", auth, async (req, res) => {
  try {
    const documents = await Document.find({})
      .populate("uploader", "username")
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/documents/:id ...
router.get("/:id", auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ msg: "Document not found" });
    res.json(document);
  } catch (err) {
    if (err.kind === "ObjectId")
      return res.status(404).json({ msg: "Document not found" });
    res.status(500).send("Server Error");
  }
});

module.exports = router;
