// src/pages/AppointmentDashboard.js
import React, { useEffect, useState } from "react";
import api from "../services/api";

function AppointmentDashboard({ patientId, onBack }) {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    api
      .get("/appointments", { params: { patientId, status } })
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error("Error fetching appointments", err));
  }, [patientId, status]);

  return (
    <div>
      <button onClick={onBack}>⬅ Back</button>
      <h2>Your Appointments</h2>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All</option>
        <option value="booked">Booked</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <ul>
        {appointments.map((appt) => (
          <li key={appt.id}>
            Slot ID: {appt.slot_id} | Status: {appt.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AppointmentDashboard;
