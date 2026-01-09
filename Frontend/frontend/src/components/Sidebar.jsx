import React from "react";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <Drawer variant="permanent" anchor="left">
      <List>
        <ListItem button onClick={() => navigate("/reports")}>
          <ListItemText primary="Analytics" />
        </ListItem>
        <ListItem button onClick={() => navigate("/doctors")}>
          <ListItemText primary="Doctors" />
        </ListItem>
        <ListItem button onClick={() => navigate("/appointments")}>
          <ListItemText primary="Appointments" />
        </ListItem>
        <ListItem button onClick={() => navigate("/prescriptions")}>
          <ListItemText primary="Prescriptions" />
        </ListItem>
      </List>
    </Drawer>
  );
}
