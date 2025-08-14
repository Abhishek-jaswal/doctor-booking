// src/pages/SlotPicker.js
import React, { useEffect, useState } from "react";
import api from "../services/api";

function SlotPicker({ doctorId, onBack }) {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (doctorId) {
      api
        .get(`/doctors/${doctorId}/slots`)
        .then((res) => setSlots(res.data))
        .catch((err) => console.error("Error fetching slots", err));
    }
  }, [doctorId]);

  function handleLock(slotId) {
    api
      .post("/appointments/lock-slot", { slotId })
      .then(() => {
        setSelectedSlot(slotId);
        setLocked(true);
        alert("Slot locked for 5 minutes. Please confirm booking.");
      })
      .catch(() => alert("Slot unavailable"));
  }

  function handleConfirm() {
    // For testing: hardcode patientId=2 (must exist in DB)
    api
      .post("/appointments/confirm", {
        patientId: 2,
        doctorId,
        slotId: selectedSlot,
      })
      .then(() => alert("Booking confirmed!"))
      .catch(() => alert("Booking failed"));
  }

  return (
    <div>
      <button onClick={onBack}>⬅ Back to Doctors</button>
      <h2>Available Slots</h2>
      <ul>
        {slots.map((slot) => (
          <li key={slot.id}>
            {new Date(slot.start_time).toLocaleString()}
            {" - "}
            <button onClick={() => handleLock(slot.id)}>Lock Slot</button>
          </li>
        ))}
      </ul>

      {locked && (
        <button style={{ marginTop: "10px" }} onClick={handleConfirm}>
          Confirm Booking (Mock OTP)
        </button>
      )}
    </div>
  );
}

export default SlotPicker;
