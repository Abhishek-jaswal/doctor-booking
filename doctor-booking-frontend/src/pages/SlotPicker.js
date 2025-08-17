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
    <div className="slot-picker">
      <button className="back-btn" onClick={onBack}>← Back</button>
      <h3>Available Slots</h3>
      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}
      <ul className="slot-list">
        {slots.map((slot) => (
          <li
            key={slot.id}
            className={`slot-card ${selectedSlot === slot.id ? "selected" : ""}`}
          >
            <span>
              {new Date(slot.start_time).toLocaleString()} —{" "}
              {new Date(slot.end_time).toLocaleString()}
            </span>
            <button
              className="lock-btn"
              onClick={() => handleLock(slot.id)}
              disabled={locked && selectedSlot === slot.id}
            >
              {locked && selectedSlot === slot.id ? "Locked" : "Lock"}
            </button>
          </li>
        ))}
      </ul>
      {locked && (
        <button className="confirm-btn" onClick={handleConfirm}>
          Confirm Booking (Mock OTP)
        </button>
      )}
    </div>
  );
}
