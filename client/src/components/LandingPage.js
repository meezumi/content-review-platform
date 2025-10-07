import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  CloudUpload as CloudIcon,
  Groups as GroupsIcon,
  AutoAwesome as AIIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const features = [
    {
      icon: <AIIcon />,
      title: "AI-Powered Reviews",
      description: "Get intelligent insights and suggestions for your documents using advanced AI technology."
    },
    {
      icon: <SpeedIcon />,
      title: "Lightning Fast",
      description: "Process documents in seconds, not hours. Streamline your entire review workflow."
    },
    {
      icon: <GroupsIcon />,
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time comments and collaborative review tools."
    },
    {
      icon: <SecurityIcon />,
      title: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption for your sensitive documents."
    },
    {
      icon: <AnalyticsIcon />,
      title: "Smart Analytics",
      description: "Track review progress and performance with detailed analytics and insights."
    },
    {
      icon: <CloudIcon />,
      title: "Cloud Storage",
      description: "Access your documents anywhere with secure cloud storage and backup."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      features: ["Up to 10 documents/month", "Basic AI reviews", "2 team members", "Email support"]
    },
    {
      name: "Professional",
      price: "$29/mo",
      features: ["Unlimited documents", "Advanced AI insights", "Unlimited team members", "Priority support", "Analytics dashboard"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: ["Everything in Pro", "Custom integrations", "Dedicated support", "SLA guarantee", "On-premise option"]
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} lg={6}>
              <motion.div variants={itemVariants}>
                <Chip
                  label="🚀 Now with Advanced AI"
                  sx={{
                    mb: 3,
                    background: "rgba(99, 102, 241, 0.1)",
                    color: "#6366f1",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    mb: 3,
                    fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                    lineHeight: 1.1,
                  }}
                >
                  Transform Your Content Review Process
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 4, lineHeight: 1.6, maxWidth: 600 }}
                >
                  Streamline document reviews with AI-powered insights, real-time collaboration, 
                  and intelligent workflow automation. Make your content review process 10x faster.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowIcon />}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: "1.1rem",
                    }}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: "1.1rem",
                    }}
                  >
                    Watch Demo
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} lg={6}>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Box
                  sx={{
                    position: "relative",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 4,
                    p: 4,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
                    🎯 Dashboard Preview
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      Interactive Dashboard Coming Soon
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 12, background: "rgba(255, 255, 255, 0.02)" }}>
        <Container maxWidth="lg">
          <motion.div variants={itemVariants}>
            <Typography
              variant="h2"
              textAlign="center"
              sx={{ mb: 2 }}
            >
              Why Choose ContentFlow?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 8, maxWidth: 600, mx: "auto" }}
            >
              Everything you need to revolutionize your content review workflow
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card sx={{ height: "100%" }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #6366f1, #ec4899)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 3,
                          color: "white",
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="lg">
          <motion.div variants={itemVariants}>
            <Typography
              variant="h2"
              textAlign="center"
              sx={{ mb: 2 }}
            >
              Simple, Transparent Pricing
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 8 }}
            >
              Choose the perfect plan for your team
            </Typography>
          </motion.div>

          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      position: "relative",
                      ...(plan.popular && {
                        border: "2px solid #6366f1",
                        transform: "scale(1.05)",
                      }),
                    }}
                  >
                    {plan.popular && (
                      <Chip
                        label="Most Popular"
                        color="primary"
                        sx={{
                          position: "absolute",
                          top: -12,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "linear-gradient(135deg, #6366f1, #ec4899)",
                        }}
                      />
                    )}
                    <CardContent sx={{ p: 4, textAlign: "center" }}>
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="h3" sx={{ mb: 3, color: "#6366f1" }}>
                        {plan.price}
                      </Typography>
                      <Stack spacing={2} sx={{ mb: 4 }}>
                        {plan.features.map((feature, featureIndex) => (
                          <Box
                            key={featureIndex}
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                          >
                            <CheckIcon sx={{ color: "#10b981", fontSize: 20 }} />
                            <Typography variant="body2">{feature}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ p: 4, pt: 0 }}>
                      <Button
                        fullWidth
                        variant={plan.popular ? "contained" : "outlined"}
                        size="large"
                      >
                        Get Started
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 12,
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <motion.div variants={itemVariants}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Ready to Transform Your Workflow?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.6 }}
            >
              Join thousands of teams who have already revolutionized their content review process
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                endIcon={<ArrowIcon />}
                sx={{ py: 2, px: 4, fontSize: "1.1rem" }}
              >
                Start Your Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ py: 2, px: 4, fontSize: "1.1rem" }}
              >
                Schedule Demo
              </Button>
            </Stack>
          </motion.div>
        </Container>
      </Box>
    </motion.div>
  );
};

export default LandingPage;