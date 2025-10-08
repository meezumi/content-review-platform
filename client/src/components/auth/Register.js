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
  Chip,
  LinearProgress
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  Person,
  PersonAdd as PersonAddIcon,
  ArrowBack,
  CheckCircle,
  Cancel
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

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error when user starts typing
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== "";

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (passwordStrength < 3) {
      setError("Password is too weak. Please choose a stronger password.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }
      );
      dispatch(loginSuccess({ token: res.data.token }));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "error";
    if (passwordStrength <= 3) return "warning";
    return "success";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
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
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join ContentFlow and start reviewing smarter
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

            {/* Registration Form */}
            <Box component="form" onSubmit={onSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Full Name"
                name="username"
                autoComplete="name"
                autoFocus
                value={formData.username}
                onChange={onChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
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
                autoComplete="new-password"
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
                sx={{ mb: 1 }}
              />

              {/* Password Strength Indicator */}
              {formData.password && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Password Strength
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color={getPasswordStrengthColor() + ".main"}
                      sx={{ fontWeight: 600 }}
                    >
                      {getPasswordStrengthText()}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(passwordStrength / 5) * 100}
                    color={getPasswordStrengthColor()}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={onChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {formData.confirmPassword && (
                          passwordsMatch ? (
                            <CheckCircle sx={{ color: "success.main", fontSize: 20 }} />
                          ) : (
                            <Cancel sx={{ color: "error.main", fontSize: 20 }} />
                          )
                        )}
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: "text.secondary" }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </Box>
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
                disabled={loading || !passwordsMatch || passwordStrength < 3}
                startIcon={<PersonAddIcon />}
                sx={{
                  py: 1.5,
                  mb: 3,
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  display: "block", 
                  textAlign: "center", 
                  mb: 3,
                  lineHeight: 1.4
                }}
              >
                By creating an account, you agree to our{" "}
                <Link href="#" sx={{ color: "#6366f1" }}>Terms of Service</Link>{" "}
                and{" "}
                <Link href="#" sx={{ color: "#6366f1" }}>Privacy Policy</Link>
              </Typography>
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

            {/* Sign In Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Already have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: "#6366f1",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign in here
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

export default Register;
