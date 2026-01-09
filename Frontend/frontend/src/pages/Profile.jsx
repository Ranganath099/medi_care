import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import api, { setAuthToken } from "../api/api";
import SnackbarMessage from "../components/SnackbarMessage";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [patient, setPatient] = useState({
    age: "",
    gender: "",
    phone: "",
    profile_picture: null,
  });

  const [doctor, setDoctor] = useState({
    specialization: "",
    bio: "",
    phone: "",
    profile_picture: null,
  });

  const [preview, setPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const previewRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();

    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
    };
  }, []);

  const handleCloseSnackbar = () =>
    setSnackbar((s) => ({
      ...s,
      open: false,
    }));

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (token) setAuthToken(token);

      const res = await api.get("/users/me/");
      setUser(res.data);

      setForm({
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        email: res.data.email || "",
      });

      const p = res.data.patient_profile || {};
      const d = res.data.doctor_profile || {};

      setPatient({
        age: p.age ?? "",
        gender: (p.gender || "").toLowerCase(), 
        phone: p.phone ?? "",
        profile_picture: p.profile_picture ?? null,
      });

      setDoctor({
        specialization: d.specialization ?? "",
        bio: d.bio ?? "",
        phone: d.phone ?? "",
        profile_picture: d.profile_picture ?? null,
      });

      const previewSrc = d.profile_picture || p.profile_picture || null;
      setPreview(previewSrc);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setSnackbar({
        open: true,
        message: "Failed to load profile",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleField = (e) => {
    const { name, value } = e.target;

    if (["first_name", "last_name", "email"].includes(name)) {
      setForm((f) => ({ ...f, [name]: value }));
      return;
    }


    if (["age", "gender", "phone_patient"].includes(name)) {
      if (name === "phone_patient") {
        setPatient((p) => ({ ...p, phone: value }));
      } else {
        setPatient((p) => ({ ...p, [name]: value }));
      }
      return;
    }

    
    if (["specialization", "bio", "phone_doctor"].includes(name)) {
      if (name === "phone_doctor") {
        setDoctor((d) => ({ ...d, phone: value }));
      } else {
        setDoctor((d) => ({ ...d, [name]: value }));
      }
      return;
    }
  };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    
    if (user?.is_doctor) {
      setDoctor((d) => ({ ...d, profile_picture: file }));
    } else {
      setPatient((p) => ({ ...p, profile_picture: file }));
    }

    
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setPreview(url);
  };

  const validateBeforeSave = () => {
    if (!form.email) {
      setSnackbar({
        open: true,
        message: "Email is required",
        severity: "error",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
  if (!validateBeforeSave()) return;

  setSaving(true);
  try {
  
    const payload = {
      first_name: form.first_name || "",
      last_name: form.last_name || "",
      email: form.email || "",
    };

    if (user?.is_patient) {
      payload.patient_profile = {
        age: patient.age || null,
        gender: patient.gender || "",
        phone: patient.phone || "",
      };
    }

    if (user?.is_doctor) {
      payload.doctor_profile = {
        specialization: doctor.specialization || "",
        bio: doctor.bio || "",
        phone: doctor.phone || "",
      };
    }

    const fd = new FormData();

    
    fd.append("data", JSON.stringify(payload));

    
    if (user?.is_patient && patient.profile_picture instanceof File) {
      fd.append(
        "patient_profile.profile_picture",
        patient.profile_picture
      );
    }

    if (user?.is_doctor && doctor.profile_picture instanceof File) {
      fd.append(
        "doctor_profile.profile_picture",
        doctor.profile_picture
      );
    }

    const res = await api.put("/users/me/", fd);


    setUser(res.data);
    setForm({
      first_name: res.data.first_name || "",
      last_name: res.data.last_name || "",
      email: res.data.email || "",
    });

    setPatient(res.data.patient_profile || {});
    setDoctor(res.data.doctor_profile || {});

    setSnackbar({
      open: true,
      message: "Profile updated successfully",
      severity: "success",
    });

    navigate("/dashboard");
  } catch (err) {
    console.error("Save profile error:", err);
    setSnackbar({
      open: true,
      message: "Failed to update profile",
      severity: "error",
    });
  } finally {
    setSaving(false);
  }
};


  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  const showDoctor = user?.is_doctor;
  const showPatient = user?.is_patient && !user?.is_doctor;

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          My Profile
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <Avatar
            src={preview || undefined}
            sx={{ width: 80, height: 80, fontSize: 32 }}
          >
            {!preview &&
              (form.first_name || user?.username || "U")
                .slice(0, 1)
                .toUpperCase()}
          </Avatar>

          <label htmlFor="file-upload">
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFile}
            />
            <Button
              component="span"
              variant="outlined"
              startIcon={<PhotoCamera />}
            >
              Change Photo
            </Button>
          </label>
        </Box>

        <Box component="form" sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="First name"
            name="first_name"
            value={form.first_name}
            onChange={handleField}
            fullWidth
          />
          <TextField
            label="Last name"
            name="last_name"
            value={form.last_name}
            onChange={handleField}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleField}
            type="email"
            required
            fullWidth
          />

          {showPatient && (
            <>
              <TextField
                label="Phone"
                name="phone_patient"
                value={patient.phone}
                onChange={handleField}
                fullWidth
              />
              <TextField
                label="Age"
                name="age"
                value={patient.age}
                onChange={handleField}
                type="number"
                inputProps={{ min: 0 }}
                fullWidth
              />
              <TextField
                label="Gender"
                name="gender"
                value={patient.gender || ""}
                onChange={handleField}
                select
                fullWidth
              >
                <MenuItem value="">Prefer not to say</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </>
          )}

          {showDoctor && (
            <>
              <TextField
                label="Specialization"
                name="specialization"
                value={doctor.specialization}
                onChange={handleField}
                fullWidth
              />
              <TextField
                label="Phone"
                name="phone_doctor"
                value={doctor.phone}
                onChange={handleField}
                fullWidth
              />
              <TextField
                label="Bio"
                name="bio"
                value={doctor.bio}
                onChange={handleField}
                multiline
                minRows={3}
                fullWidth
              />
            </>
          )}

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 1,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/dashboard")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <CircularProgress size={20} /> : "Save Changes"}
            </Button>
          </Box>
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
