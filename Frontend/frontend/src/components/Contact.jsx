import React, { useState } from "react";
import { Container, Grid, Box, Typography, TextField, Button } from "@mui/material";
import Aboutus from "../assets/Aboutus.jpg"; 

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Message sent!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <Container id="contact-section" maxWidth={false} sx={{ py: 8, px: 2 }}>
      <Grid
        container
        spacing={4}
        alignItems="center"
        sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}
      >
        {/* Image */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" }, pl: { md: 4 } }}
        >
          <Box
            component="img"
            src={Aboutus}
            alt="Contact MediCare"
            sx={{
              width: "100%",
              maxWidth: 600,
              borderRadius: 2,
              boxShadow: 3,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": { transform: "scale(1.05)", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" },
            }}
          />
        </Grid>

        {/* Text + Form */}
        <Grid item xs={12} md={6} sx={{ pr: { md: 4 } }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            Contact Us
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: "#555", lineHeight: 1.6 }}>
            Have questions or need assistance? Reach out to us anytime. Our team is ready to help
            you with appointment scheduling, prescriptions, or any healthcare inquiries.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}
          >
            <TextField
              label="Name"
              name="name"
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Message"
              name="message"
              variant="outlined"
              multiline
              rows={4}
              value={formData.message}
              onChange={handleChange}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                width: "fit-content",
                "&:hover": { backgroundColor: "#1976d2", transform: "scale(1.05)" },
              }}
            >
              Send Message
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
