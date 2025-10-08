import { createTheme } from "@mui/material/styles";

// Enhanced modern theme with glassmorphism effects
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6366f1", // Indigo
      light: "#818cf8",
      dark: "#4338ca",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ec4899", // Pink
      light: "#f472b6",
      dark: "#be185d",
    },
    accent: {
      main: "#06b6d4", // Cyan
      light: "#22d3ee",
      dark: "#0891b2",
    },
    background: {
      default: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
      paper: "rgba(255, 255, 255, 0.05)",
      blur: "rgba(255, 255, 255, 0.1)",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
      accent: "#6366f1",
    },
    divider: "rgba(255, 255, 255, 0.12)",
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif',
    h1: {
      fontSize: "3.5rem",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "2rem",
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontSize: "1.75rem",
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      fontSize: "0.95rem",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          "&::before": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 60% 40%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)
            `,
            pointerEvents: "none",
            zIndex: -1,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 24px",
          boxShadow: "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.4)",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #5855eb 0%, #7c3aed 100%)",
          },
        },
        outlined: {
          borderColor: "rgba(255, 255, 255, 0.2)",
          color: "#ffffff",
          "&:hover": {
            borderColor: "#6366f1",
            background: "rgba(99, 102, 241, 0.1)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 12,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: 12,
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(99, 102, 241, 0.5)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#6366f1",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "rgba(99, 102, 241, 0.2)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
  },
});
