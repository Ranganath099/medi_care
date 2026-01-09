import { Card, CardContent, Typography, Box } from "@mui/material";

export default function StatCard({ title, value, icon }) {
  return (
        <Card variant="outlined" sx={{ minWidth: 160 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: 1,
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
  
