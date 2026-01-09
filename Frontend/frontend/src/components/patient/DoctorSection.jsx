import {
  Card, CardContent, Box, TextField, Button,
  InputAdornment, Chip, Divider, List,
  ListItem, ListItemAvatar, ListItemText,
  Avatar, Typography, CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function DoctorSection({
  doctors,
  filteredDoctors,
  loadingDoctors,
  search,
  setSearch,
  specializations,
  specializationFilter,
  setSpecializationFilter,
  fetchDoctors,
  openBooking,
}) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search doctors or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button onClick={fetchDoctors} variant="outlined" disabled={loadingDoctors}>
            {loadingDoctors ? <CircularProgress size={18} /> : "Refresh"}
          </Button>
        </Box>

        <Box sx={{ mb: 1 }}>
          {specializations.map((spec) => (
            <Chip
              key={spec}
              label={spec}
              clickable
              onClick={() =>
                setSpecializationFilter((cur) => (cur === spec ? null : spec))
              }
              color={specializationFilter === spec ? "primary" : "default"}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
          {specializations.length === 0 && (
            <Typography variant="caption">No specializations found</Typography>
          )}
        </Box>

        <Divider sx={{ mb: 1 }} />

        {loadingDoctors ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredDoctors.length === 0 ? (
          <Typography color="text.secondary">No doctors found.</Typography>
        ) : (
          <List>
            {filteredDoctors.map((d) => {
              const name =
                `${d.first_name || ""} ${d.last_name || ""}`.trim() ||
                d.username ||
                "Doctor";

              return (
                <Box key={d.id}>
                  <ListItem
                    secondaryAction={
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => openBooking(d)}
                      >
                        Book
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>{name[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={name}
                      secondary={d.specialization || "—"}
                    />
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
