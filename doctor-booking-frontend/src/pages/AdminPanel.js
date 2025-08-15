import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function AdminPanel() {
  // Form state for adding doctor
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    mode: "online",
  });
  const [doctorMessage, setDoctorMessage] = useState("");

  // List of doctors to select for adding slots
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  
  // Form state for adding slots
  const [slotForm, setSlotForm] = useState({
    start_time: "",
    end_time: "",
  });
  const [slotMessage, setSlotMessage] = useState("");

  // Load doctors from backend for slot assignment
  useEffect(() => {
    api.get("/doctors")
      .then(res => setDoctors(res.data))
      .catch(() => setDoctors([]));
  }, []);

  // Handle doctor form input changes
  function handleDoctorChange(e) {
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
  }

  // Handle slot form input changes
  function handleSlotChange(e) {
    setSlotForm({ ...slotForm, [e.target.name]: e.target.value });
  }

  // Submit new doctor
  async function submitDoctor(e) {
    e.preventDefault();
    setDoctorMessage("");
    try {
      await api.post("/admin/doctor", doctorForm);
      setDoctorMessage("Doctor added successfully!");
      setDoctorForm({
        name: "",
        email: "",
        password: "",
        specialization: "",
        mode: "online",
      });
      // Reload doctors after adding new one
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch (err) {
      setDoctorMessage(err.response?.data?.message || "Failed to add doctor");
    }
  }

  // Submit new slot for selected doctor
  async function submitSlot(e) {
    e.preventDefault();
    setSlotMessage("");
    if (!selectedDoctorId) {
      setSlotMessage("Please select a doctor first");
      return;
    }
    try {
      await api.post(`/admin/doctor/${selectedDoctorId}/slot`, slotForm);
      setSlotMessage("Slot added successfully!");
      setSlotForm({ start_time: "", end_time: "" });
    } catch (err) {
      setSlotMessage(err.response?.data?.message || "Failed to add slot");
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Add Doctor</h2>
      <form onSubmit={submitDoctor}>
        <input
          name="name"
          placeholder="Name"
          value={doctorForm.name}
          onChange={handleDoctorChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={doctorForm.email}
          onChange={handleDoctorChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={doctorForm.password}
          onChange={handleDoctorChange}
          required
        />
        <input
          name="specialization"
          placeholder="Specialization"
          value={doctorForm.specialization}
          onChange={handleDoctorChange}
          required
        />
        <select name="mode" value={doctorForm.mode} onChange={handleDoctorChange}>
          <option value="online">Online</option>
          <option value="in-person">In-person</option>
          <option value="both">Both</option>
        </select>
        <button type="submit" style={{ marginTop: 10 }}>
          Add Doctor
        </button>
        {doctorMessage && <p>{doctorMessage}</p>}
      </form>

      <hr style={{ margin: "30px 0" }} />

      <h2>Add Slot for Doctor</h2>
      <select
        value={selectedDoctorId}
        onChange={(e) => setSelectedDoctorId(e.target.value)}
      >
        <option value="">Select Doctor</option>
        {doctors.map((doc) => (
          <option key={doc.id} value={doc.id}>
            Dr. {doc.doctor_name} - {doc.specialization}
          </option>
        ))}
      </select>
      <form onSubmit={submitSlot} style={{ marginTop: 20 }}>
        <label>
          Start Time:{" "}
          <input
            name="start_time"
            type="datetime-local"
            value={slotForm.start_time}
            onChange={handleSlotChange}
            required
          />
        </label>
        <label style={{ marginLeft: 20 }}>
          End Time:{" "}
          <input
            name="end_time"
            type="datetime-local"
            value={slotForm.end_time}
            onChange={handleSlotChange}
            required
          />
        </label>
        <button type="submit" style={{ marginLeft: 20 }}>
          Add Slot
        </button>
      </form>
      {slotMessage && <p>{slotMessage}</p>}
    </div>
  );
}
