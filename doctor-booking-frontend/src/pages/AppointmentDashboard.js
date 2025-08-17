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
    <div className="dashboard-container">
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 className="dashboard-title">My Appointments</h2>

      <div className="filter-container">
        <label className="filter-label">
          Filter:
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="canceled">Canceled</option>
          </select>
        </label>
      </div>

      <ul className="appointment-list">
        {appointments.map((appt) => (
          <li key={appt.id} className="appointment-card">
            <div className="appointment-info">
              <span className="appointment-time">
                {new Date(appt.start_time).toLocaleString()}
              </span>
              <span className={`appointment-status ${appt.status}`}>
                {appt.status}
              </span>
            </div>
            <div className="appointment-actions">
              <button
                className="btn-secondary"
                onClick={() => startReschedule(appt)}
              >
                Reschedule
              </button>
              <button
                className="btn-danger"
                onClick={() => cancelAppt(appt.id)}
              >
                Cancel
              </button>
            </div>

            {slotChoices[appt.id] && (
              <div className="reschedule-box">
                <select
                  className="slot-select"
                  onChange={(e) =>
                    confirmReschedule(appt.id, appt.doctor_id, Number(e.target.value))
                  }
                >
                  <option value="">Choose new slot</option>
                  {slotChoices[appt.id].map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.start_time).toLocaleString()}
                    </option>
                  ))}
                </select>
                <button
                  className="btn-cancel-choice"
                  onClick={() =>
                    setSlotChoices((sc) => {
                      const { [appt.id]: omit, ...rest } = sc;
                      return rest;
                    })
                  }
                >
                  Cancel
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AppointmentDashboard;
