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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import DocumentCard from "./DocumentCard";


const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};



const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [category, setCategory] = useState("General"); // State for new doc category
  const [filter, setFilter] = useState("All"); // State for filtering list
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const DOCUMENT_CATEGORIES = [
      "General",
      "Marketing",
      "Legal",
      "Design",
      "Technical",
  ];
  
  const fetchDocuments = async () => {
    if (!token) return;
    const config = { headers: { "x-auth-token": token } };
    try {
      // This is the updated endpoint for the user's own documents
      const res = await axios.get(
        "http://localhost:5000/api/documents/mine",
        config
      );
      setDocuments(res.data);
    } catch (err) {
      console.error("Error fetching documents", err);
    }
  };

    useEffect(() => {
      if (token) fetchDocuments();
    }, [token]);


  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onFileUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category); 
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
      setFile(null);
      // A more robust way to clear the file input's displayed text
      if (document.querySelector('input[type="file"]')) {
        document.querySelector('input[type="file"]').value = "";
      }
      fetchDocuments(); // Refresh the list with the newly uploaded document
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

  const filteredDocuments = documents.filter(
    (doc) => filter === "All" || doc.category === filter
  );

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
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

        <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Upload New Document
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button variant="outlined" component="label">
              Choose File
              <input type="file" hidden onChange={onFileChange} />
            </Button>
            {file && <Typography variant="body2">{file.name}</Typography>}
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={onFileUpload}
              disabled={!file}
              sx={{ ml: "auto" }}
            >
              Upload
            </Button>
          </Box>
        </Paper>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" sx={{ mr: 2 }}>
            My Documents
          </Typography>
          {["All", ...DOCUMENT_CATEGORIES].map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setFilter(cat)}
              color={filter === cat ? "primary" : "default"}
            />
          ))}
        </Box>

        <motion.div variants={listVariants} initial="hidden" animate="visible">
          <Grid container spacing={3}>
            {filteredDocuments.map((doc) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doc._id}>
                <DocumentCard doc={doc} onReviewClick={handleReviewClick} />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default Dashboard;
