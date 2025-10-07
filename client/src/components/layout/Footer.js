import React from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Link, 
  Grid, 
  IconButton,
  Divider
} from "@mui/material";
import { 
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon,
  Favorite as FavoriteIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.footer
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Box
        sx={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          mt: 8,
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <Typography
                  variant="h6"
                  sx={{
                    background: "linear-gradient(135deg, #6366f1, #ec4899)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 800,
                    mb: 2,
                  }}
                >
                  ContentFlow
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3, lineHeight: 1.6 }}
                >
                  Streamline your content review process with AI-powered insights 
                  and collaborative tools. Making document review faster, smarter, 
                  and more efficient.
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {[
                    { icon: <GitHubIcon />, href: "https://github.com" },
                    { icon: <LinkedInIcon />, href: "https://linkedin.com" },
                    { icon: <TwitterIcon />, href: "https://twitter.com" },
                    { icon: <EmailIcon />, href: "mailto:contact@contentflow.com" },
                  ].map((social, index) => (
                    <IconButton
                      key={index}
                      href={social.href}
                      target="_blank"
                      sx={{
                        color: "text.secondary",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          color: "#6366f1",
                          borderColor: "#6366f1",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      {social.icon}
                    </IconButton>
                  ))}
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <motion.div variants={itemVariants}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Product
                </Typography>
                {["Features", "Pricing", "Reviews", "Updates"].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 1,
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      "&:hover": { color: "#6366f1" },
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <motion.div variants={itemVariants}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Company
                </Typography>
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 1,
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      "&:hover": { color: "#6366f1" },
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <motion.div variants={itemVariants}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Support
                </Typography>
                {["Help Center", "Documentation", "API", "Community"].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 1,
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      "&:hover": { color: "#6366f1" },
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <motion.div variants={itemVariants}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Legal
                </Typography>
                {["Privacy", "Terms", "Security", "Compliance"].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 1,
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      "&:hover": { color: "#6366f1" },
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </motion.div>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: "rgba(255, 255, 255, 0.1)" }} />

          <motion.div variants={itemVariants}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                © {currentYear} ContentFlow. Made with{" "}
                <FavoriteIcon sx={{ fontSize: 16, color: "#ec4899" }} />{" "}
                for better content collaboration.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Version 1.0.0 • Last updated Oct 2025
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </motion.footer>
  );
};

export default Footer;