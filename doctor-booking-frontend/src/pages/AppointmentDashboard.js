// src/pages/AppointmentDashboard.js
import React, { useEffect, useState } from "react";
import api from "../services/api";

function AppointmentDashboard({ patientId, onBack }) {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState("");
  const [slotChoices, setSlotChoices] = useState({}); // for reschedule slot selection
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    api
      .get("/appointments", { params: { patientId, status } })
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error("Error fetching appointments", err));
  }, [patientId, status, refresh]);

  // Handler to cancel an appointment
  function cancelAppointment(id) {
    if (!window.confirm("Are you sure you want to cancel?")) return;
    api
      .patch(`/appointments/${id}/cancel`)
      .then(() => {
        alert("Appointment cancelled");
        setRefresh(r => !r);
      })
      .catch(() => alert("Cannot cancel (maybe within 24h or already cancelled)"));
  }

  // Handler: Choose another slot and reschedule
  function handleReschedule(id, doctorId) {
    // Fetch available slots for this doctor
    api.get(`/doctors/${doctorId}/slots`)
      .then(res => setSlotChoices(sc => ({ ...sc, [id]: res.data })))
      .catch(() => alert("No slots available for rescheduling"));
  }

  // Handler: Actually perform reschedule API call
  function submitReschedule(id, newSlotId) {
    api.patch(`/appointments/${id}/reschedule`, { newSlotId })
      .then(() => {
        alert("Appointment rescheduled!");
        setSlotChoices(sc => { const { [id]: omit, ...rest } = sc; return rest; });
        setRefresh(r => !r);
      })
      .catch(() => alert("Could not reschedule (slot taken or within 24h)"));
  }

  return (
    <div>
      <button onClick={onBack}>⬅ Back</button>
      <h2>Your Appointments</h2>

   <select value={status} onChange={e => setStatus(e.target.value)}>
  <option value="">All</option>
  <option value="booked">Booked</option>
  <option value="completed">Completed</option>
  <option value="cancelled">Cancelled</option>
</select>


      <ul>
        {appointments.map(appt => (
          <li key={appt.id} style={{ marginBottom: "10px" }}>
            Dr. {appt.doctor_name} –{" "}
            {new Date(appt.start_time).toLocaleString()} | Status: {appt.status}
            {" "}
            {appt.status === "booked" && (
              <>
                <button onClick={() => cancelAppointment(appt.id)}>Cancel</button>
                <button onClick={() => handleReschedule(appt.id, appt.doctor_id)}>Reschedule</button>
              </>
            )}
            {/* Slot Picker for Reschedule */}
            {slotChoices[appt.id] && (
              <span>
                <br />Choose New Slot:{" "}
                <select
                  onChange={e => submitReschedule(appt.id, e.target.value)}
                  defaultValue="">
                  <option value="" disabled>
                    --Select--
                  </option>
                  {slotChoices[appt.id].map(slot => (
                    <option value={slot.id} key={slot.id}>
                      {new Date(slot.start_time).toLocaleString()}
                    </option>
                  ))}
                </select>
                <button onClick={
                  () => setSlotChoices(sc => { const { [appt.id]: omit, ...rest } = sc; return rest; })
                }>
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
