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

const fs = require('fs');
const pdf = require('pdf-parse'); 
const FormData = require('form-data');


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

const extractTextWithOCR = async (filePath) => {
  console.log("Falling back to OCR for text extraction...");
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("isOverlayRequired", "false");
    formData.append("apikey", "helloworld"); // This is the free, public API key
    formData.append("language", "eng");

    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    if (response.data && !response.data.IsErroredOnProcessing) {
      console.log("OCR extraction successful.");
      return response.data.ParsedResults[0].ParsedText;
    } else {
      console.error("OCR API returned an error:", response.data.ErrorMessage);
      return "OCR extraction failed.";
    }
  } catch (error) {
    console.error("Error during OCR request:", error.message);
    return "OCR service could not be reached.";
  }
};

// --- GENERAL ROUTES (NO /:id) ---
// These must come before routes with /:id to avoid conflicts.

// @route   POST /upload
// @desc    Upload a NEW document (Version 1)
router.post("/upload", [auth, upload.single("file")], async (req, res) => {
  try {
    const { originalname, mimetype, path: filePath } = req.file;
    const { category } = req.body;

    let summary = "Summary is not applicable for this file type.";
    let extractedText = "";

    // --- NEW: REAL TEXT EXTRACTION LOGIC ---
    if (mimetype === "application/pdf") {
      console.log(`Extracting text from PDF: ${filePath}`);

      const dataBuffer = fs.readFileSync(filePath);

      try {
        const pdfData = await pdf(dataBuffer);
        extractedText = pdfData.text;
        console.log("PDF text extracted successfully.");
      } catch (parseError) {
        console.error("Error parsing PDF:", parseError);
        extractedText = "Could not extract text from this PDF.";
      }
      if (extractedText.length < 100) {
        extractedText = await extractTextWithOCR(filePath);
      }

    } else if (mimetype === "text/plain") {
      extractedText = fs.readFileSync(filePath, "utf8");
    } else if (mimetype.startsWith("image/")) {
        extractedText = await extractTextWithOCR(filePath);
    }

    if (extractedText && extractedText.length > 20) {
      console.log("Sending extracted text to AI for summarization...");
      summary = await generateSummary(extractedText);
      console.log("Summary received from AI.");
    } else {
      summary = "Could not extract enough text to generate a summary.";
    }

    // if (mimetype === "text/plain" || mimetype === "application/pdf") {
    //   // For this example, we'll use a placeholder for PDF text extraction.
    //   // A real app would need a library like 'pdf-parse'.
    //   // For now, we'll just "summarize" the filename. A real implementation is complex.
    //   const textToSummarize = `This document is named ${originalname}. It is a ${mimetype} file.`;
    //   summary = await generateSummary(textToSummarize);
    // }

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
  // The document is attached by the middleware. Now we populate it.
  await req.document.populate({
    path: "collaborators",
    select: "username email",
  });

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

    // Generate summary for the new version
    let newSummary = "Summary is not applicable for this file type.";
    let extractedText = "";

    if (mimetype === "application/pdf") {
      console.log(`Extracting text from new version PDF: ${path}`);
      
      try {
        const dataBuffer = fs.readFileSync(path);
        const pdfData = await pdf(dataBuffer);
        extractedText = pdfData.text;
        console.log("PDF text extracted successfully from new version.");
      } catch (parseError) {
        console.error("Error parsing PDF from new version:", parseError);
        extractedText = "Could not extract text from this PDF.";
      }

      if (extractedText.length < 100) {
        extractedText = await extractTextWithOCR(path);
      }
    } else if (mimetype === "text/plain") {
      extractedText = fs.readFileSync(path, "utf8");
    } else if (mimetype.startsWith("image/")) {
      extractedText = await extractTextWithOCR(path);
    }

    if (extractedText && extractedText.length > 20) {
      console.log("Sending extracted text to AI for new version summarization...");
      newSummary = await generateSummary(extractedText);
      console.log("Summary received from AI for new version.");
    } else {
      newSummary = "Could not extract enough text to generate a summary.";
    }

    document.summary = newSummary;
    await document.save();

    try {
      const uploader = await User.findById(req.user.id);

      // Find all collaborators to notify (everyone except the person who uploaded)
      const collaboratorsToNotify = document.collaborators.filter(
        (collabId) => collabId.toString() !== req.user.id
      );

      // Fetch user details for each collaborator to get their email
      const collaboratorUsers = await User.find({
        _id: { $in: collaboratorsToNotify },
      });

      for (const user of collaboratorUsers) {
        await emailQueue.add("send-new-version-email", {
          to: user.email,
          subject: `A new version of "${document.activeVersion.originalName}" has been uploaded`,
          html: `
                    <h1>New Version Available</h1>
                    <p>Hi ${user.username},</p>
                    <p>A new version of the document <strong>${document.activeVersion.originalName}</strong> has been uploaded by ${uploader.username}.</p>
                    <p>Log in to your ContentFlow account to review the latest changes.</p>
                `,
        });
      }
    } catch (err) {
      console.error("Failed to queue new version notification emails:", err);
      // We don't block the main response if email fails
    }

    res.json(document);
  }
);

// @route   POST /:id/regenerate-summary
// @desc    Regenerate AI summary for a specific version or active version (SECURED)
router.post("/:id/regenerate-summary", [auth, checkDocumentPermission], async (req, res) => {
  if (!AI_SERVICE_URL) {
    return res.status(500).json({ msg: 'AI service is not configured.' });
  }

  try {
    const document = req.document;
    const { versionId } = req.body; // Optional version ID from request body
    
    // Use specified version or fall back to active version
    let targetVersion;
    if (versionId) {
      targetVersion = document.versions.find(v => v._id.toString() === versionId);
      if (!targetVersion) {
        return res.status(400).json({ msg: 'Specified version not found.' });
      }
    } else {
      targetVersion = document.activeVersion;
    }
    
    if (!targetVersion || !targetVersion.path) {
      return res.status(400).json({ msg: 'No valid version found for this document.' });
    }

    let extractedText = "";
    const { path: filePath, mimetype } = targetVersion;

    // Extract text based on file type (same logic as upload)
    if (mimetype === "application/pdf") {
      console.log(`Extracting text from PDF for summary regeneration: ${filePath}`);
      
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(dataBuffer);
        extractedText = pdfData.text;
        console.log("PDF text extracted successfully for summary regeneration.");
      } catch (parseError) {
        console.error("Error parsing PDF for summary:", parseError);
        extractedText = "Could not extract text from this PDF.";
      }

      // Fallback to OCR if PDF parsing didn't yield enough text
      if (extractedText.length < 100) {
        extractedText = await extractTextWithOCR(filePath);
      }
    } else if (mimetype === "text/plain") {
      extractedText = fs.readFileSync(filePath, "utf8");
    } else if (mimetype.startsWith("image/")) {
      extractedText = await extractTextWithOCR(filePath);
    }

    let newSummary;
    if (extractedText && extractedText.length > 20) {
      console.log("Sending extracted text to AI for summary regeneration...");
      newSummary = await generateSummary(extractedText);
      console.log("New summary received from AI.");
    } else {
      newSummary = "Could not extract enough text to generate a summary.";
    }

    // Update the document with the new summary
    document.summary = newSummary;
    await document.save();

    res.json({ summary: newSummary });
  } catch (err) {
    console.error("Error regenerating summary:", err.message);
    res.status(500).json({ msg: 'Failed to regenerate summary.' });
  }
});

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

// @route   PUT /:id/request-changes
router.put('/:id/request-changes', [auth, checkDocumentPermission], async (req, res) => {
    try {
        const document = req.document;
        document.status = 'Requires Changes';
        await document.save();
        
        // --- NOTIFICATION LOGIC ---
        const uploader = await User.findById(document.uploader);
        const reviewer = await User.findById(req.user.id);
        
        // Notify the original uploader that changes are needed
        if (uploader && uploader._id.toString() !== reviewer._id.toString()) {
             await emailQueue.add('send-changes-requested-email', {
                to: uploader.email,
                subject: `Changes requested for "${document.activeVersion.originalName}"`,
                html: `
                    <h1>Changes Requested</h1>
                    <p>Hi ${uploader.username},</p>
                    <p>${reviewer.username} has requested changes on the document <strong>${document.activeVersion.originalName}</strong>.</p>
                    <p>Please review the comments, upload a new version, and resubmit for approval.</p>
                `
            });
        }

        res.json(document);
    } catch (err) {
         console.error('Error requesting changes:', err);
         res.status(500).send('Server Error');
    }
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
