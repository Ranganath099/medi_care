// src/pages/Home.jsx

import React, { useEffect } from "react";
import { Typography, Button, Grid, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import Healthcarevid1 from "../assets/Healthcarevid1.mp4";
import AboutUsSection from "../components/AboutUs";
import Services from "../components/Services";
import Contact from "../components/Contact";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        const section = document.getElementById(
          location.state.scrollTo
        );

        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  }, [location]);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
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
            width: "100%",
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
            backgroundColor: "rgba(0,0,0,0.4)",
            px: 2,
          }}
        >
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Welcome to MediCare
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontSize: { xs: "1rem", md: "1.5rem" },
              maxWidth: "800px",
            }}
          >
            Manage appointments, prescriptions, and health analytics
            seamlessly
          </Typography>

          <Grid
            container
            spacing={3}
            justifyContent="center"
            sx={{ mt: 3 }}
          >
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                size="large"
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
                size="large"
                onClick={() => navigate("/register")}
                sx={{
                  minWidth: 150,
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  borderColor: "#fff",
                  "&:hover": {
                    borderColor: "#fff",
                    bgcolor: "rgba(255,255,255,0.2)",
                  },
                }}
              >
                Register
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* About Section */}
      <AboutUsSection />

      {/* Services Section */}
      <Services />

      {/* Contact Section */}
      <Contact />
    </Box>
  );
}