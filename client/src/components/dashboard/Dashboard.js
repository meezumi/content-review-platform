import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Container,
  Button,
  Box,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  LinearProgress,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const fetchDashboardAnalytics = async () => {
    if (!token) return;
    const config = { headers: { "x-auth-token": token } };
    try {
      const [statsRes, activityRes] = await Promise.all([
        axios.get("http://localhost:5000/api/analytics/stats", config),
        axios.get("http://localhost:5000/api/analytics/activity-over-time", config),
      ]);
      
      setDashboardStats(statsRes.data);
      setActivityData(activityRes.data);
      
      // Generate status distribution from current documents
      const statusCounts = documents.reduce((acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      }, {});
      
      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
        color: status === 'Approved' ? '#10b981' : 
               status === 'Requires Changes' ? '#f59e0b' : '#6366f1'
      }));
      
      setStatusDistribution(statusData);
    } catch (err) {
      console.error("Error fetching dashboard analytics", err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDocuments(), fetchDashboardAnalytics()]);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

    useEffect(() => {
      if (token) {
        fetchDocuments();
        fetchDashboardAnalytics();
      }
    }, [token]);

    useEffect(() => {
      // Update status distribution when documents change
      if (documents.length > 0) {
        const statusCounts = documents.reduce((acc, doc) => {
          acc[doc.status] = (acc[doc.status] || 0) + 1;
          return acc;
        }, {});
        
        const statusData = Object.entries(statusCounts).map(([status, count]) => ({
          name: status,
          value: count,
          color: status === 'Approved' ? '#10b981' : 
                 status === 'Requires Changes' ? '#f59e0b' : '#6366f1'
        }));
        
        setStatusDistribution(statusData);
      }
    }, [documents]);


  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onFileUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category); 
    
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-auth-token": token,
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(progress);
      },
    };
    
    try {
      await axios.post(
        "http://localhost:5000/api/documents/upload",
        formData,
        config
      );
      setFile(null);
      setUploadProgress(100);
      
      // Clear file input
      if (document.querySelector('input[type="file"]')) {
        document.querySelector('input[type="file"]').value = "";
      }
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        fetchDocuments(); // Refresh the list
      }, 500);
      
    } catch (err) {
      console.error("Error uploading file", err);
      setIsUploading(false);
      setUploadProgress(0);
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

  const statsData = [
    {
      title: "Total Documents",
      value: documents.length,
      icon: <DocumentIcon />,
      color: "#6366f1",
      change: "+12%"
    },
    {
      title: "In Review", 
      value: documents.filter(doc => !doc.status || doc.status === "In Review").length,
      icon: <SpeedIcon />,
      color: "#ec4899",
      change: "+5%"
    },
    {
      title: "Approved",
      value: documents.filter(doc => doc.status === "Approved").length,
      icon: <TrendingIcon />,
      color: "#10b981",
      change: "+18%"
    },
    {
      title: "Collaborators",
      value: 8, // This would come from your API
      icon: <GroupsIcon />,
      color: "#f59e0b",
      change: "+2%"
    }
  ];

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                mb: 1,
                fontWeight: 800,
                background: "linear-gradient(135deg, #6366f1, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage and track your document reviews
            </Typography>
          </Box>
          <Tooltip title="Refresh Dashboard">
            <IconButton 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              sx={{
                background: "rgba(99, 102, 241, 0.1)",
                "&:hover": { background: "rgba(99, 102, 241, 0.2)" }
              }}
            >
              <RefreshIcon sx={{ 
                color: "#6366f1",
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        sx={{
                          background: `${stat.color}20`,
                          color: stat.color,
                          mr: 2,
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {stat.title}
                        </Typography>
                        <Chip
                          label={stat.change}
                          size="small"
                          color="success"
                          sx={{ 
                            background: "rgba(16, 185, 129, 0.1)",
                            color: "#10b981",
                            fontWeight: 600,
                            fontSize: "0.7rem"
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Interactive Dashboard Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Activity Chart */}
          <Grid item xs={12} lg={8}>
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <Paper sx={{ p: 3, height: 400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Document Activity (Last 30 Days)
                  </Typography>
                  <TrendingIcon sx={{ color: '#6366f1' }} />
                </Box>
                <ResponsiveContainer width="100%" height="90%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area
                      type="monotone"
                      dataKey="documents"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorUv)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>

          {/* Status Distribution */}
          <Grid item xs={12} lg={4}>
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <Paper sx={{ p: 3, height: 400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Document Status
                  </Typography>
                  <CheckCircleIcon sx={{ color: '#10b981' }} />
                </Box>
                {statusDistribution.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ mt: 2 }}>
                      {statusDistribution.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              backgroundColor: item.color, 
                              mr: 1 
                            }} 
                          />
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            {item.name}: {item.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                ) : (
                  <Box sx={{ 
                    height: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary'
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                    <Typography variant="body2" textAlign="center">
                      Upload documents to see status distribution
                    </Typography>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Upload Section */}
        <motion.div variants={itemVariants}>
          <Paper 
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: "linear-gradient(90deg, #6366f1, #ec4899)",
              }
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <UploadIcon sx={{ mr: 2, fontSize: 28, color: "#6366f1" }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Upload New Document
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drag and drop or click to select files for review
                </Typography>
              </Box>
            </Box>

            <Box sx={{ 
              display: "flex", 
              gap: 2, 
              alignItems: "flex-end",
              flexWrap: { xs: "wrap", md: "nowrap" }
            }}>
              <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                <Button 
                  variant="outlined" 
                  component="label"
                  fullWidth
                  startIcon={<UploadIcon />}
                  sx={{
                    py: 2,
                    borderStyle: "dashed",
                    borderWidth: 2,
                    "&:hover": {
                      borderStyle: "dashed",
                      borderColor: "#6366f1",
                      background: "rgba(99, 102, 241, 0.05)",
                    }
                  }}
                >
                  {file ? "Change File" : "Choose File"}
                  <input type="file" hidden onChange={onFileChange} />
                </Button>
                
                {file && (
                  <Fade in={Boolean(file)}>
                    <Box sx={{ mt: 1, p: 1, background: "rgba(99, 102, 241, 0.1)", borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        📄 {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  </Fade>
                )}
              </Box>

              <FormControl sx={{ minWidth: 180 }}>
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
                disabled={!file || isUploading}
                startIcon={<UploadIcon />}
                sx={{
                  py: 2,
                  px: 4,
                  minWidth: 140,
                }}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </Box>

            {isUploading && (
              <Fade in={isUploading}>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2">Uploading...</Typography>
                    <Typography variant="body2">{uploadProgress}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress}
                    sx={{
                      height: 8,
                      borderRadius: 1.5,
                      background: "rgba(99, 102, 241, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #6366f1, #ec4899)",
                      }
                    }}
                  />
                </Box>
              </Fade>
            )}
          </Paper>
        </motion.div>

        {/* Documents Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              My Documents
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {filteredDocuments.length} documents found
            </Typography>
          </Box>
          
          <Tooltip title="Filter documents">
            <IconButton>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Filter Chips */}
        <Box sx={{ display: "flex", gap: 1, mb: 4, flexWrap: "wrap" }}>
          {["All", ...DOCUMENT_CATEGORIES].map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setFilter(cat)}
              color={filter === cat ? "primary" : "default"}
              sx={{
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
                ...(filter === cat && {
                  background: "linear-gradient(135deg, #6366f1, #ec4899)",
                  color: "white",
                })
              }}
            />
          ))}
        </Box>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate('/shared')}
                  sx={{ 
                    py: 1.5,
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                    '&:hover': {
                      borderColor: '#6366f1',
                      background: 'rgba(99, 102, 241, 0.1)'
                    }
                  }}
                >
                  View All
                </Button>
              </Grid>
              <Grid item xs={6} sm={3} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setFilter('In Review')}
                  sx={{ 
                    py: 1.5,
                    borderColor: 'rgba(236, 72, 153, 0.5)',
                    '&:hover': {
                      borderColor: '#ec4899',
                      background: 'rgba(236, 72, 153, 0.1)'
                    }
                  }}
                >
                  Pending
                </Button>
              </Grid>
              <Grid item xs={6} sm={3} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setFilter('Approved')}
                  sx={{ 
                    py: 1.5,
                    borderColor: 'rgba(16, 185, 129, 0.5)',
                    '&:hover': {
                      borderColor: '#10b981',
                      background: 'rgba(16, 185, 129, 0.1)'
                    }
                  }}
                >
                  Approved
                </Button>
              </Grid>
              <Grid item xs={6} sm={3} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PendingIcon />}
                  onClick={() => navigate('/analytics')}
                  sx={{ 
                    py: 1.5,
                    borderColor: 'rgba(6, 182, 212, 0.5)',
                    '&:hover': {
                      borderColor: '#06b6d4',
                      background: 'rgba(6, 182, 212, 0.1)'
                    }
                  }}
                >
                  Analytics
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Documents Grid */}
        <motion.div variants={listVariants} initial="hidden" animate="visible">
          <Grid container spacing={3}>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <Grid item xs={12} sm={6} lg={4} xl={3} key={doc._id}>
                  <DocumentCard doc={doc} onReviewClick={handleReviewClick} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 8, 
                  textAlign: "center",
                  background: "rgba(255, 255, 255, 0.02)"
                }}>
                  <DocumentIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                    No documents found
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {filter === "All" 
                      ? "Upload your first document to get started"
                      : `No documents in ${filter} category`
                    }
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default Dashboard;
