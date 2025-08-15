import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function SlotPicker({ doctorId, patientId, onBack }) {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (doctorId) {
      setLoading(true);
      setError("");
      api
        .get(`/doctors/${doctorId}/slots`)
        .then((res) => setSlots(res.data))
        .catch(() => setError("Unable to fetch slots"))
        .finally(() => setLoading(false));
    }
  }, [doctorId]);

  async function handleLock(slotId) {
    setError("");
    try {
      await api.post("/appointments/lock-slot", { slotId });
      setSelectedSlot(slotId);
      setLocked(true);
      alert("Slot locked for 5 minutes. Please confirm booking.");
    } catch {
      setError("Slot unavailable or already locked");
    }
  }

  async function handleConfirm() {
    if (!selectedSlot) return;
    setError("");
    try {
      await api.post("/appointments/confirm", {
        patientId,
        doctorId,
        slotId: selectedSlot,
      });
      alert("Booking confirmed!");
      setLocked(false);
      setSelectedSlot(null);
      onBack();
    } catch {
      setError("Booking failed");
    }
  }

  return (
    <div>
      <button onClick={onBack}>⬅ Back to Doctors</button>
      <h2>Available Slots</h2>

      {loading && <p>Loading slots...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {slots.map((slot) => (
          <li key={slot.id}>
            {new Date(slot.start_time).toLocaleString()}{" "}
            <button onClick={() => handleLock(slot.id)}>Lock Slot</button>
          </li>
        ))}
      </ul>

      {locked && (
        <button style={{ marginTop: 10 }} onClick={handleConfirm}>
          Confirm Booking (Mock OTP)
        </button>
      )}
    </div>
  );
}
