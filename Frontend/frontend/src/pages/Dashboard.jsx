import React, { useEffect, useState } from "react";
import api from "../api/api";
import PatientDashboard from "./PatientDashboard";
import DoctorDashboard from "./DoctorDashboard";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await api.get("users/me/");
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (!user) return null;

  return (
    <>
      {user.is_patient && <PatientDashboard user={user} />}
      {user.is_doctor && <DoctorDashboard user={user} />}
    </>
  );
}
