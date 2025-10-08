import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../features/auth/authSlice";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Chip
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  Login as LoginIcon,
  ArrowBack
} from "@mui/icons-material";
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error when user starts typing
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/login",
        formData
      );
      dispatch(loginSuccess({ token: res.data.token }));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
      }}
    >
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={{ width: "100%", maxWidth: 480 }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6 },
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 3,
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  mb: 1,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #6366f1, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to continue to ContentFlow
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                  {error}
                </Alert>
              </motion.div>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={onSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={onChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={onChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "text.secondary" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<LoginIcon />}
                sx={{
                  py: 1.5,
                  mb: 3,
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Link
                  href="#"
                  sx={{
                    color: "text.secondary",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    "&:hover": {
                      color: "#6366f1",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Forgot your password?
                </Link>
              </Box>
            </Box>

            {/* Divider */}
            <Box sx={{ my: 4 }}>
              <Divider>
                <Chip 
                  label="OR" 
                  size="small"
                  sx={{
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "text.secondary",
                  }}
                />
              </Divider>
            </Box>

            {/* Sign Up Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: "#6366f1",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign up for free
                </Link>
              </Typography>
              
              <Button
                component={RouterLink}
                to="/"
                variant="outlined"
                startIcon={<ArrowBack />}
                sx={{
                  color: "text.secondary",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  "&:hover": {
                    borderColor: "#6366f1",
                    color: "#6366f1",
                  },
                }}
              >
                Back to Home
              </Button>
            </Box>
          </Paper>
        </Container>
      </motion.div>
    </Box>
  );
};

export default Login;
