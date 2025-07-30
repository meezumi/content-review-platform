import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Container,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Chip,
} from "@mui/material";

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    const config = { headers: { "x-auth-token": token } };
    try {
     
      const res = await axios.get(
        "http://localhost:5000/api/documents/all",
        config
      );
      setDocuments(res.data);
    } catch (err) {
      console.error("Error fetching documents", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token]);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onFileUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-auth-token": token,
      },
    };
    try {
      // Use the new initial upload endpoint
      await axios.post(
        "http://localhost:5000/api/documents/upload",
        formData,
        config
      );
      setFile(null); // Clear the file input
      document.querySelector('input[type="file"]').value = ""; // Also clear the browser's input field display
      fetchDocuments(); // Refresh the list
    } catch (err) {
      console.error("Error uploading file", err);
    }
  };

  const handleReviewClick = (docId) => {
    navigate(`/review/${docId}`);
  };

  const getStatusChip = (status) => {
    let color;
    switch (status) {
      case "Approved":
        color = "success";
        break;
      case "Requires Changes":
        color = "warning";
        break;
      default:
        color = "primary";
        break;
    }
    return (
      <Chip
        label={status || "In Review"}
        color={color}
        size="small"
        sx={{ mr: 2 }}
      />
    );
  };

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 4,
          mb: 2,
        }}
      >
        <Typography variant="h4">My Dashboard</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Upload New Document</Typography>
        <input
          type="file"
          onChange={onFileChange}
          style={{ margin: "10px 0" }}
        />
        <Button variant="contained" onClick={onFileUpload} disabled={!file}>
          Upload
        </Button>
      </Paper>

      <Typography variant="h5">My Documents</Typography>
      <List>
        {documents.map((doc) => (
          <ListItem key={doc._id} divider component={Paper} sx={{ mt: 1 }}>
            <ListItemText
              primary={doc.activeVersion?.originalName || "Processing..."}
              secondary={`Uploaded on: ${new Date(
                doc.createdAt
              ).toLocaleDateString()}`}
            />
            {getStatusChip(doc.status)}
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleReviewClick(doc._id)}
            >
              Review
            </Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Dashboard;
