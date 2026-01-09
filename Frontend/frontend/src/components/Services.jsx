
import React from "react";
import { Container, Grid, Box, Typography, Button } from "@mui/material";
import Aboutus from "../assets/aboutus.jpg"; 

export default function Services() {
  return (
    <Container id="services-section" maxWidth={false} sx={{ py: 8, px: 0 }}>
      <Grid
        container
        spacing={4}
        alignItems="center"
        sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}
      >
        <Grid item xs={12} md={6} sx={{ pl: { md: 4 } }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            Our Services
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ color: "#555", lineHeight: 1.6 }}
          >
            At MediCare, we offer a wide range of healthcare services to meet your needs.
            From online consultations and appointment management to health monitoring
            and analytics, we ensure seamless access to quality healthcare for everyone.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              "&:hover": {
                backgroundColor: "#1976d2",
                transform: "scale(1.05)",
              },
            }}
          >
            Learn More
          </Button>
        </Grid>


        <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "flex-end", pr: { md: 4 } }}>
          <Box
            component="img"
            src={Aboutus}
            alt="Our Services"
            sx={{
              width: "100%",
              maxWidth: 600,
              borderRadius: 2,
              boxShadow: 3,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
              },
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
