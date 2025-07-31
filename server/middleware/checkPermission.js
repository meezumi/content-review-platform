const Document = require("../models/Document");

const checkDocumentPermission = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    const userId = req.user.id;
    const isUploader = document.uploader.toString() === userId;
    const isCollaborator = document.collaborators.some(
      (c) => c.toString() === userId
    );

    if (!isUploader && !isCollaborator) {
      return res
        .status(403)
        .json({
          msg: "Access denied. You do not have permission to view this document.",
        });
    }

    // If permission is granted, attach the document to the request to avoid re-fetching
    req.document = document;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { checkDocumentPermission };
