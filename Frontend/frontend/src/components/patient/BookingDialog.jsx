import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Avatar, Typography, Box,
  TextField, CircularProgress
} from "@mui/material";

export default function BookingDialog({
  bookingDoctor,
  scheduledAtLocal,
  setScheduledAtLocal,
  reason,
  setReason,
  bookingLoading,
  closeBooking,
  handleBookAppointment,
}) {
  return (
    <Dialog open={Boolean(bookingDoctor)} onClose={closeBooking}>
      <DialogTitle>Book Appointment</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
          <Avatar>{bookingDoctor?.first_name?.[0]}</Avatar>
          <Box>
            <Typography variant="subtitle1">
              {bookingDoctor?.first_name} {bookingDoctor?.last_name}
            </Typography>
            <Typography variant="caption">
              {bookingDoctor?.specialization}
            </Typography>
          </Box>
        </Box>

        <input
          type="datetime-local"
          value={scheduledAtLocal}
          onChange={(e) => setScheduledAtLocal(e.target.value)}
          style={{
            padding: "8px 10px",
            fontSize: 16,
            borderRadius: 6,
            border: "1px solid #ddd",
            width: "100%",
          }}
        />

        <TextField
          sx={{ mt: 2 }}
          label="Reason / Suffering With"
          multiline
          minRows={3}
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={closeBooking}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => handleBookAppointment(bookingDoctor.id)}
          disabled={bookingLoading}
        >
          {bookingLoading ? <CircularProgress size={18} /> : "Confirm Booking"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
