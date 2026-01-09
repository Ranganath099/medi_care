import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api/api";
import SnackbarMessage from "../components/SnackbarMessage";

export default function Login({ setAuth }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    try {
      const res = await api.post("/auth/jwt/create/", formData);

      const { access, refresh } = res.data || {};
      if (!access) throw new Error("No access token returned by the server.");

      localStorage.setItem("access_token", access);
      if (refresh) localStorage.setItem("refresh_token", refresh);

      setAuthToken(access);

      let userRes;
      try {
        userRes = await api.get("/users/me/");
      } catch (err) {
        console.warn("First /users/me/ failed, retrying once...", err.response?.data || err.message);
        const tokenNow = localStorage.getItem("access_token");
        if (tokenNow) setAuthToken(tokenNow);
        userRes = await api.get("/users/me/");
      }

      try {
        localStorage.setItem("user", JSON.stringify(userRes.data));
      } catch (e) {
        console.warn("Could not persist user to localStorage", e);
      }

      window.dispatchEvent(new CustomEvent("authChanged", { detail: userRes.data }));

      if (typeof setAuth === "function") setAuth(true);

      setSnackbar({ open: true, message: "Login successful!", severity: "success" });
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      const serverMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (typeof err.response?.data === "object" ? JSON.stringify(err.response?.data) : null) ||
        err.message ||
        "Invalid username or password";
      sessionStorage.setItem("access_token", access);
      if (refresh) sessionStorage.setItem("refresh_token", refresh);
      sessionStorage.setItem("user", JSON.stringify(userRes.data));
      setAuthToken(null);
      setSnackbar({ open: true, message: serverMsg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Username or Email"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Box>
      </Paper>

      <SnackbarMessage
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        handleClose={handleCloseSnackbar}
      />
    </Container>
  );
}
