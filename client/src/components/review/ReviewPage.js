import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { MentionsInput, Mention } from "react-mentions";
import "./mentions-style.css"; 
import "./document-viewer.css";
import { io } from "socket.io-client";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Tooltip,
  Popover,
  Chip,
} from "@mui/material";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'; 
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { motion } from "framer-motion";
import { Document as PdfDocument, Page, pdfjs } from "react-pdf";
import LocationOnIcon from "@mui/icons-material/LocationOn";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const pageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.9 },
};
const pageTransition = {
  type: "spring",
  stiffness: 260,
  damping: 20,
};

const SentimentDisplay = ({ sentiment }) => {
  if (!sentiment) return null;
  const { positive, negative, overall } = sentiment;
  const total = positive + negative;
  const positiveWidth = total > 0 ? (positive / total) * 100 : 50;

  return (
    <Box sx={{ p: 2, borderTop: "1px solid #333" }}>
      <Typography variant="h6" gutterBottom>
        Comment Sentiment
      </Typography>
      <Tooltip
        title={`Positive: ${positive}% | Negative: ${negative}%`}
        placement="top"
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <LinearProgress
            variant="determinate"
            value={100}
            sx={{
              height: 10,
              borderRadius: 5,
              flexGrow: 1,
              "& .MuiLinearProgress-bar": {
                backgroundColor: "success.main",
              },
              backgroundColor: "error.main",
              "& .MuiLinearProgress-bar1Determinate": {
                width: `${positiveWidth}%`,
              },
            }}
          />
        </Box>
      </Tooltip>
      <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
        Overall: <strong>{overall}</strong>
      </Typography>
    </Box>
  );
};

const DocumentViewer = ({
  fileUrl,
  fileType,
  onDocClick,
  pinnedComments,
  onPinClick,
  activePinId,
}) => {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [pageWidth, setPageWidth] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setScale(1.0);
  };

  const handleFitToWidth = () => {
    // This will be handled by CSS and the container width
    setScale('fit-width');
  };

  const handlePageClick = (event, pageNumber) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    onDocClick({ x, y, pageNumber });
  };

  return (
    <div className="document-viewer-wrapper">
      {/* Zoom Controls */}
      <Box 
        sx={{ 
          position: "absolute", 
          top: 16, 
          right: 16, 
          zIndex: 100,
          display: "flex",
          gap: 1,
          background: "rgba(0, 0, 0, 0.7)",
          borderRadius: 2,
          p: 1
        }}
      >
        <Tooltip title="Zoom Out">
          <Button 
            size="small" 
            variant="outlined" 
            onClick={handleZoomOut}
            disabled={scale <= 0.25}
            sx={{ minWidth: 36, color: "white", borderColor: "rgba(255,255,255,0.3)" }}
          >
            −
          </Button>
        </Tooltip>
        <Typography 
          variant="body2" 
          sx={{ 
            alignSelf: "center", 
            color: "white", 
            minWidth: 45, 
            textAlign: "center" 
          }}
        >
          {scale === 'fit-width' ? 'Fit' : `${Math.round(scale * 100)}%`}
        </Typography>
        <Tooltip title="Zoom In">
          <Button 
            size="small" 
            variant="outlined" 
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            sx={{ minWidth: 36, color: "white", borderColor: "rgba(255,255,255,0.3)" }}
          >
            +
          </Button>
        </Tooltip>
        <Tooltip title="Reset Zoom">
          <Button 
            size="small" 
            variant="outlined" 
            onClick={handleResetZoom}
            sx={{ minWidth: 36, color: "white", borderColor: "rgba(255,255,255,0.3)" }}
          >
            ⟲
          </Button>
        </Tooltip>
        <Tooltip title="Fit to Width">
          <Button 
            size="small" 
            variant="outlined" 
            onClick={handleFitToWidth}
            sx={{ minWidth: 36, color: "white", borderColor: "rgba(255,255,255,0.3)" }}
          >
            ⟷
          </Button>
        </Tooltip>
      </Box>

      <div className="document-viewer-container">
        {fileType.startsWith("image/") && (
          <div
            style={{ 
              position: "relative",
              transform: scale === 'fit-width' ? 'none' : `scale(${scale})`,
              transformOrigin: "top center",
              transition: "transform 0.3s ease"
            }}
            onClick={(e) => handlePageClick(e, 1)}
          >
            <img 
              src={fileUrl} 
              alt="review document" 
              style={{
                maxWidth: scale === 'fit-width' ? '100%' : 'none',
                width: scale === 'fit-width' ? '100%' : 'auto'
              }}
            />
            {pinnedComments.map((comment, index) => (
              <Tooltip key={comment._id} title={comment.text}>
                <div
                  className={`comment-pin ${
                    comment._id === activePinId ? "active" : ""
                  }`}
                  style={{
                    left: `${comment.x_coordinate}%`,
                    top: `${comment.y_coordinate}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinClick(comment._id);
                  }}
                >
                  {index + 1}
                </div>
              </Tooltip>
            ))}
          </div>
        )}
        {fileType === "application/pdf" && (
          <div 
            style={{
              transform: scale === 'fit-width' ? 'none' : `scale(${scale})`,
              transformOrigin: "top center",
              transition: "transform 0.3s ease"
            }}
          >
            <PdfDocument file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
              {Array.from(new Array(numPages), (el, index) => {
                const pageNumber = index + 1;
                const pinsForThisPage = pinnedComments.filter(
                  (p) => p.pageNumber === pageNumber
                );
                return (
                  <div
                    key={`page_container_${pageNumber}`}
                    style={{ 
                      position: "relative",
                      marginBottom: pageNumber < numPages ? 16 : 0
                    }}
                    onClick={(e) => handlePageClick(e, pageNumber)}
                  >
                    <Page 
                      pageNumber={pageNumber}
                      width={scale === 'fit-width' ? pageWidth : undefined}
                      scale={scale === 'fit-width' ? undefined : scale}
                    />
                    {pinsForThisPage.map((comment, pinIndex) => (
                      <Tooltip key={comment._id} title={comment.text}>
                        <div
                          className={`comment-pin ${
                            comment._id === activePinId ? "active" : ""
                          }`}
                          style={{
                            left: `${comment.x_coordinate}%`,
                            top: `${comment.y_coordinate}%`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPinClick(comment._id);
                          }}
                        >
                          {pinIndex + 1}
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                );
              })}
            </PdfDocument>
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewPage = () => {
  const { id: documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [activeVersionId, setActiveVersionId] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [socket, setSocket] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [sentiment, setSentiment] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newPinLocation, setNewPinLocation] = useState(null); // {x, y} for a new pending pin
  const [popoverAnchor, setPopoverAnchor] = useState(null); // Anchor for the new comment popover
  const [activePinId, setActivePinId] = useState(null); // To highlight the active pin
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false); // Control auto-scroll behavior

  const token = useSelector((state) => state.auth.token);
  const commentsEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const documentViewerRef = useRef(null); // Ref for the viewer container

  const handleDocClick = ({ x, y, pageNumber }) => {
    const newLocation = { x, y, pageNumber };
    setNewPinLocation(newLocation);

    // Create a virtual element for the popover to anchor to
    const virtualElement = {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        x: (x / 100) * (documentViewerRef.current?.clientWidth || 0),
        y: (y / 100) * (documentViewerRef.current?.clientHeight || 0),
        top: (y / 100) * (documentViewerRef.current?.clientHeight || 0),
        left: (x / 100) * (documentViewerRef.current?.clientWidth || 0),
        right: (x / 100) * (documentViewerRef.current?.clientWidth || 0),
        bottom: (y / 100) * (documentViewerRef.current?.clientHeight || 0),
      }),
    };
    setPopoverAnchor(virtualElement);
  };

  const handleClosePopover = () => {
    setPopoverAnchor(null);
    setNewPinLocation(null);
    setNewComment(""); // Clear comment text on close
  };

  const handleSendPinnedComment = () => {
    if (newComment.trim() && newPinLocation && socket) {
      socket.emit("newComment", {
        documentId,
        text: newComment,
        type: "Pinned",
        coordinates: { x: newPinLocation.x, y: newPinLocation.y },
        pageNumber: newPinLocation.pageNumber,
        version: activeVersionId,
      });
      setShouldAutoScroll(true); // Trigger auto-scroll when sending pinned comment
      handleClosePopover();
    }
  };

  const handleSendGeneralComment = () => {
    if (newComment.trim() && socket) {
      socket.emit("newComment", {
        documentId,
        text: newComment,
        type: "General",
        version: activeVersionId,
      });
      setNewComment("");
      setShouldAutoScroll(true); // Trigger auto-scroll when sending general comment
    }
  };

  // --- FILTER COMMENTS FOR DISPLAY ---
  const generalComments = comments.filter(
    (c) => c.type === "General" || !c.type
  );
  const pinnedComments = comments.filter((c) => c.type === "Pinned");

  const handleRequestChanges = async () => {
    const config = { headers: { "x-auth-token": token } };
    try {
      const res = await axios.put(
        `http://localhost:5000/api/documents/${documentId}/request-changes`,
        {},
        config
      );
      setDocument(res.data);
      setSnackbarMessage("Changes have been requested.");
      setShowSnackbar(true);
    } catch (err) {
      console.error("Error requesting changes:", err);
    }
  };

  const mentionsData = useMemo(() => {
    if (!document || !document.collaborators) return [];
    return document.collaborators.map((user) => ({
      id: user._id,
      display: user.username,
    }));
  }, [document]);

  const handleAnalyzeSentiment = async () => {
    setIsAnalyzing(true);
    const config = { headers: { "x-auth-token": token } };
    try {
      const res = await axios.get(
        `http://localhost:5000/api/documents/${documentId}/sentiment`,
        config
      );
      setSentiment(res.data);
    } catch (err) {
      console.error("Error analyzing sentiment:", err);
      setSnackbarMessage("Failed to analyze sentiment.");
      setShowSnackbar(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchDocumentData = async () => {
    const config = { headers: { "x-auth-token": token } };
    try {
      const docRes = await axios.get(
        `http://localhost:5000/api/documents/${documentId}`,
        config
      );
      setDocument(docRes.data);
      // Always set the active version ID - prefer activeVersion, fallback to latest version
      const versionId = docRes.data.activeVersion?._id || 
                       (docRes.data.versions && docRes.data.versions.length > 0 ? docRes.data.versions[0]._id : null);
      if (versionId) {
        setActiveVersionId(versionId);
      }
      const commentsRes = await axios.get(
        `http://localhost:5000/api/comments/${documentId}`,
        config
      );
      setComments(commentsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    if (token) fetchDocumentData();
  }, [documentId, token]);

  useEffect(() => {
    if (!token) return;
    const newSocket = io("http://localhost:5000", { auth: { token } });
    setSocket(newSocket);
    newSocket.emit("joinRoom", documentId);
    newSocket.on("commentReceived", (comment) => {
      setComments((prev) => [...prev, comment]);
      setShouldAutoScroll(true); // Trigger auto-scroll for new comments
    });
    return () => {
      newSocket.emit("leaveRoom", documentId);
      newSocket.disconnect();
    };
  }, [documentId, token]);

  useEffect(() => {
    // Only auto-scroll when shouldAutoScroll is true (new comments added)
    if (shouldAutoScroll && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
      setShouldAutoScroll(false); // Reset after scrolling
    }
  }, [comments, shouldAutoScroll]);

  const handleSendComment = () => {
    if (newComment.trim() && socket) {
      socket.emit("newComment", { documentId, text: newComment, version: activeVersionId });
      setNewComment("");
      setShouldAutoScroll(true); // Trigger auto-scroll when sending comment
    }
  };

  const handleApprove = async () => {
    const config = { headers: { "x-auth-token": token } };
    try {
      const res = await axios.put(
        `http://localhost:5000/api/documents/${documentId}/status`,
        { status: "Approved" },
        config
      );
      setDocument(res.data);
      setSnackbarMessage("Document Approved!");
      setShowSnackbar(true);
    } catch (err) {
      console.error("Error approving document:", err);
    }
  };

  const handleNewVersionUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    const config = {
      headers: { "Content-Type": "multipart/form-data", "x-auth-token": token },
    };
    try {
      const response = await axios.post(
        `http://localhost:5000/api/documents/${documentId}/version`,
        formData,
        config
      );
      console.log("Upload response:", response.data);
      setSnackbarMessage("New version uploaded successfully!");
      setShowSnackbar(true);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Small delay to ensure server has processed everything
      setTimeout(() => {
        fetchDocumentData(); // Re-fetch all data to get the latest state
      }, 500);
      
    } catch (err) {
      console.error("Error uploading new version:", err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setSnackbarMessage("Authentication error. Please log in again.");
        // Don't automatically logout, let user handle it
      } else if (err.response?.status === 403) {
        setSnackbarMessage("You don't have permission to upload a new version.");
      } else if (err.response?.status >= 500) {
        setSnackbarMessage("Server error. Please try again later.");
      } else {
        setSnackbarMessage("Upload failed. Please try again.");
      }
      setShowSnackbar(true);
    }
  };

  const handleAddCollaborator = async () => {
    if (!collaboratorEmail.trim()) return;
    const config = { headers: { "x-auth-token": token } };
    try {
      await axios.post(
        `http://localhost:5000/api/documents/${documentId}/collaborator`,
        { email: collaboratorEmail },
        config
      );
      setSnackbarMessage("Collaborator added successfully!");
      setShowSnackbar(true);
      setCollaboratorEmail("");
    } catch (err) {
      setSnackbarMessage(
        err.response?.data?.msg || "Error adding collaborator"
      );
      setShowSnackbar(true);
    }
  };

  if (!document)
    return (
      <Container>
        <Typography sx={{ mt: 4 }}>Loading document...</Typography>
      </Container>
    );

  const activeVersion = document.versions.find(
    (v) => v._id === activeVersionId
  );
  const documentUrl = activeVersion
    ? `http://localhost:5000/${activeVersion.path}`
    : "";

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleNewVersionUpload}
        />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            {document.activeVersion.originalName}
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="secondary"
              onClick={() => fileInputRef.current.click()}
            >
              Upload New Version
            </Button>

            <Button
              variant="outlined"
              color="warning"
              onClick={handleRequestChanges}
            >
              Request Changes
            </Button>

            <Button variant="contained" color="success" onClick={handleApprove}>
              Approve Document
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper
              sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid #444" }}
            >
              <Typography variant="h6" gutterBottom>
                <AutoFixHighIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                AI Summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {document.summary}
              </Typography>
            </Paper>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Document Version</InputLabel>
              <Select
                value={activeVersionId}
                label="Document Version"
                onChange={(e) => setActiveVersionId(e.target.value)}
              >
                {document.versions.map((v, index) => (
                  <MenuItem key={v._id} value={v._id}>
                    {`Version ${index + 1} - ${v.originalName} (${new Date(
                      v.createdAt
                    ).toLocaleDateString()})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Paper
              ref={documentViewerRef}
              sx={{ height: "100vh", backgroundColor: "#333", borderRadius: 3 }}
            >
              {activeVersion && (
                <DocumentViewer
                  fileUrl={documentUrl}
                  fileType={activeVersion.mimetype}
                  onDocClick={handleDocClick}
                  pinnedComments={pinnedComments}
                  onPinClick={setActivePinId}
                  activePinId={activePinId}
                />
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Comments Section - Horizontal Layout */}
            <Grid container spacing={2} sx={{ height: "100vh" }}>
              {/* Contextual Comments Section */}
              <Grid item xs={12}>
                <Paper
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    height: "40vh",
                  }}
                >
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    mb: 2,
                    pb: 1,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                  }}>
                    <LocationOnIcon sx={{ mr: 1, color: "#6366f1" }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Contextual Comments
                    </Typography>
                    <Chip 
                      label={pinnedComments.length} 
                      size="small" 
                      sx={{ 
                        ml: "auto",
                        background: "rgba(99, 102, 241, 0.2)",
                        color: "#6366f1"
                      }} 
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
                    <List dense sx={{ py: 0 }}>
                      {pinnedComments.map((comment, index) => (
                        <ListItem
                          key={comment._id}
                          button
                          selected={comment._id === activePinId}
                          onClick={() => setActivePinId(comment._id)}
                          sx={{
                            borderRadius: 3,
                            mb: 1,
                            background: comment._id === activePinId 
                              ? "rgba(99, 102, 241, 0.2)" 
                              : "rgba(255, 255, 255, 0.02)",
                            "&:hover": {
                              background: "rgba(99, 102, 241, 0.1)",
                            }
                          }}
                        >
                          <Box sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            width: "100%"
                          }}>
                            <Chip
                              label={index + 1}
                              size="small"
                              sx={{
                                mr: 1,
                                minWidth: 28,
                                background: "#6366f1",
                                color: "white"
                              }}
                            />
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {comment.author.username}
                                </Typography>
                              }
                              secondary={
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical"
                                  }}
                                >
                                  {comment.text}
                                </Typography>
                              }
                            />
                          </Box>
                        </ListItem>
                      ))}
                      {pinnedComments.length === 0 && (
                        <Box sx={{ 
                          textAlign: "center", 
                          py: 4,
                          color: "text.secondary"
                        }}>
                          <LocationOnIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                          <Typography variant="body2">
                            Click on the document to add contextual comments
                          </Typography>
                        </Box>
                      )}
                    </List>
                  </Box>
                </Paper>
              </Grid>

              {/* General Comments Section */}
              <Grid item xs={12}>
                <Paper
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    height: "40vh",
                  }}
                >
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    mb: 2,
                    pb: 1,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                  }}>
                    <ChatBubbleOutlineIcon sx={{ mr: 1, color: "#ec4899" }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      General Discussion
                    </Typography>
                    <Chip 
                      label={generalComments.length} 
                      size="small" 
                      sx={{ 
                        ml: "auto",
                        background: "rgba(236, 72, 153, 0.2)",
                        color: "#ec4899"
                      }} 
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
                    <List dense sx={{ py: 0 }}>
                      {generalComments.map((comment) => (
                        <ListItem
                          key={comment._id}
                          sx={{
                            borderRadius: 3,
                            mb: 1,
                            background: "rgba(255, 255, 255, 0.02)",
                            "&:hover": {
                              background: "rgba(236, 72, 153, 0.1)",
                            }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {comment.author.username}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                {comment.text}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                      {generalComments.length === 0 && (
                        <Box sx={{ 
                          textAlign: "center", 
                          py: 4,
                          color: "text.secondary"
                        }}>
                          <ChatBubbleOutlineIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                          <Typography variant="body2">
                            Start a general discussion about this document
                          </Typography>
                        </Box>
                      )}
                      <div ref={commentsEndRef} />
                    </List>
                  </Box>
                  <Box sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", pt: 2 }}>
                    <MentionsInput
                      value={newComment}
                      onChange={(event) => setNewComment(event.target.value)}
                      placeholder="Add a general comment..."
                      className="mentions"
                      style={{
                        control: {
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          fontSize: 14,
                          fontWeight: 'normal',
                          borderRadius: 3,
                        },
                        highlighter: {
                          padding: 12,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 3,
                        },
                        input: {
                          padding: 12,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 3,
                          color: 'white',
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      <Mention
                        trigger="@"
                        data={mentionsData}
                        markup="@[__display__](__id__)"
                        style={{ backgroundColor: "#6366f1", color: "white", borderRadius: 12 }}
                      />
                    </MentionsInput>
                    <Button
                      variant="contained"
                      onClick={handleSendGeneralComment}
                      disabled={!newComment.trim()}
                      sx={{ 
                        mt: 1,
                        background: "linear-gradient(135deg, #ec4899, #be185d)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #db2777, #9d174d)",
                        }
                      }}
                      fullWidth
                    >
                      Send Comment
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Actions Section */}
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 2, 
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  height: "20vh"
                }}>
                  <Grid container spacing={2} sx={{ height: "100%" }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Manage Access
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Add user by email"
                        size="small"
                        value={collaboratorEmail}
                        onChange={(e) => setCollaboratorEmail(e.target.value)}
                        sx={{ mb: 1 }}
                      />
                      <Button
                        variant="outlined"
                        onClick={handleAddCollaborator}
                        fullWidth
                        size="small"
                      >
                        Add Collaborator
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        AI Analysis
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={handleAnalyzeSentiment}
                        disabled={isAnalyzing}
                        fullWidth
                        startIcon={<AutoFixHighIcon />}
                        sx={{
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #5855eb, #7c3aed)",
                          }
                        }}
                      >
                        {isAnalyzing ? "Analyzing..." : "Analyze Sentiment"}
                      </Button>
                      {sentiment && (
                        <SentimentDisplay sentiment={sentiment} />
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Popover
          open={Boolean(popoverAnchor)}
          anchorEl={popoverAnchor}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Box sx={{ p: 2, width: 300 }}>
            <Typography variant="subtitle1" gutterBottom>
              Add a comment at this location
            </Typography>
            <MentionsInput
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Add a pinned comment..."
              className="mentions"
            >
              <Mention
                trigger="@"
                data={mentionsData}
                markup="@[__display__](__id__)"
              />
            </MentionsInput>
            <Button
              variant="contained"
              onClick={handleSendPinnedComment}
              sx={{ mt: 1 }}
              fullWidth
            >
              Save Pin
            </Button>
          </Box>
        </Popover>

        <Snackbar
          open={showSnackbar}
          autoHideDuration={4000}
          onClose={() => setShowSnackbar(false)}
          message={snackbarMessage}
        />
      </Container>
    </motion.div>
  );
};

export default ReviewPage;
