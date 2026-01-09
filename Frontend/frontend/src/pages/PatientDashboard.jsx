
import React, { useEffect, useMemo, useState } from "react";
import { logout, ensureCsrf } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Container, Typography, Grid,
  Button, IconButton
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TodayIcon from "@mui/icons-material/Today";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";

import api from "../api/api";
import SnackbarMessage from "../components/SnackbarMessage";

import StatCard from "../components/patient/StatCard";
import DoctorSection from "../components/patient/DoctorSection";
import UpcomingAppointments from "../components/patient/UpcomingAppointments";
import RecentAppointments from "../components/patient/RecentAppointments";
import BookingDialog from "../components/patient/BookingDialog";



export default function PatientDashboard({ user }) {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState(null);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [scheduledAtLocal, setScheduledAtLocal] = useState("");
  const [reason, setReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const patientUserId = user?.id;

    useEffect(() => {
      ensureCsrf().catch(() => {
      
    });
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fmtDateTime = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const handleLogout = async () => {
    await logout({ navigate });
  };

  const handleGoToProfile = () => {
    navigate("/profile");
  };


  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await api.get("/appointments/doctors/");
      const raw = Array.isArray(res.data) ? res.data : res.data.results || [];
      setDoctors(raw);
    } catch {
      setSnackbar({ open: true, message: "Failed to load doctors", severity: "error" });
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAppointments = async () => {
    setLoadingAppts(true);
    try {
      const res = await api.get("/appointments/");
      setAppointments(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      setSnackbar({ open: true, message: "Failed to load appointments", severity: "error" });
    } finally {
      setLoadingAppts(false);
    }
  };

 
  const openBooking = (doctor) => setBookingDoctor(doctor);

  const closeBooking = () => {
    setBookingDoctor(null);
    setScheduledAtLocal("");
    setReason("");
  };

  const handleBookAppointment = async (doctorId) => {
    setBookingLoading(true);
    try {
      await api.post("/appointments/", {
        doctor_id: doctorId,
        scheduled_time: new Date(scheduledAtLocal || Date.now()).toISOString(),
        reason,
      });
      setSnackbar({ open: true, message: "Appointment booked!", severity: "success" });
      closeBooking();
      fetchAppointments();
    } catch {
      setSnackbar({ open: true, message: "Booking failed", severity: "error" });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = async (apptId) => {
    setCancelling(true);
    try {
      await api.delete(`/appointments/${apptId}/`);
      setSnackbar({ open: true, message: "Appointment cancelled", severity: "success" });
      fetchAppointments();
    } catch {
      setSnackbar({ open: true, message: "Cancel failed", severity: "error" });
    } finally {
      setCancelling(false);
    }
  };

  const myAppointments = useMemo(() => {
    return appointments.filter(
      (a) => String(a.patient?.user?.id) === String(patientUserId)
    );
  }, [appointments, patientUserId]);

  const confirmed = myAppointments.filter(a => a.status === "confirmed");
  const upcoming = confirmed.filter(a => new Date(a.scheduled_time) > new Date());
  const past = confirmed.filter(a => new Date(a.scheduled_time) <= new Date());

  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  const filteredDoctors = doctors.filter(d => {
    if (specializationFilter && d.specialization !== specializationFilter) return false;
    if (!search) return true;
    return `${d.first_name} ${d.last_name}`.toLowerCase().includes(search.toLowerCase());
  });


  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: "flex-end" }}>
          <Button startIcon={<AccountCircleIcon />} onClick={handleGoToProfile}>
            {user?.first_name || "Profile"}
          </Button>
          <IconButton onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}><StatCard title="Total" value={myAppointments.length} icon={<EventAvailableIcon />} /></Grid>
          <Grid item xs={12} md={3}><StatCard title="Confirmed" value={confirmed.length} icon={<CalendarTodayIcon />} /></Grid>
          <Grid item xs={12} md={3}><StatCard title="Pending" value={myAppointments.filter(a=>a.status==="requested").length} icon={<TodayIcon />} /></Grid>
          <Grid item xs={12} md={3}><StatCard title="Rejected" value={myAppointments.filter(a=>a.status!=="confirmed").length} icon={<CancelIcon />} /></Grid>
          <Grid item xs={12} md={3}><StatCard title="Doctors" value={doctors.length} icon={<PersonIcon />} /></Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <DoctorSection
              doctors={doctors}
              filteredDoctors={filteredDoctors}
              loadingDoctors={loadingDoctors}
              search={search}
              setSearch={setSearch}
              specializations={specializations}
              specializationFilter={specializationFilter}
              setSpecializationFilter={setSpecializationFilter}
              fetchDoctors={fetchDoctors}
              openBooking={openBooking}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <UpcomingAppointments
              loadingAppts={loadingAppts}
              upcoming={upcoming}
              fetchAppointments={fetchAppointments}
              fmtDateTime={fmtDateTime}
              handleCancelAppointment={handleCancelAppointment}
              cancelling={cancelling}
            />
            <RecentAppointments past={past} fmtDateTime={fmtDateTime} />
          </Grid>
        </Grid>

        <BookingDialog
          bookingDoctor={bookingDoctor}
          scheduledAtLocal={scheduledAtLocal}
          setScheduledAtLocal={setScheduledAtLocal}
          reason={reason}
          setReason={setReason}
          bookingLoading={bookingLoading}
          closeBooking={closeBooking}
          handleBookAppointment={handleBookAppointment}
        />

        <SnackbarMessage {...snackbar} handleClose={() => setSnackbar(s => ({ ...s, open: false }))} />
      </Container>
    </>
  );
}


