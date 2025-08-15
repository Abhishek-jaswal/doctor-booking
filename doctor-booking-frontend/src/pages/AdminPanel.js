import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function AdminPanel() {
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    mode: "online",
  });
  const [doctorMessage, setDoctorMessage] = useState("");

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [slotForm, setSlotForm] = useState({ start_time: "", end_time: "" });
  const [slotMessage, setSlotMessage] = useState("");

  useEffect(() => {
    api.get("/doctors").then((res) => setDoctors(res.data)).catch(() => setDoctors([]));
  }, []);

  function handleDoctorChange(e) {
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
  }
  function handleSlotChange(e) {
    setSlotForm({ ...slotForm, [e.target.name]: e.target.value });
  }

  async function submitDoctor(e) {
    e.preventDefault();
    setDoctorMessage("");
    try {
      await api.post("/admin/doctor", doctorForm);
      setDoctorMessage("Doctor added.");
      const res = await api.get("/doctors");
      setDoctors(res.data);
      setDoctorForm({ name: "", email: "", password: "", specialization: "", mode: "online" });
    } catch (e) {
      setDoctorMessage(e?.response?.data?.message || "Failed to add doctor");
    }
  }

  async function submitSlot(e) {
    e.preventDefault();
    setSlotMessage("");
    try {
      if (!selectedDoctorId) return setSlotMessage("Choose a doctor");
      await api.post(`/admin/doctor/${selectedDoctorId}/slot`, slotForm);
      setSlotMessage("Slot added.");
      setSlotForm({ start_time: "", end_time: "" });
    } catch (e) {
      setSlotMessage(e?.response?.data?.message || "Failed to add slot");
    }
  }

  return (
    <div>
      <h3>Admin Panel</h3>
      <form onSubmit={submitDoctor}>
        <h4>Add Doctor</h4>
        <input name="name" placeholder="Name" value={doctorForm.name} onChange={handleDoctorChange} required />
        <input name="email" type="email" placeholder="Email" value={doctorForm.email} onChange={handleDoctorChange} required />
        <input name="password" type="password" placeholder="Password" value={doctorForm.password} onChange={handleDoctorChange} required />
        <input name="specialization" placeholder="Specialization" value={doctorForm.specialization} onChange={handleDoctorChange} required />
        <select name="mode" value={doctorForm.mode} onChange={handleDoctorChange}>
          <option value="online">Online</option>
          <option value="in-person">In Person</option>
        </select>
        <button type="submit" style={{ marginLeft: 8 }}>Add Doctor</button>
        {doctorMessage && <p>{doctorMessage}</p>}
      </form>

      <hr />

      <form onSubmit={submitSlot}>
        <h4>Add Slot</h4>
        <label>
          Doctor:
          <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)}>
            <option value="">Select...</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.doctor_name} — {d.specialization}</option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: 8 }}>
          Start
          <input type="datetime-local" name="start_time" value={slotForm.start_time} onChange={handleSlotChange} required />
        </label>
        <label style={{ marginLeft: 8 }}>
          End
          <input type="datetime-local" name="end_time" value={slotForm.end_time} onChange={handleSlotChange} required />
        </label>
        <button type="submit" style={{ marginLeft: 8 }}>Add Slot</button>
        {slotMessage && <p>{slotMessage}</p>}
      </form>
    </div>
  );
}
