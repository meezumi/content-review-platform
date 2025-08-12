import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Container, Grid, Paper, Typography, Box } from "@mui/material";
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

const StatCard = ({ title, value }) => (
    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">{title}</Typography>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mt: 1 }}>{value}</Typography>
    </Paper>
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
        <Typography variant="h4" gutterBottom>
          Analytics Hub
        </Typography>
        <Grid container spacing={3}>
          {/* Stat Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Documents" value={stats.totalDocs || 0} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Users" value={stats.totalUsers || 0} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Comments" value={stats.totalComments || 0} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg. Approval Time"
              value={formatDuration(avgApprovalTime)}
            />
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2, height: 400, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
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
          </Grid>

          {/* Line Chart */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 2, height: 400, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
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
          </Grid>
        </Grid>
      </Container>
    </motion.div>
  );
};

export default AnalyticsPage;
