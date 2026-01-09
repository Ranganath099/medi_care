import {
  Card, CardContent, Typography, Button, Divider,
  List, ListItem, ListItemAvatar, Avatar,
  Chip, Box, CircularProgress
} from "@mui/material";

export default function UpcomingAppointments({
  loadingAppts,
  upcoming,
  fetchAppointments,
  fmtDateTime,
  handleCancelAppointment,
  cancelling,
}) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h6">Upcoming Appointments</Typography>
          <Button size="small" onClick={fetchAppointments}>
            Refresh
          </Button>
        </Box>

        <Divider sx={{ mb: 1 }} />

        {loadingAppts ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : upcoming.length === 0 ? (
          <Typography color="text.secondary">
            No upcoming appointments
          </Typography>
        ) : (
          <List>
            {upcoming.map((a) => {
              const doctorName = a.doctor?.user
                ? `${a.doctor.user.first_name} ${a.doctor.user.last_name}`
                : "Doctor";

              return (
                <Box key={a.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>{doctorName[0]}</Avatar>
                    </ListItemAvatar>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        {doctorName}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {fmtDateTime(a.scheduled_time)}
                        </Typography>
                        <Chip
                          label={a.status.toUpperCase()}
                          size="small"
                          color={
                            a.status === "confirmed"
                              ? "success"
                              : a.status === "requested"
                              ? "warning"
                              : "default"
                          }
                          sx={{ height: 20 }}
                        />
                      </Box>
                    </Box>

                    <Button
                      color="error"
                      size="small"
                      onClick={() => handleCancelAppointment(a.id)}
                      disabled={cancelling}
                    >
                      Cancel
                    </Button>
                  </ListItem>
                  <Divider />
                </Box>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
