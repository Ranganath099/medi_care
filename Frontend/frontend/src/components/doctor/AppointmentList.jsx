import {
  Card,
  CardContent,
  Typography,
  List,
  Divider,
  Stack,
  Skeleton,
  Button,
  Chip,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";

export default function AppointmentList({
  loading,
  appointments,
  handlers,
  utils,
  setEndDialog,
}) {
  const {
    updateAppointmentStatus,
    openGoogleCalendar,
    sendMeetLink,
    handleReschedule,
    fetchAppointments,
  } = handlers;

  const {
    fmtDateTime,
    extractMeetUrl,
    isWithinMeetingTime,
    canReschedule,
  } = utils;

  const getStatusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "success";
    case "cancelled":
      return "error";
    case "requested":
      return "warning";
    case "completed":
      return "success";
    case "missed":
      return "warning";
    default:
      return "default";
  }
};

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Appointments
        </Typography>

        {loading && (
          <Stack spacing={1}>
            <Skeleton height={40} />
            <Skeleton height={40} />
          </Stack>
        )}

        {!loading && appointments.length === 0 && (
          <Typography color="text.secondary">
            No appointments found.
          </Typography>
        )}

        <List>
          {appointments.map((a) => {
            const canJoinMeet =
              !!a.meet_link &&
              !!a.started_at &&
              !a.completed_at &&
              isWithinMeetingTime(a);

            const patientName =
              a.patient?.user?.first_name
                ? `${a.patient.user.first_name} ${a.patient.user.last_name ?? ""}`
                : "Unknown Patient";

            return (
              <div key={a.id}>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    a.status === "requested" ? (
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() =>
                            updateAppointmentStatus(a.id, "confirmed")
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            updateAppointmentStatus(a.id, "cancelled")
                          }
                        >
                          Reject
                        </Button>
                      </Stack>
                    ) : a.status === "confirmed" && !a.meet_link ? (
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openGoogleCalendar(a)}
                        >
                          Create Meet
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => sendMeetLink(a)}
                        >
                          Send Meet Link
                        </Button>
                      </Stack>
                    ) : canJoinMeet ? (
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() =>
                            window.open(
                              extractMeetUrl(a.meet_link),
                              "_blank"
                            )
                          }
                        >
                          Join Meet
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => setEndDialog(a)}
                        >
                          End
                        </Button>
                      </Stack>
                    ) : canReschedule(a) ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => handleReschedule(a)}
                      >
                        Reschedule
                      </Button>
                    ) : a.completed_at ? (
                      <Chip label="Completed" color="success" size="small" />
                    ) : null
                  }
                >
                  <ListItemAvatar>
                    <Avatar>{patientName.charAt(0)}</Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1}>
                        <strong>{patientName}</strong>
                        <Chip
                            label={a.status}
                            size="small"
                            color={getStatusColor(a.status)}
                            variant="filled"
                            />

                      </Stack>
                    }
                    secondary={fmtDateTime(a.scheduled_time)}
                  />
                </ListItem>

                <Divider />
              </div>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
}
