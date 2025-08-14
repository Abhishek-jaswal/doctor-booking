import React, { useEffect, useState } from 'react';
import api from '../services/api';

function AppointmentDashboard({ patientId }) {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // You'll need a backend endpoint: GET /api/appointments?patientId=xx&status=
    // For brevity, suppose it exists
    api.get('/appointments', { params: { patientId, status } })
      .then(res => setAppointments(res.data));
  }, [patientId, status]);

  return (
    <div>
      <h2>Your Appointments</h2>
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="">All</option>
        <option value="booked">Booked</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <ul>
        {appointments.map(appt => (
          <li key={appt.id}>
            Slot: {appt.slot_id}, Status: {appt.status}
            {/* Add reschedule/cancel buttons here */}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default AppointmentDashboard;
