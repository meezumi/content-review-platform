import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
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
} from "@mui/material";

import { motion } from "framer-motion";

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
  const token = useSelector((state) => state.auth.token);
  const commentsEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchDocumentData = async () => {
    const config = { headers: { "x-auth-token": token } };
    try {
      const docRes = await axios.get(
        `http://localhost:5000/api/documents/${documentId}`,
        config
      );
      setDocument(docRes.data);
      if (docRes.data.versions && docRes.data.versions.length > 0) {
        setActiveVersionId(docRes.data.versions[0]._id);
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
    newSocket.on("commentReceived", (comment) =>
      setComments((prev) => [...prev, comment])
    );
    return () => {
      newSocket.emit("leaveRoom", documentId);
      newSocket.disconnect();
    };
  }, [documentId, token]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSendComment = () => {
    if (newComment.trim() && socket) {
      socket.emit("newComment", { documentId, text: newComment });
      setNewComment("");
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
      await axios.post(
        `http://localhost:5000/api/documents/${documentId}/version`,
        formData,
        config
      );
      setSnackbarMessage("New version uploaded successfully!");
      setShowSnackbar(true);
      fetchDocumentData(); // Re-fetch all data to get the latest state
    } catch (err) {
      console.error("Error uploading new version:", err);
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
        >
          <Typography variant="h4" gutterBottom>
            {document.activeVersion.originalName}
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => fileInputRef.current.click()}
              sx={{ mr: 2 }}
            >
              Upload New Version
            </Button>
            <Button variant="contained" color="success" onClick={handleApprove}>
              Approve Document
            </Button>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
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
            <Paper sx={{ height: "75vh", p: 1, backgroundColor: "#f5f5f5" }}>
              {documentUrl && (
                <iframe
                  src={documentUrl}
                  title={activeVersion.originalName}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{ height: "85vh", display: "flex", flexDirection: "column" }}
            >
              <Typography
                variant="h6"
                sx={{ p: 2, borderBottom: "1px solid #eee" }}
              >
                Comments
              </Typography>
              <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
                <List>
                  {comments.map((comment) => (
                    <React.Fragment key={comment._id}>
                      <ListItem>
                        <ListItemText
                          primary={<strong>{comment.author.username}</strong>}
                          secondary={comment.text}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                  <div ref={commentsEndRef} />
                </List>
              </Box>
              <Box sx={{ p: 2, borderTop: "1px solid #eee" }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Add a comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendComment()}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendComment}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Send
                </Button>
              </Box>
              {/* --- PERMISSIONS UI --- */}
              <Box sx={{ p: 2, borderTop: "1px solid #eee" }}>
                <Typography variant="h6">Manage Access</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Add user by email"
                  value={collaboratorEmail}
                  onChange={(e) => setCollaboratorEmail(e.target.value)}
                  sx={{ mt: 1, mb: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddCollaborator}
                  fullWidth
                >
                  Add Collaborator
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
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
