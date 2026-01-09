import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function DoctorTopBar({ user, onProfile, onLogout }) {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2 }}>
      <Toolbar sx={{ justifyContent: "flex-end" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            startIcon={<AccountCircleIcon />}
            variant="outlined"
            size="small"
            onClick={onProfile}
          >
            {user?.first_name || "Profile"}
          </Button>
          <IconButton onClick={onLogout}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
