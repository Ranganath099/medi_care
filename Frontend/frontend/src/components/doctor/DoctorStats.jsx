import { Grid } from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import TodayIcon from "@mui/icons-material/Today";
import PeopleIcon from "@mui/icons-material/People";
import StatCard from "./StatCard";

export default function DoctorStats({
  active,
  upcoming,
  today,
  patients,
}) {
  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} md={3}>
        <StatCard
          title="Total appointments"
          value={active}
          icon={<EventNoteIcon fontSize="large" />}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard
          title="Upcoming"
          value={upcoming}
          icon={<TodayIcon fontSize="large" />}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard
          title="Today"
          value={today}
          icon={<TodayIcon fontSize="large" />}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard
          title="Unique patients"
          value={patients}
          icon={<PeopleIcon fontSize="large" />}
        />
      </Grid>
    </Grid>
  );
}
