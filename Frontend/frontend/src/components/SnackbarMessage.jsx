import React from "react";
import { Snackbar, Alert } from "@mui/material";

export default function SnackbarMessage({ open, handleClose, severity, message }) {
  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
