import {
  Card, CardContent, Typography, Divider,
  List, ListItem, ListItemAvatar,
  ListItemText, Avatar
} from "@mui/material";

export default function RecentAppointments({ past, fmtDateTime }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Recent Appointments
        </Typography>

        <Divider sx={{ mb: 1 }} />

        {past.length === 0 ? (
          <Typography color="text.secondary">
            No past appointments
          </Typography>
        ) : (
          <List>
            {past.slice(0, 6).map((p) => {
              const doc = p.doctor?.user
                ? `${p.doctor.user.first_name} ${p.doctor.user.last_name}`
                : "Doctor";

              return (
                <ListItem key={p.id}>
                  <ListItemAvatar>
                    <Avatar>{doc[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={doc}
                    secondary={fmtDateTime(p.scheduled_time)}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
