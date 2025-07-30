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

const AllDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllDocuments = async () => {
      if (!token) return;
      const config = { headers: { "x-auth-token": token } };
      try {
        const res = await axios.get(
          "http://localhost:5000/api/documents/all",
          config
        );
        setDocuments(res.data);
      } catch (err) {
        console.error("Error fetching all documents", err);
      }
    };
    fetchAllDocuments();
  }, [token]);

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
        <Typography variant="h4">All Company Documents</Typography>
      </Box>
      <List>
        {documents.length === 0 ? (
          <Typography>No documents have been uploaded yet.</Typography>
        ) : (
          documents.map((doc) => (
            <ListItem key={doc._id} divider component={Paper} sx={{ mt: 1 }}>
              <ListItemText
                primary={doc.activeVersion?.originalName || "Processing..."}
                secondary={`Uploaded by: ${
                  doc.uploader?.username || "Unknown"
                } on ${new Date(doc.createdAt).toLocaleDateString()}`}
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
          ))
        )}
      </List>
    </Container>
  );
};

export default AllDocuments;
