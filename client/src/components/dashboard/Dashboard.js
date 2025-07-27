import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Typography,
  Container,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const token = useSelector((state) => state.auth.token);

  const fetchDocuments = async () => {
    const config = { headers: { "x-auth-token": token } };
    try {
      const res = await axios.get(
        "http://localhost:5000/api/documents",
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
      await axios.post(
        "http://localhost:5000/api/documents/upload",
        formData,
        config
      );
      setFile(null); // Clear the file input
      fetchDocuments(); // Refresh the list
    } catch (err) {
      console.error("Error uploading file", err);
    }
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
        <Typography variant="h4">Dashboard</Typography>
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
              primary={doc.originalName}
              secondary={`Uploaded on: ${new Date(
                doc.createdAt
              ).toLocaleDateString()}`}
            />
            {/* In a real app, clicking this would navigate to the review page */}
            <Button variant="outlined" size="small">
              Review
            </Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Dashboard;
