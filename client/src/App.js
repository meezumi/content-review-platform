import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { darkTheme } from "./theme"; 

import Navbar from './components/layout/Navbar'; 
import Footer from './components/layout/Footer';
import LandingPage from './components/LandingPage';
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import AllDocuments from './components/dashboard/AllDocuments';
import ReviewPage from './components/review/ReviewPage';
import AnalyticsPage from './components/analytics/AnalyticsPage'; 

// A wrapper for protected routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  if (loading) return <p>Loading...</p>; 
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// A wrapper for public routes (redirects authenticated users)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Don't show footer on auth pages for cleaner design
  const hideFooter = ['/login', '/register'].includes(location.pathname);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
      }}>
        <Navbar />
        
        <Box sx={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              
              {/* Protected Routes */}
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
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <AnalyticsPage />
                  </PrivateRoute>
                }
              />
              
              {/* Redirect authenticated users to dashboard */}
              <Route
                path="*"
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />}
              />
            </Routes>
          </AnimatePresence>
        </Box>
        
        {!hideFooter && <Footer />}
      </Box>
    </ThemeProvider>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;