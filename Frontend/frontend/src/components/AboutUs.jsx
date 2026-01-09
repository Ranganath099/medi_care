import React from "react";
import { Container, Grid, Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Aboutus from "../assets/aboutus.jpg";

export default function AboutUsSection() {
  const navigate = useNavigate();

  return (
    <Container id="about-section"  maxWidth={false} sx={{ py: 8, px: 0 }}> 
      <Grid 
        container 
        spacing={4} 
        alignItems="center"
        sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}
      >
        <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "flex-start", pl: { md: 4 } }}>
          <Box
            component="img"
            src={Aboutus}
            alt="About MediCare"
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

        <Grid item xs={12} md={6} sx={{ pr: { md: 4 } }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            About Us
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ color: "#555", lineHeight: 1.6 }}
          >
            MediCare is a leading platform for managing your healthcare needs.
            From booking appointments to tracking prescriptions and monitoring
            health analytics, we make healthcare seamless and accessible for everyone.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
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
      </Grid>
    </Container>
  );
}
