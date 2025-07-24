import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

// Connect to the backend Socket.IO server
const socket = io("http://localhost:5000");

function App() {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // Listen for incoming 'new_comment' events from the server
    socket.on("new_comment", (newComment) => {
      setComments((prevComments) => [...prevComments, newComment]);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSendComment = () => {
    if (comment.trim()) {
      const newComment = {
        text: comment,
        timestamp: new Date().toLocaleTimeString(),
      };
      // Add the comment to our local state immediately
      setComments((prevComments) => [...prevComments, newComment]);
      // Send the comment to the server
      socket.emit("comment", newComment);
      setComment("");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Real-time Content Review
        </Typography>
        <Box
          sx={{
            mb: 2,
            p: 2,
            border: "1px solid #ccc",
            borderRadius: "4px",
            height: "300px",
            overflowY: "auto",
          }}
        >
          <List>
            {comments.map((c, index) => (
              <ListItem key={index}>
                <ListItemText primary={c.text} secondary={c.timestamp} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box display="flex">
          <TextField
            fullWidth
            variant="outlined"
            label="Add a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendComment()}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendComment}
            sx={{ ml: 1 }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
