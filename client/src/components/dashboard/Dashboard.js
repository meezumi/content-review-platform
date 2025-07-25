import React from 'react';
import { Typography, Container } from '@mui/material';

const Dashboard = () => {
  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>Dashboard</Typography>
      <Typography>Welcome to the content review platform.</Typography>
    </Container>
  );
};

export default Dashboard;