// src/pages/DoctorDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { logout } from "../utils/auth";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  CircularProgress,
  Tooltip,
  Button,
  Stack,
  Chip,
  Skeleton,
  AppBar,
  Toolbar,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LogoutIcon from "@mui/icons-material/Logout";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PeopleIcon from "@mui/icons-material/People";
import TodayIcon from "@mui/icons-material/Today";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function fmtDateTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function DoctorDashboard({ user }) {
  const navigate = useNavigate(); 

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    await logout({ navigate });
  };

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("appointments/");
      setAppointments(
        Array.isArray(res.data) ? res.data : res.data.results || []
      );
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError(err.response?.data || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filtered view: appointments for this doctor
  const myAppointments = useMemo(() => {
    if (!user || !appointments) return [];
    return appointments.filter((a) => {
      if (!a.doctor) return false;
      try {
        const docUserId = a.doctor.user?.id ?? a.doctor?.id ?? null;
        const myDoctorProfileId = user.doctor_profile?.id ?? user.id;
        return (
          String(docUserId) === String(myDoctorProfileId) ||
          String(a.doctor?.id) === String(myDoctorProfileId)
        );
      } catch {
        return false;
      }
    });
  }, [appointments, user]);

  const now = new Date();


//   const isMeetingTime = (a) => {
//   const start = new Date(a.scheduled_time);
//   const end = new Date(start.getTime() + 30 * 60000);
//   return now >= start && now <= end;
// };

// const isMeetingOver = (a) => {
//   const end = new Date(
//     new Date(a.scheduled_time).getTime() + 30 * 60000
//   );
//   return now > end;
// };

  const confirmedAppointments = useMemo(() => {
  return myAppointments.filter(
    (a) => a.status === "confirmed"
  );
}, [myAppointments]);

 const upcoming = useMemo(() => {
  const now = new Date();
  return confirmedAppointments
    .filter(
      (a) => a.scheduled_time && new Date(a.scheduled_time) > now
    )
    .sort(
      (a, b) =>
        new Date(a.scheduled_time) - new Date(b.scheduled_time)
    );
}, [confirmedAppointments]);

  const activeAppointments = useMemo(() => {
  return myAppointments.filter(
    (a) => a.status !== "cancelled"
  );
}, [myAppointments]);

const todays = useMemo(() => {
  const todayStr = new Date().toDateString();
  return confirmedAppointments.filter((a) => {
    if (!a.scheduled_time) return false;
    return (
      new Date(a.scheduled_time).toDateString() === todayStr
    );
  });
}, [confirmedAppointments]);

  const uniquePatients = useMemo(() => {
    const s = new Set();
    myAppointments.forEach((a) => {
      const pid = a.patient?.user?.id ?? a.patient?.id ?? null;
      if (pid) s.add(String(pid));
    });
    return s.size;
  }, [myAppointments]);


const openGoogleCalendar = (appointment) => {
    const start = new Date(appointment.scheduled_time)
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0];

    const end = new Date(
      new Date(appointment.scheduled_time).getTime() + 30 * 60000
    )
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0];

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE
&text=Doctor+Consultation
&dates=${start}/${end}
&details=Online+Consultation+via+Google+Meet
&location=Google+Meet`;

    window.open(url.replace(/\s/g, ""), "_blank");
  };

const sendMeetLink = async (appointment) => {
  const meetLink = window.prompt("Paste Google Meet link");

  if (!meetLink) return;

  await api.post(`/appointments/${appointment.id}/set_meet_link/`, {
    meet_link: meetLink,
  });

  fetchAppointments();
};


  const next7 = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return { date: d, count: 0 };
    });
    myAppointments.forEach((a) => {
      if (!a.scheduled_time) return;
      const d = new Date(a.scheduled_time);
      d.setHours(0, 0, 0, 0);
      const idx = days.findIndex(
        (x) => x.date.getTime() === d.getTime()
      );
      if (idx >= 0) days[idx].count++;
    });
    return days;
  }, [myAppointments]);

  function StatCard({ title, value, icon }) {
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

  const updateAppointmentStatus = async (id, status) => {
  try {
    await api.patch(`appointments/${id}/`, { status });
    fetchAppointments(); 
  } catch (err) {
    console.error("Failed to update status", err);
  }
};
const handleReschedule = async (appointment) => {
  const newTime = window.prompt(
    "Enter new date & time (YYYY-MM-DD HH:MM)",
    ""
  );

  if (!newTime) return;

  try {

    const isoTime = new Date(newTime.replace(" ", "T")).toISOString()

    await api.post(`/appointments/${appointment.id}/reschedule/`, {
      scheduled_time: isoTime,
    });

    fetchAppointments();
  } catch (err) {
    console.error("Reschedule failed", err);
    alert("Failed to reschedule appointment");
  }
};

const extractMeetUrl = (text) => {
  if (!text) return null;
  const match = text.match(/https:\/\/meet\.google\.com\/[a-zA-Z0-9-]+/);
  return match ? match[0] : null;
};

const isWithinMeetingTime = (appointment, duration = 30) => {
  if (!appointment?.scheduled_time) return false;

  const now = new Date(); 
  const start = new Date(appointment.scheduled_time); 
  const end = new Date(start.getTime() + duration * 60000);

  return now >= start && now <= end;
};

const meetingEnded = (appointment, duration = 30) => {
    if (!appointment?.scheduled_time) return false;

  const start = new Date(appointment.scheduled_time);
  const end = new Date(start.getTime() + duration * 60000);
  const now = new Date();

  return now > end;
};

const canReschedule =
  (appointment) =>
    !appointment.started_at &&
    !appointment.completed_at &&
    meetingEnded(appointment);

const markCompleted = async (appointment) => {
  try {
    await api.post(`/appointments/${appointment.id}/complete_meet/`);
    fetchAppointments();
  } catch (err) {
    alert("Failed to mark appointment as completed");
  }
};

const [endDialog, setEndDialog] = useState(null);





  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              startIcon={<AccountCircleIcon />}
              onClick={handleGoToProfile}
              variant="outlined"
              size="small"
            >
              {user?.first_name || "Profile"}
            </Button>
            <IconButton onClick={handleLogout} aria-label="logout">
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h4">Doctor Dashboard</Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchAppointments}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            Error loading appointments: {String(error)}
          </Typography>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Total appointments"
              value={activeAppointments.length}
              icon={<EventNoteIcon fontSize="large" />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Upcoming"
              value={upcoming.length}
              icon={<TodayIcon fontSize="large" />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Today"
              value={todays.length}
              icon={<TodayIcon fontSize="large" />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Unique patients"
              value={uniquePatients}
              icon={<PeopleIcon fontSize="large" />}
            />
          </Grid>
        </Grid>

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

    {!loading && activeAppointments.length === 0 && (
      <Typography color="text.secondary">
        No appointments found.
      </Typography>
    )}

    <List>
      {activeAppointments.map((a) => {
        console.log("Appointment status:", a.status);
        console.log("FULL APPOINTMENT:", a);
        console.log("PATIENT OBJECT:", a.patient);
        const canJoinMeet =
          !!a.meet_link &&
          !!a.started_at &&
          !a.completed_at &&
          isWithinMeetingTime(a);
        const patientName = (() => {
          if (a.patient?.user?.first_name) {
            return `${a.patient.user.first_name} ${a.patient.user.last_name ?? ""}`;
          }
          if (a.patient?.first_name) {
            return `${a.patient.first_name} ${a.patient.last_name ?? ""}`;
          }
          return "Unknown Patient";
          
        })();

        return (
          <React.Fragment key={a.id}>
            <ListItem
              alignItems="flex-start"
              secondaryAction={
  a.status === "requested" ? (
    <Stack direction="row" spacing={1}>
      <Button
        size="small"
        variant="contained"
        color="success"
        onClick={() => updateAppointmentStatus(a.id, "confirmed")}
      >
        Accept
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="error"
        onClick={() => updateAppointmentStatus(a.id, "cancelled")}
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
  ) : a.meet_link && !a.started_at && isWithinMeetingTime(a) ? (
    <Button
      size="small"
      variant="contained"
      color="primary"
      onClick={async () => {
          try {
          await api.post(`/appointments/${a.id}/start_meet/`);
          fetchAppointments();
        } catch (err) {
          alert(
            err.response?.data?.detail ||
              "Meeting can only be started during scheduled time"
          );
        }
      }}
    >
      Start Meet
    </Button>
  ) : canJoinMeet ? (
    <Stack direction="row" spacing={1}>
    <Button
      size="small"
      variant="contained"
      color="success"
      onClick={() =>
        window.open(
          extractMeetUrl(a.meet_link),
          "_blank",
          "noopener,noreferrer"
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
  
    // ) : a.status === "missed" ? (
    // <Stack direction="row" spacing={1}>
    //   <Chip label="Missed" color="warning" size="small" />
    //   <Button
    //     size="small"
    //     variant="outlined"
    //     onClick={() => handleReschedule(a)}
    //   >
    //     Reschedule
    //   </Button>
    // </Stack>
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
                <Avatar>
                  {patientName.charAt(0)}
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={600}>
                      {patientName}
                    </Typography>
                    <Chip
                      size="small"
                      label={a.status}
                      color={
                        a.status === "confirmed"
                          ? "success"
                          : a.status === "cancelled"
                          ? "error"
                          : "warning"
                      }
                    />
                  </Stack>
                }
                secondary={
                  <>
                    <Typography variant="body2">
                      <strong>Reason:</strong>{" "}
                      {a.reason || "Not specified"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {fmtDateTime(a.scheduled_time)}
                    </Typography>
                  </>
                }
              />
            </ListItem>

            <Divider />
          </React.Fragment>
        );
      })}
    </List>
  </CardContent>
</Card>


      </Container>

      {endDialog && (
        <Card
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1300,
            p: 3,
            minWidth: 300,
          }}
        >
          <Typography variant="h6" gutterBottom>
            How did the meeting go?
          </Typography>

          <Stack spacing={2}>
            <Button
              variant="contained"
              color="success"
              onClick={async () => {
                await markCompleted(endDialog);
                setEndDialog(null);
              }}
            >
              Mark as Completed
            </Button>

            <Button
              variant="outlined"
              color="warning"
              onClick={() => {
                setEndDialog(null);
                handleReschedule(endDialog);
              }}
            >
              Inconvenience – Reschedule
            </Button>

            <Button
              variant="text"
              onClick={() => setEndDialog(null)}
            >
              Cancel
            </Button>
          </Stack>
        </Card>
      )}

    </>
  );
}


// src/pages/DoctorDashboard.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import { logout } from "../utils/auth";
// import { useNavigate } from "react-router-dom";
// import {
//   Container,
//   Typography,
//   Button,
//   Box,
// } from "@mui/material";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import api from "../api/api";

// /* 👇 Split Components */
// import DoctorTopBar from "../components/doctor/DoctorTopBar";
// import DoctorStats from "../components/doctor/DoctorStats";
// import AppointmentList from "../components/doctor/AppointmentList";
// import EndMeetingCard from "../components/doctor/EndMeetingCard";

// /* ---------------- Helpers ---------------- */

// function fmtDateTime(iso) {
//   try {
//     return new Date(iso).toLocaleString();
//   } catch {
//     return iso;
//   }
// }

// const extractMeetUrl = (text) => {
//   if (!text) return null;
//   const match = text.match(/https:\/\/meet\.google\.com\/[a-zA-Z0-9-]+/);
//   return match ? match[0] : null;
// };

// const isWithinMeetingTime = (appointment, duration = 30) => {
//   if (!appointment?.scheduled_time) return false;

//   const nowUtc = new Date(
//     new Date().toISOString()
//   ); // force UTC

//   const startUtc = new Date(
//     appointment.scheduled_time.endsWith("Z")
//       ? appointment.scheduled_time
//       : appointment.scheduled_time + "Z"
//   );

//   const endUtc = new Date(
//     startUtc.getTime() + duration * 60000
//   );

//   return nowUtc >= startUtc && nowUtc <= endUtc;
// };

// const meetingEnded = (appointment, duration = 30) => {
//   const start = new Date(appointment.scheduled_time);
//   const end = new Date(start.getTime() + duration * 60000);
//   return new Date() > end;
// };

// const canReschedule =
//   (appointment) =>
//     !appointment.started_at &&
//     !appointment.completed_at &&
//     meetingEnded(appointment);

// /* ---------------- Main ---------------- */

// export default function DoctorDashboard({ user }) {
//   const navigate = useNavigate();

//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [endDialog, setEndDialog] = useState(null);

//   /* -------- Navigation -------- */

//   const handleLogout = async () => {
//     await logout({ navigate });
//   };

//   const handleGoToProfile = () => {
//     navigate("/profile");
//   };

//   /* -------- API -------- */

//   const fetchAppointments = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await api.get("appointments/");
//       setAppointments(
//         Array.isArray(res.data) ? res.data : res.data.results || []
//       );
//     } catch (err) {
//       setError(err.response?.data || err.message || "Failed to load");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAppointments();
//   }, []);

//   /* -------- Filters -------- */

//   const myAppointments = useMemo(() => {
//     if (!user) return [];
//     return appointments.filter((a) => {
//       const docId = a.doctor?.user?.id ?? a.doctor?.id;
//       const myId = user.doctor_profile?.id ?? user.id;
//       return String(docId) === String(myId);
//     });
//   }, [appointments, user]);

//   const confirmedAppointments = useMemo(
//     () => myAppointments.filter((a) => a.status === "confirmed"),
//     [myAppointments]
//   );

//   const activeAppointments = useMemo(
//     () => myAppointments.filter((a) => a.status !== "cancelled"),
//     [myAppointments]
//   );

//   const upcoming = useMemo(() => {
//     const now = new Date();
//     return confirmedAppointments.filter(
//       (a) => a.scheduled_time && new Date(a.scheduled_time) > now
//     );
//   }, [confirmedAppointments]);

//   const todays = useMemo(() => {
//     const today = new Date().toDateString();
//     return confirmedAppointments.filter(
//       (a) =>
//         a.scheduled_time &&
//         new Date(a.scheduled_time).toDateString() === today
//     );
//   }, [confirmedAppointments]);

//   const uniquePatients = useMemo(() => {
//     const s = new Set();
//     myAppointments.forEach((a) => {
//       const pid = a.patient?.user?.id ?? a.patient?.id;
//       if (pid) s.add(String(pid));
//     });
//     return s.size;
//   }, [myAppointments]);

//   /* -------- Actions -------- */

//   const updateAppointmentStatus = async (id, status) => {
//     await api.patch(`appointments/${id}/`, { status });
//     fetchAppointments();
//   };

//   const openGoogleCalendar = (a) => {
//     const start = new Date(a.scheduled_time)
//       .toISOString()
//       .replace(/[-:]/g, "")
//       .split(".")[0];

//     const end = new Date(
//       new Date(a.scheduled_time).getTime() + 30 * 60000
//     )
//       .toISOString()
//       .replace(/[-:]/g, "")
//       .split(".")[0];

//     const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Doctor+Consultation&dates=${start}/${end}&location=Google+Meet`;
//     window.open(url, "_blank");
//   };

//   const sendMeetLink = async (a) => {
//     const link = window.prompt("Paste Google Meet link");
//     if (!link) return;
//     await api.post(`/appointments/${a.id}/set_meet_link/`, {
//       meet_link: link,
//     });
//     fetchAppointments();
//   };

//   const handleReschedule = async (appointment) => {
//   const newTime = window.prompt(
//     "Enter new date & time (YYYY-MM-DD HH:MM)",
//     ""
//   );

//   if (!newTime) return;

//   try {
//     // Convert to ISO (backend-friendly)
//     const isoTime = new Date(newTime.replace(" ", "T")).toISOString()

//     await api.post(`/appointments/${appointment.id}/reschedule/`, {
//       scheduled_time: isoTime,
//     });

//     fetchAppointments();
//   } catch (err) {
//     console.error("Reschedule failed", err);
//     alert("Failed to reschedule appointment");
//   }
// };

//   const markCompleted = async (a) => {
//     await api.post(`/appointments/${a.id}/complete_meet/`);
//     fetchAppointments();
//   };

//   /* -------- Props Bundles -------- */

//   const handlers = {
//     updateAppointmentStatus,
//     openGoogleCalendar,
//     sendMeetLink,
//     handleReschedule,
//     fetchAppointments,
//   };

//   const utils = {
//     fmtDateTime,
//     extractMeetUrl,
//     isWithinMeetingTime,
//     canReschedule,
//   };

//   /* -------- Render -------- */

//   return (
//     <>
//       <DoctorTopBar
//         user={user}
//         onProfile={handleGoToProfile}
//         onLogout={handleLogout}
//       />

//       <Container sx={{ mt: 4 }}>
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             mb: 2,
//           }}
//         >
//           <Typography variant="h4">Doctor Dashboard</Typography>
//           <Button
//             startIcon={<RefreshIcon />}
//             onClick={fetchAppointments}
//             disabled={loading}
//           >
//             Refresh
//           </Button>
//         </Box>

//         {error && (
//           <Typography color="error" sx={{ mb: 2 }}>
//             {String(error)}
//           </Typography>
//         )}

//         <DoctorStats
//           active={activeAppointments.length}
//           upcoming={upcoming.length}
//           today={todays.length}
//           patients={uniquePatients}
//         />

//         <AppointmentList
//           loading={loading}
//           appointments={activeAppointments}
//           handlers={handlers}
//           utils={utils}
//           setEndDialog={setEndDialog}
//         />
//       </Container>

//       <EndMeetingCard
//         appointment={endDialog}
//         onClose={() => setEndDialog(null)}
//         onComplete={async () => {
//           await markCompleted(endDialog);
//           setEndDialog(null);
//         }}
//         onReschedule={() => {
//           setEndDialog(null);
//           handleReschedule(endDialog);
//         }}
//       />
//     </>
//   );
// }




