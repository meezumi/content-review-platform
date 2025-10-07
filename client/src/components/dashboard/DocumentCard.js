import React from "react";
import { 
  Card, 
  CardContent,
  CardActions,
  Typography, 
  Box, 
  Chip, 
  Button, 
  IconButton,
  Avatar,
  Tooltip
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  TextSnippet as TextIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon
} from "@mui/icons-material";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const getFileIcon = (fileName) => {
  if (!fileName) return <FileIcon />;
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return <PdfIcon />;
    case 'jpg': case 'jpeg': case 'png': case 'gif': return <ImageIcon />;
    case 'txt': case 'md': return <TextIcon />;
    default: return <FileIcon />;
  }
};

const getStatusChip = (status) => {
  const statusConfig = {
    "Approved": { 
      color: "success", 
      sx: { 
        background: "linear-gradient(135deg, #10b981, #059669)",
        color: "white" 
      }
    },
    "Requires Changes": { 
      color: "warning",
      sx: { 
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        color: "white" 
      }
    },
    "Rejected": { 
      color: "error",
      sx: { 
        background: "linear-gradient(135deg, #ef4444, #dc2626)",
        color: "white" 
      }
    },
    default: { 
      color: "primary",
      sx: { 
        background: "rgba(99, 102, 241, 0.2)",
        color: "#6366f1",
        border: "1px solid rgba(99, 102, 241, 0.3)"
      }
    }
  };

  const config = statusConfig[status] || statusConfig.default;
  
  return (
    <Chip
      label={status || "In Review"}
      size="small"
      sx={config.sx}
    />
  );
};

const getCategoryColor = (category) => {
  const colors = {
    "Marketing": "#ec4899",
    "Legal": "#8b5cf6", 
    "Design": "#06b6d4",
    "Technical": "#10b981",
    "General": "#6366f1"
  };
  return colors[category] || "#6366f1";
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const uploaded = new Date(date);
  const diffInSeconds = Math.floor((now - uploaded) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return uploaded.toLocaleDateString();
};

const DocumentCard = ({ doc, onReviewClick }) => {
  const fileName = doc.activeVersion?.originalName || "Processing...";
  const fileIcon = getFileIcon(fileName);
  const categoryColor = getCategoryColor(doc.category);

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}88)`,
          }
        }}
        onClick={() => onReviewClick(doc._id)}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* Header with file icon and more options */}
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-start",
            mb: 2 
          }}>
            <Avatar
              sx={{
                background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}40)`,
                color: categoryColor,
                width: 48,
                height: 48,
              }}
            >
              {fileIcon}
            </Avatar>
            <IconButton 
              size="small" 
              sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* File name */}
          <Tooltip title={fileName} arrow>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 1,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.3,
                minHeight: "2.6em",
                fontWeight: 600
              }}
            >
              {fileName}
            </Typography>
          </Tooltip>

          {/* Status and category chips */}
          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
            {getStatusChip(doc.status)}
            <Chip 
              label={doc.category} 
              size="small" 
              variant="outlined"
              sx={{ 
                borderColor: `${categoryColor}40`,
                color: categoryColor,
                fontWeight: 500
              }}
            />
          </Box>

          {/* Metadata */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 2,
            color: "text.secondary",
            fontSize: "0.875rem"
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TimeIcon fontSize="small" />
              <Typography variant="caption">
                {formatTimeAgo(doc.createdAt)}
              </Typography>
            </Box>
            
            {doc.owner && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PersonIcon fontSize="small" />
                <Typography variant="caption" noWrap>
                  {doc.owner.name || "Anonymous"}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button
            variant="contained"
            fullWidth
            size="small"
            startIcon={<ViewIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onReviewClick(doc._id);
            }}
            sx={{
              background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)`,
              "&:hover": {
                background: `linear-gradient(135deg, ${categoryColor}dd, ${categoryColor}bb)`,
              }
            }}
          >
            Review Document
          </Button>
        </CardActions>

        {/* Floating action button for quick download */}
        <Box sx={{ 
          position: "absolute", 
          top: 8, 
          right: 8,
          opacity: 0,
          transition: "opacity 0.3s ease",
          ".MuiCard-root:hover &": {
            opacity: 1,
          }
        }}>
          <IconButton
            size="small"
            sx={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.2)",
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle download logic here
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
      </Card>
    </motion.div>
  );
};

export default DocumentCard;
