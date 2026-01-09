import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import api from "../api/api";
import SnackbarMessage from "../components/SnackbarMessage";

export default function PrescriptionUpload() {
  const [appointmentId, setAppointmentId] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!appointmentId || !file) {
      setSnackbar({
        open: true,
        message: "Appointment ID and file are required!",
        severity: "error",
      });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("notes", notes);

    try {
      await api.post(`appointments/${appointmentId}/upload_prescription/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSnackbar({
        open: true,
        message: "Prescription uploaded successfully!",
        severity: "success",
      });
      setFile(null);
      setAppointmentId("");
      setNotes("");
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error uploading prescription",
        severity: "error",
      });
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Upload Prescription
          </Typography>
          <TextField
            label="Appointment ID"
            fullWidth
            sx={{ mb: 2 }}
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
          />
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Upload File
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {file && <Typography>Selected: {file.name}</Typography>}
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleUpload}>
            Submit
          </Button>
        </CardContent>
      </Card>

      <SnackbarMessage
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        handleClose={handleCloseSnackbar}
      />
    </Container>
  );
}
