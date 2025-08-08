import React from "react";
import { Paper, Typography, Box, Chip, Button } from "@mui/material";
import { motion } from "framer-motion";
import FolderIcon from "@mui/icons-material/Folder";
import moment from "moment"; // We'll install this library

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const getStatusChip = (status) => {
  let color, variant;
  switch (status) {
    case "Approved":
      color = "success";
      variant = "filled";
      break;
    case "Requires Changes":
      color = "warning";
      variant = "filled";
      break;
    default:
      color = "primary";
      variant = "outlined";
  }
  return (
    <Chip
      label={status || "In Review"}
      color={color}
      variant={variant}
      size="small"
    />
  );
};

const DocumentCard = ({ doc, onReviewClick }) => {
  return (
    <motion.div variants={itemVariants}>
      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          border: "1px solid #333",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <FolderIcon color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {doc.activeVersion?.originalName || "Processing..."}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, my: 1.5 }}>
          {getStatusChip(doc.status)}
          <Chip label={doc.category} size="small" variant="outlined" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          Uploaded {moment(doc.createdAt).fromNow()}
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={() => onReviewClick(doc._id)}
          sx={{ mt: 2 }}
        >
          Review
        </Button>
      </Paper>
    </motion.div>
  );
};

export default DocumentCard;
