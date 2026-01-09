 import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrescriptionUpload from "./pages/PrescriptionUpload";
import PrescriptionDownload from "./pages/PrescriptionDownload";
import AdminAnalytics from "./pages/AdminAnalytics";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AboutUsSection from "./components/AboutUs";
import Services from "./components/Services";
import { Container } from "@mui/material";
import Contact from "./components/Contact";
import RegisterSuccess from "./pages/RegisterSucess";
import Verify from "./pages/UserVerify";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Router>
  <Navbar />
  <Routes>
    <Route path="/" element={<Home />} />  
    <Route
      path="/dashboard"
      element={
        <Container className="main-content">
          <Dashboard />
        </Container>
      }
    />
    <Route
      path="/login"
      element={
        <Container className="main-content">
          <Login />
        </Container>
      }
    />
    <Route
      path="/register"
      element={
        <Container className="main-content">
          <Register />
        </Container>
      }
    />
    <Route
      path="/upload-prescription"
      element={
        <Container className="main-content">
          <PrescriptionUpload />
        </Container>
      }
    />
    <Route
      path="/download-prescription"
      element={
        <Container className="main-content">
          <PrescriptionDownload />
        </Container>
      }
    />
    <Route
      path="/admin-analytics"
      element={
        <Container className="main-content">
          <AdminAnalytics />
        </Container>
      }
    />
    <Route
      path="/about-us"
      element={
        <Container className="main-content">
          <AboutUsSection/>
        </Container>
      }
    />
     <Route
      path="/services"
      element={
        <Container className="main-content">
          <Services/>
        </Container>
      }
    />
    <Route
      path="/contact"
      element={
        <Container className="main-content">
          <Contact/>
        </Container>
      }
    />
    <Route
        path="/register/success"
        element={
          <Container className="main-content">
            <RegisterSuccess />
          </Container>
        }
    />

     <Route
        path="/verify"
        element={
          <Container className="main-content">
            <Verify />
          </Container>
        }
     />

     <Route
        path="/profile"
        element={
          <Container className="main-content">
            <Profile />
          </Container>
        }
     />
    
  </Routes>
</Router>

  );
}
