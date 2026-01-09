// src/pages/Home.jsx
import React from "react";
import { Typography, Button, Grid, Box, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Healthcarevid1 from "../assets/Healthcarevid1.mp4";
import AboutUsSection from "../components/AboutUs";
import Services from "../components/Services";
import Contact from "../components/Contact";


export default function Home() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          width: "100vw",
          height: { xs: "40vh", sm: "50vh", md: "60vh" },
          overflow: "hidden",
        }}
      >
        <Box
          component="video"
          src={Healthcarevid1}
          autoPlay
          loop
          muted
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            textAlign: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
            px: 2,
          }}
        >
          <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold" }}>
            Welcome to MediCare
          </Typography>
          <Typography variant="h5" gutterBottom>
            Manage appointments, prescriptions, and health analytics seamlessly
          </Typography>

          <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/login")}
                sx={{ minWidth: 150 }}
              >
                Login
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate("/register")}
                sx={{ minWidth: 150 }}
              >
                Register
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

   
   <AboutUsSection id="about-section"/>

   <Services id="services-section" />
   <Contact id="contact-section" />

    </Box>
  );
}
