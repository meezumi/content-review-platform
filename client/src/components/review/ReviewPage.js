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
} from "@mui/material";

const ReviewPage = () => {
  const { id: documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [socket, setSocket] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const commentsEndRef = useRef(null);

  // Effect to establish and clean up socket connection
  useEffect(() => {
    if (!token) return;
    const newSocket = io("http://localhost:5000", { auth: { token } });
    setSocket(newSocket);
    newSocket.emit("joinRoom", documentId);
    newSocket.on("commentReceived", (comment) => {
      setComments((prevComments) => [...prevComments, comment]);
    });
    return () => {
      newSocket.emit("leaveRoom", documentId);
      newSocket.disconnect();
    };
  }, [documentId, token]);

  // Effect to fetch initial document and comment data
  useEffect(() => {
    const fetchData = async () => {
      const config = { headers: { "x-auth-token": token } };
      try {
        const docRes = await axios.get(
          `http://localhost:5000/api/documents/${documentId}`,
          config
        );
        setDocument(docRes.data);
        const commentsRes = await axios.get(
          `http://localhost:5000/api/comments/${documentId}`,
          config
        );
        setComments(commentsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (token) fetchData();
  }, [documentId, token]);

  // Effect to scroll to the bottom of the comments list when new comments arrive
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSendComment = () => {
    if (newComment.trim() && socket) {
      socket.emit("newComment", { documentId, text: newComment });
      setNewComment("");
    }
  };

  if (!document)
    return (
      <Container>
        <Typography sx={{ mt: 4 }}>Loading document...</Typography>
      </Container>
    );

  const documentUrl = `http://localhost:5000/${document.path}`;

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {document.originalName}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: "80vh", p: 1, backgroundColor: "#f5f5f5" }}>
            <iframe
              src={documentUrl}
              title={document.originalName}
              width="100%"
              height="100%"
              frameBorder="0"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{ height: "80vh", display: "flex", flexDirection: "column" }}
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
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={<strong>{comment.author.username}</strong>}
                        secondary={comment.text}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
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
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReviewPage;
