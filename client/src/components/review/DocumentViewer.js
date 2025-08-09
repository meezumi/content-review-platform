import React, { useState } from "react";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import CommentPin from "./CommentPin";

const DocumentViewer = ({ document, comments, onNewComment }) => {
  const [tempPin, setTempPin] = useState(null);
  const [commentText, setCommentText] = useState("");

  if (!document) return null;

  const handleImageClick = (e) => {
    if (e.target.id !== "document-image") return; // Only trigger on the image itself

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTempPin({ x, y });
  };

  const submitContextualComment = () => {
    if (!commentText.trim()) return;
    onNewComment(commentText, tempPin);
    setTempPin(null);
    setCommentText("");
  };

  const documentUrl = `http://localhost:5000/${document.path}`;
  const isImage = ["image/jpeg", "image/png", "image/gif"].includes(
    document.mimetype
  );

  return (
    <Paper
      onClick={isImage ? handleImageClick : null}
      sx={{
        height: "75vh",
        p: 1,
        backgroundColor: "#2a2a2a",
        borderRadius: 2,
        position: "relative", // Parent must be relative for pins
        overflow: "hidden",
      }}
    >
      {isImage ? (
        <img
          id="document-image"
          src={documentUrl}
          alt={document.originalName}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <iframe
          src={documentUrl}
          title={document.originalName}
          width="100%"
          height="100%"
          frameBorder="0"
        />
      )}

      {/* Render existing comment pins */}
      {comments
        .filter((c) => c.isContextual)
        .map((comment) => (
          <CommentPin key={comment._id} comment={comment} />
        ))}

      {/* Render temporary pin and input box */}
      {tempPin && (
        <Paper
          sx={{
            position: "absolute",
            left: `${tempPin.x}%`,
            top: `${tempPin.y}%`,
            p: 2,
            zIndex: 10,
            transform: "translate(-50%, 10px)",
          }}
        >
          <Typography variant="subtitle2">
            Add comment at this point:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ my: 1 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button size="small" onClick={() => setTempPin(null)}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={submitContextualComment}
            >
              Save
            </Button>
          </Box>
        </Paper>
      )}
    </Paper>
  );
};

export default DocumentViewer;
