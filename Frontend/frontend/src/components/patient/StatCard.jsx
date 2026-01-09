import { Card, CardContent, Typography, Box } from "@mui/material";

export default function StatCard({ title, value, icon }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h6">{value}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
