import React from "react";
import { Tooltip, IconButton } from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";

const CommentPin = ({ comment }) => {
  return (
    <Tooltip title={`${comment.author.username}: "${comment.text}"`} arrow>
      <IconButton
        size="small"
        sx={{
          position: "absolute",
          left: `${comment.x_coordinate}%`,
          top: `${comment.y_coordinate}%`,
          transform: "translate(-50%, -50%)",
          backgroundColor: "primary.main",
          color: "white",
          "&:hover": {
            backgroundColor: "primary.dark",
          },
        }}
      >
        <CommentIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
};

export default CommentPin;
