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

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};
const StatCard = ({ title, value }) => (
  <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
    <Typography variant="h6">{title}</Typography>
    <Typography variant="h4" color="primary">
      {value}
    </Typography>
  </Paper>
);

const AnalyticsPage = () => {
  const [stats, setStats] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      const config = { headers: { "x-auth-token": token } };
      try {
        const [statsRes, categoryRes, activityRes] = await Promise.all([
          axios.get("http://localhost:5000/api/analytics/stats", config),
          axios.get(
            "http://localhost:5000/api/analytics/docs-by-category",
            config
          ),
          axios.get(
            "http://localhost:5000/api/analytics/activity-over-time",
            config
          ),
        ]);
        setStats(statsRes.data);
        setCategoryData(categoryRes.data);
        setActivityData(activityRes.data);
      } catch (err) {
        console.error("Failed to fetch analytics data", err);
      }
    };
    fetchData();
  }, [token]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Hub
        </Typography>
        <Grid container spacing={3}>
          {/* Stat Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Documents" value={stats.totalDocs} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Users" value={stats.totalUsers} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Comments" value={stats.totalComments} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Approved Documents" value={stats.approvedDocs} />
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: 400, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Documents by Category
              </Typography>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
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
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: 400, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Upload Activity (Last 30 Days)
              </Typography>
              <ResponsiveContainer>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
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
