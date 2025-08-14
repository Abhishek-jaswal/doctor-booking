import React, { useEffect, useState } from 'react';
import api from '../services/api';

function SlotPicker({ doctorId }) {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    api.get(`/doctors/${doctorId}/slots`).then(res => setSlots(res.data));
  }, [doctorId]);

  function handleLock(slotId) {
    api.post('/appointments/lock-slot', { slotId })
      .then(res => {
        setSelectedSlot(slotId);
        setLocked(true);
        alert('Slot locked for 5 min. Confirm booking now!');
      })
      .catch(() => alert('Slot unavailable'));
  }

  function handleConfirm() {
    // Replace with real patientId/doctorId from login/session in production
    api.post('/appointments/confirm', { patientId: 2, doctorId, slotId: selectedSlot })
      .then(res => alert('Booked!'))
      .catch(() => alert('Booking failed'));
  }

  return (
    <div>
      <h2>Available Slots</h2>
      <ul>
        {slots.map(slot => (
          <li key={slot.id}>
            {new Date(slot.start_time).toLocaleString()} -
            <button onClick={() => handleLock(slot.id)}>Lock Slot</button>
          </li>
        ))}
      </ul>
      {locked &&
        <button onClick={handleConfirm}>Confirm Booking (Mock OTP)</button>
      }
    </div>
  );
}
export default SlotPicker;
