import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { darkTheme } from "./theme"; 

import Navbar from './components/layout/Navbar'; 
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import AllDocuments from './components/dashboard/AllDocuments';
import ReviewPage from './components/review/ReviewPage';


// A wrapper for protected routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  if (loading) return <p>Loading...</p>; 
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const location = useLocation(); // Needed for AnimatePresence with Routes

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> 
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/shared"
            element={
              <PrivateRoute>
                <AllDocuments />
              </PrivateRoute>
            }
          />
          <Route
            path="/review/:id"
            element={
              <PrivateRoute>
                <ReviewPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AnimatePresence>
    </ThemeProvider>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;