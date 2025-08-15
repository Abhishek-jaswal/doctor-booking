// src/pages/AppointmentDashboard.js
import React, { useEffect, useState } from "react";
import api from "../services/api";

function AppointmentDashboard({ patientId, onBack }) {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState("");
  const [slotChoices, setSlotChoices] = useState({});
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    api
      .get("/appointments", { params: { patientId, status } })
      .then((res) => setAppointments(res.data))
      .catch(() => setAppointments([]));
  }, [patientId, status, refresh]);

  async function fetchSlots(doctorId) {
    const res = await api.get(`/doctors/${doctorId}/slots`);
    return res.data;
  }

  async function startReschedule(appt) {
    const choices = await fetchSlots(appt.doctor_id);
    setSlotChoices((s) => ({ ...s, [appt.id]: choices }));
  }

  async function confirmReschedule(apptId, doctorId, newSlotId) {
    await api.patch(`/appointments/${apptId}/reschedule`, { newSlotId });
    setSlotChoices((s) => { const { [apptId]: _, ...rest } = s; return rest; });
    setRefresh((r) => !r);
  }

  async function cancelAppt(apptId) {
    await api.patch(`/appointments/${apptId}/cancel`);
    setRefresh((r) => !r);
  }

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h3>My Appointments</h3>
      <label>
        Filter:
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="confirmed">Confirmed</option>
          <option value="canceled">Canceled</option>
        </select>
      </label>
      <ul>
        {appointments.map((appt) => (
          <li key={appt.id} style={{ marginBottom: 12 }}>
            {new Date(appt.start_time).toLocaleString()} — {appt.status}
            <span style={{ marginLeft: 12 }}>
              <button onClick={() => startReschedule(appt)}>Reschedule</button>
              <button onClick={() => cancelAppt(appt.id)} style={{ marginLeft: 6 }}>Cancel</button>
            </span>
            {slotChoices[appt.id] && (
              <span style={{ display: "block", marginTop: 8 }}>
                <select onChange={(e) => confirmReschedule(appt.id, appt.doctor_id, Number(e.target.value))}>
                  <option value="">Choose new slot</option>
                  {slotChoices[appt.id].map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.start_time).toLocaleString()}
                    </option>
                  ))}
                </select>
                <button
                  style={{ marginLeft: 6 }}
                  onClick={() => setSlotChoices((sc) => { const { [appt.id]: omit, ...rest } = sc; return rest; })}
                >
                  Cancel
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AppointmentDashboard;
