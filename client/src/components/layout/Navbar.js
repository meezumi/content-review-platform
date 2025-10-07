import React, { useState, useEffect } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Share as ShareIcon,
  Analytics as AnalyticsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { motion } from "framer-motion";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onLogout = () => {
    dispatch(logout());
    navigate("/login");
    setAnchorEl(null);
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isActivePath = (path) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { label: "Shared", path: "/shared", icon: <ShareIcon /> },
    { label: "Analytics", path: "/analytics", icon: <AnalyticsIcon /> },
  ];

  const authLinks = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {!isMobile && navItems.map((item) => (
        <Button
          key={item.path}
          component={RouterLink}
          to={item.path}
          sx={{
            color: "white",
            mx: 1,
            position: "relative",
            "&:hover": {
              background: "rgba(99, 102, 241, 0.1)",
            },
            ...(isActivePath(item.path) && {
              color: "#6366f1",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: "80%",
                height: 2,
                background: "linear-gradient(90deg, #6366f1, #ec4899)",
                borderRadius: 1,
              },
            }),
          }}
        >
          {item.label}
        </Button>
      ))}
      
      <IconButton
        onClick={handleProfileClick}
        sx={{ 
          ml: 2,
          p: 0.5,
          border: "2px solid rgba(255, 255, 255, 0.1)",
          "&:hover": {
            border: "2px solid #6366f1",
          }
        }}
      >
        <Avatar 
          sx={{ 
            width: 36, 
            height: 36,
            background: "linear-gradient(135deg, #6366f1, #ec4899)",
          }}
        >
          {user?.name ? user.name[0].toUpperCase() : <PersonIcon />}
        </Avatar>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          "& .MuiPaper-root": {
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            mt: 1,
          }
        }}
      >
        <MenuItem onClick={onLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );

  const guestLinks = (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button 
        component={RouterLink} 
        to="/login" 
        variant="outlined"
        startIcon={<LoginIcon />}
        sx={{ color: "white" }}
      >
        Login
      </Button>
      <Button 
        component={RouterLink} 
        to="/register" 
        variant="contained"
        startIcon={<PersonAddIcon />}
      >
        Register
      </Button>
    </Box>
  );

  const mobileDrawer = (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      sx={{
        "& .MuiDrawer-paper": {
          background: "rgba(15, 15, 35, 0.95)",
          backdropFilter: "blur(20px)",
          border: "none",
          width: 280,
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ 
          background: "linear-gradient(135deg, #6366f1, #ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 800,
          mb: 2
        }}>
          ContentFlow
        </Typography>
        
        {isAuthenticated && (
          <List>
            {navItems.map((item) => (
              <ListItem 
                key={item.path}
                button
                component={RouterLink}
                to={item.path}
                onClick={() => setMobileDrawerOpen(false)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  ...(isActivePath(item.path) && {
                    background: "rgba(99, 102, 241, 0.2)",
                  }),
                }}
              >
                <ListItemIcon sx={{ color: "#6366f1" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            <ListItem button onClick={onLogout} sx={{ borderRadius: 2, mt: 2 }}>
              <ListItemIcon sx={{ color: "#ec4899" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        )}
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="fixed"
        sx={{
          background: scrolled 
            ? "rgba(15, 15, 35, 0.9)" 
            : "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          borderBottom: scrolled 
            ? "1px solid rgba(99, 102, 241, 0.3)" 
            : "1px solid rgba(255, 255, 255, 0.1)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          {isMobile && isAuthenticated && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ flexGrow: 1 }}
          >
            <Typography 
              variant="h6" 
              component={RouterLink}
              to={isAuthenticated ? "/dashboard" : "/"}
              sx={{ 
                textDecoration: "none",
                background: "linear-gradient(135deg, #6366f1, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 800,
                fontSize: "1.5rem",
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.8,
                }
              }}
            >
              ContentFlow
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isAuthenticated ? (!isMobile ? authLinks : null) : guestLinks}
          </motion.div>
        </Toolbar>
      </AppBar>
      
      {isMobile && mobileDrawer}
      
      {/* Spacer to push content below fixed navbar */}
      <Toolbar />
    </>
  );
};

export default Navbar;
