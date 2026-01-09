import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Container,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api/api";
import SnackbarMessage from "../components/SnackbarMessage";

export default function Register({ setAuth }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    role: "patient", 
    specialization: "",
    bio: "",
    phone: "",
    age: "",
    gender: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [loading, setLoading] = useState(false);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    try {
      const isDoctor = formData.role === "doctor";
      const isPatient = formData.role === "patient";

      const payload = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        role: formData.role,
        is_doctor: isDoctor,
        is_patient: isPatient,
      };

      if (isDoctor) {
        payload.doctor_profile = {
          specialization: formData.specialization || "",
          bio: formData.bio || "",
          phone: formData.phone || "",
        };
      } else {
        payload.patient_profile = {
          age: formData.age === "" ? null : Number(formData.age),
          gender: formData.gender || "",
          phone: formData.phone || "",
        };
      }

      const res = await api.post("/users/register/", payload);
      console.log("Register response:", res.data);

      const user_id = res.data?.id ?? res.data?.user_id ?? null;
      const email =
        res.data?.email ??
        (res.data?.user && res.data.user.email) ??
        null;

      let phone =
        res.data?.phone ??
        (res.data?.patient_profile && res.data.patient_profile.phone) ??
        (res.data?.doctor_profile && res.data.doctor_profile.phone) ??
        null;

      let emailSent = false;
      let phoneSent = false;
      let emailError = null;
      let phoneError = null;

      if (email) {
        try {
          await api.post("/otp/send/", {
            verif_type: "email",
            target: email,
            user_id,
          });
          emailSent = true;
        } catch (err) {
          console.error("Email OTP error:", err.response?.data || err.message);
          emailError =
            err.response?.data?.detail ||
            err.response?.data?.error ||
            err.message;
        }
      }

      if (phone) {
        try {
          await api.post("/otp/send/", {
            verif_type: "phone",
            target: phone,
            user_id,
          });
          phoneSent = true;
        } catch (err) {
          console.error("Phone OTP error:", err.response?.data || err.message);
          phoneError =
            err.response?.data?.detail ||
            err.response?.data?.error ||
            err.message;
        }
      }

      const loginRes = await api.post("/auth/jwt/create/", {
        username: formData.username,
        password: formData.password,
      });

      const { access, refresh } = loginRes.data;

      
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      setAuthToken(access);

      
      const userObj = res.data;  
      console.log("Registered & logged-in user (from register response):", userObj);

      if (setAuth) setAuth(true);
 
      navigate("/register/success", {
        state: {
          user_id,
          email,
          phone,
          email_sent: emailSent,
          phone_sent: phoneSent,
          email_error: emailError,
          phone_error: phoneError,
          user: userObj,
        },
      });

    
      setFormData({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        role: "patient",
        specialization: "",
        bio: "",
        phone: "",
        age: "",
        gender: "",
      });
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);

      const data = err.response?.data;
      let message =
        data?.message ||
        data?.detail ||
        data?.error ||
        (typeof data === "object" ? JSON.stringify(data) : err.message) ||
        "Registration failed";

      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Register
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            required
          />
          <TextField
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <TextField
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <MenuItem value="patient">Patient</MenuItem>
            <MenuItem value="doctor">Doctor</MenuItem>
          </TextField>

          {formData.role === "doctor" && (
            <>
              <TextField
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
              />
              <TextField
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                multiline
                minRows={2}
              />
              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </>
          )}

          {formData.role === "patient" && (
            <>
              <TextField
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                required
              />
              <TextField
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Register"}
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
