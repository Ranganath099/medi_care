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

export default function PrescriptionDownload() {
  const [prescriptionId, setPrescriptionId] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDownload = async () => {
    if (!prescriptionId) {
      setSnackbar({
        open: true,
        message: "Prescription ID is required!",
        severity: "error",
      });
      return;
    }
    try {
      const res = await api.get(`appointments/download_prescription/${prescriptionId}/`, {
        responseType: "blob", 
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescription_${prescriptionId}.pdf`); 
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSnackbar({
        open: true,
        message: "Download started!",
        severity: "success",
      });
      setPrescriptionId("");
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error downloading prescription",
        severity: "error",
      });
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Download Prescription
          </Typography>
          <TextField
            label="Prescription ID"
            fullWidth
            sx={{ mb: 2 }}
            value={prescriptionId}
            onChange={(e) => setPrescriptionId(e.target.value)}
          />
          <Button variant="contained" onClick={handleDownload}>
            Download
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
