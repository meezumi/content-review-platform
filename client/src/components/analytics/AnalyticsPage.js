import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Container, Grid, Paper, Typography, Box } from "@mui/material";
import {
  Description as DocumentIcon,
  People as UsersIcon,
  Chat as CommentsIcon,
  Schedule as TimeIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import moment from "moment";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = { type: "tween", ease: "anticipate", duration: 0.5 };

const StatCard = ({ title, value, icon }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    <Paper sx={{ 
      p: 3, 
      textAlign: 'center', 
      borderRadius: 3,
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }
    }}>
      {icon && (
        <Box sx={{ mb: 1, color: 'primary.main', fontSize: '2rem' }}>
          {icon}
        </Box>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ 
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: 1,
        mb: 1
      }}>
        {title}
      </Typography>
      <Typography variant="h3" color="primary" sx={{ 
        fontWeight: 700,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        {value}
      </Typography>
    </Paper>
  </motion.div>
);

const AnalyticsPage = () => {
  const [stats, setStats] = useState({});
  const [avgApprovalTime, setAvgApprovalTime] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      const config = { headers: { "x-auth-token": token } };
      try {
        const [statsRes, categoryRes, activityRes, approvalTimeRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/analytics/stats", config),
            axios.get(
              "http://localhost:5000/api/analytics/docs-by-category",
              config
            ),
            axios.get(
              "http://localhost:5000/api/analytics/activity-over-time",
              config
            ),
            axios.get(
              "http://localhost:5000/api/analytics/approval-time",
              config
            ),
          ]);
        setStats(statsRes.data);                        
        setAvgApprovalTime(approvalTimeRes.data.avgMillis);
        setCategoryData(categoryRes.data);
        setActivityData(activityRes.data);
      } catch (err) {
        console.error("Failed to fetch analytics data", err);
      }
    };
    fetchData();
  }, [token]);

  const formatDuration = (millis) => {
    if (!millis || millis === 0) return "N/A";
    const duration = moment.duration(millis);
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              mb: 1,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}
          >
            Analytics Hub
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              textAlign: 'center', 
              mb: 4,
              fontWeight: 400,
              opacity: 0.8
            }}
          >
            Comprehensive insights into your document workflow
          </Typography>
        </motion.div>
        <Grid container spacing={3}>
          {/* Stat Cards */}
          {[
            { title: "Total Documents", value: stats.totalDocs || 0, icon: <DocumentIcon /> },
            { title: "Total Users", value: stats.totalUsers || 0, icon: <UsersIcon /> },
            { title: "Total Comments", value: stats.totalComments || 0, icon: <CommentsIcon /> },
            { title: "Avg. Approval Time", value: formatDuration(avgApprovalTime), icon: <TimeIcon /> },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <StatCard 
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                />
              </motion.div>
            </Grid>
          ))}

          {/* Pie Chart */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Paper sx={{ 
                p: 3, 
                height: 400, 
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 600,
                  color: 'primary.main',
                  mb: 2
                }}>
                  Documents by Category
                </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
            </motion.div>
          </Grid>

          {/* Line Chart */}
          <Grid item xs={12} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Paper sx={{ 
                p: 3, 
                height: 400, 
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 600,
                  color: 'primary.main',
                  mb: 2
                }}>
                  Upload Activity (Last 30 Days)
                </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart
                  data={activityData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="documents"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </motion.div>
  );
};

export default AnalyticsPage;
