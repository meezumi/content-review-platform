const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const { checkDocumentPermission } = require("../middleware/checkPermission");
const Document = require("../models/Document");
const User = require("../models/User");
const router = express.Router();

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

// --- GENERAL ROUTES (NO /:id) ---
// These must come before routes with /:id to avoid conflicts.

// @route   POST /upload
// @desc    Upload a NEW document (Version 1)
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
      versions: [newVersion],
      uploader: req.user.id,
      collaborators: [req.user.id], // Uploader is automatically a collaborator
    });

    const doc = await newDocument.save();
    res.json(doc);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
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
    res.json(req.document);
  }
);

module.exports = router;
