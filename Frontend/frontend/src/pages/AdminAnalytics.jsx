import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Card, CardContent } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import api from "../api/api";

export default function AdminAnalytics() {
  const [patientsPerDoctor, setPatientsPerDoctor] = useState([]);
  const [appointmentsPerDay, setAppointmentsPerDay] = useState([]);

  const fetchPatientsPerDoctor = async () => {
    try {
      const res = await api.get("appointments/analytics/patients-per-doctor/");
      setPatientsPerDoctor(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointmentsPerDay = async () => {
    try {
      const res = await api.get("appointments/analytics/appointments-per-day/");
      const data = res.data.map((item) => ({
        date: item.date,
        count: item.count,
      }));
      setAppointmentsPerDay(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatientsPerDoctor();
    fetchAppointmentsPerDay();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Analytics
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Patients per Doctor
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={patientsPerDoctor}>
                  <XAxis dataKey="user__username" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="patient_count" fill="#1976d2" name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appointments per Day
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={appointmentsPerDay}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#ff5722" name="Appointments" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
