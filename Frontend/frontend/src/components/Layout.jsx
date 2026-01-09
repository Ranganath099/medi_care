import React from "react";
import Navbar from "./Navbar";
import { Container } from "@mui/material";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {children}
      </Container>
    </>
  );
}