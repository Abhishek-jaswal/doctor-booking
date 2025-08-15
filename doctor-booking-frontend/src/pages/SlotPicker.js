import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function SlotPicker({ doctorId, patientId, onBack }) {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/doctors/${doctorId}/slots`);
        setSlots(res.data);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load slots");
      } finally {
        setLoading(false);
      }
    }
    if (doctorId) load();
  }, [doctorId]);

  async function handleLock(slotId) {
    setError("");
    try {
      await api.post("/appointments/lock-slot", { slotId });
      setSelectedSlot(slotId);
      setLocked(true);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to lock slot");
    }
  }

  async function handleConfirm() {
    setError("");
    try {
      await api.post("/appointments/confirm", {
        patientId,
        doctorId,
        slotId: selectedSlot,
      });
      alert("Appointment confirmed!");
      setLocked(false);
      setSelectedSlot(null);
      const res = await api.get(`/doctors/${doctorId}/slots`);
      setSlots(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to confirm booking");
    }
  }

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h3>Available Slots</h3>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {slots.map(slot => (
          <li key={slot.id}>
            {new Date(slot.start_time).toLocaleString()} — {new Date(slot.end_time).toLocaleString()}{" "}
            <button onClick={() => handleLock(slot.id)}>Lock</button>
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
