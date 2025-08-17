import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function DoctorDiscovery({ onSelectDoctor }) {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchDoctors() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/doctors", { params: { specialization, mode } });
      setDoctors(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDoctors(); }, []);

  return (
    <div className="doctor-discovery">
      <h3>Find a Doctor</h3>
      <div className="filters">
        <input
          placeholder="Specialization"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        />
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="">Any mode</option>
          <option value="online">Online</option>
          <option value="in-person">In Person</option>
        </select>
        <button onClick={fetchDoctors}>Search</button>
      </div>
      {loading && <p className="loading">Loading doctors...</p>}
      {error && <p className="error">{error}</p>}
      <ul className="doctor-list">
        {doctors.map((doc) => (
          <li key={doc.id} className="doctor-card">
            <div>
              <strong>{doc.doctor_name}</strong> <br />
              <span>{doc.specialization} ({doc.mode})</span>
            </div>
            <button
              className="view-btn"
              onClick={() => onSelectDoctor(doc.id)}
            >
              View Slots
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
