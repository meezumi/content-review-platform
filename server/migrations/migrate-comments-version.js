const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Document = require("../models/Document");

// Migration script to associate existing comments with document versions
async function migrateCommentsVersion() {
  try {
    await mongoose.connect("mongodb://localhost:27017/content-review-platform");
    
    console.log("Starting comment version migration...");
    
    // Find all comments without version association
    const commentsWithoutVersion = await Comment.find({
      $or: [
        { version: { $exists: false } },
        { version: null }
      ]
    });
    
    console.log(`Found ${commentsWithoutVersion.length} comments without version association`);
    
    for (const comment of commentsWithoutVersion) {
      try {
        // Get the document for this comment
        const document = await Document.findById(comment.document);
        
        if (document && document.activeVersion && document.activeVersion._id) {
          // Update the comment with the active version ID
          await Comment.findByIdAndUpdate(comment._id, {
            version: document.activeVersion._id
          });
          
          console.log(`Updated comment ${comment._id} with version ${document.activeVersion._id}`);
        } else {
          console.log(`Skipped comment ${comment._id} - document not found or no active version`);
        }
      } catch (error) {
        console.error(`Error updating comment ${comment._id}:`, error);
      }
    }
    
    console.log("Migration completed!");
    process.exit(0);
    
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateCommentsVersion();
}

module.exports = migrateCommentsVersion;