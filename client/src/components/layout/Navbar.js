import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";

const Navbar = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const authLinks = (
    <>
      <Button component={RouterLink} to="/dashboard" color="inherit">
        My Dashboard
      </Button>
      <Button component={RouterLink} to="/all-documents" color="inherit">
        All Documents
      </Button>
      <Button color="inherit" onClick={onLogout}>
        Logout
      </Button>
    </>
  );

  const guestLinks = (
    <>
      <Button component={RouterLink} to="/login" color="inherit">
        Login
      </Button>
      <Button component={RouterLink} to="/register" color="inherit">
        Register
      </Button>
    </>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ContentFlow
        </Typography>
        {isAuthenticated ? authLinks : guestLinks}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
