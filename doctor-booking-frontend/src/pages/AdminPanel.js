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
    <div className="admin-container">
      <h2 className="admin-title">Admin Panel</h2>

      <form onSubmit={submitDoctor} className="admin-form">
        <h3 className="form-title">Add Doctor</h3>
        <input name="name" placeholder="Name" value={doctorForm.name} onChange={handleDoctorChange} required className="form-input" />
        <input name="email" type="email" placeholder="Email" value={doctorForm.email} onChange={handleDoctorChange} required className="form-input" />
        <input name="password" type="password" placeholder="Password" value={doctorForm.password} onChange={handleDoctorChange} required className="form-input" />
        <input name="specialization" placeholder="Specialization" value={doctorForm.specialization} onChange={handleDoctorChange} required className="form-input" />
        <select name="mode" value={doctorForm.mode} onChange={handleDoctorChange} className="form-input">
          <option value="online">Online</option>
          <option value="in-person">In Person</option>
        </select>
        <button type="submit" className="btn-primary">Add Doctor</button>
        {doctorMessage && <p className="form-message">{doctorMessage}</p>}
      </form>

      <form onSubmit={submitSlot} className="admin-form">
        <h3 className="form-title">Add Slot</h3>
        <label className="form-label">
          Doctor:
          <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)} className="form-input">
            <option value="">Select...</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.doctor_name} — {d.specialization}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Start
          <input type="datetime-local" name="start_time" value={slotForm.start_time} onChange={handleSlotChange} required className="form-input" />
        </label>
        <label className="form-label">
          End
          <input type="datetime-local" name="end_time" value={slotForm.end_time} onChange={handleSlotChange} required className="form-input" />
        </label>
        <button type="submit" className="btn-primary">Add Slot</button>
        {slotMessage && <p className="form-message">{slotMessage}</p>}
      </form>
    </div>
  );
}
