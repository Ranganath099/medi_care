import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const buttonHover = { "&:hover": { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" } };

  const scrollToSection = (id) => {
    setOpen(false);
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const hideOnPaths = ["/dashboard", "/profile", "/admin-analytics", "/doctor-dashboard"];
  const shouldHide = hideOnPaths.some((p) => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const menuItems = [
    { label: "Home", onClick: () => navigate("/") },
    { label: "About", onClick: () => scrollToSection("about-section") },
    { label: "Services", onClick: () => scrollToSection("services-section") },
    { label: "Contact", onClick: () => scrollToSection("contact-section") },
    { label: "Login", onClick: () => navigate("/login") },
    { label: "Register", onClick: () => navigate("/register") },
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          
          <Typography variant="h6" sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            MediCare
          </Typography>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            {menuItems.map((item, idx) => (
              <Button key={idx} sx={buttonHover} color="inherit" onClick={item.onClick}>
                {item.label}
              </Button>
            ))}
          </Box>

          <IconButton
            size="large"
            color="inherit"
            sx={{ display: { xs: "block", md: "none" } }}
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </IconButton>

        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <List sx={{ width: 220 }}>
          {menuItems.map((item, idx) => (
            <ListItem key={idx} disablePadding>
              <ListItemButton onClick={item.onClick}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}
