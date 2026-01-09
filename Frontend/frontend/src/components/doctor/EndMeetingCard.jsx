import { Card, Typography, Stack, Button } from "@mui/material";

export default function EndMeetingCard({
  appointment,
  onClose,
  onComplete,
  onReschedule,
}) {
  if (!appointment) return null;

  return (
    <Card
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1300,
        p: 3,
        minWidth: 300,
      }}
    >
      <Typography variant="h6" gutterBottom>
        How did the meeting go?
      </Typography>

      <Stack spacing={2}>
        <Button variant="contained" color="success" onClick={onComplete}>
          Mark as Completed
        </Button>

        <Button variant="outlined" color="warning" onClick={onReschedule}>
          Inconvenience – Reschedule
        </Button>

        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
      </Stack>
    </Card>
  );
}
