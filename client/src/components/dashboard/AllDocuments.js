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
      staggerChildren: 0.07,
    },
  },
};

const AllDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState("All"); 
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

    const DOCUMENT_CATEGORIES = [
      "General",
      "Marketing",
      "Legal",
      "Design",
      "Technical",
    ];


  useEffect(() => {
    const fetchAllDocuments = async () => {
      if (!token) return;
      const config = { headers: { "x-auth-token": token } };
      try {
        const res = await axios.get(
          "http://localhost:5000/api/documents/shared",
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

    const filteredDocuments = documents.filter(
      (doc) => filter === "All" || doc.category === filter
    );


  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
          <Typography variant="h4">Shared With Me</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{mr: 2, fontWeight: '500'}}>Filter by Category:</Typography>
            {['All', ...DOCUMENT_CATEGORIES].map(cat => (
                <Chip key={cat} label={cat} onClick={() => setFilter(cat)} color={filter === cat ? 'primary' : 'default'} />
            ))}
        </Box>
      
      <motion.div variants={listVariants} initial="hidden" animate="visible">
      {filteredDocuments.length === 0 ? (
                <Typography sx={{ mt: 4, textAlign: 'center' }}>No documents have been shared with you yet.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {filteredDocuments.map(doc => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={doc._id}>
                            <DocumentCard doc={doc} onReviewClick={handleReviewClick} />
                        </Grid>
                    ))}
                </Grid>
            )}
      </motion.div>
    </Container>
    </motion.div>
  );
};

export default AllDocuments;
