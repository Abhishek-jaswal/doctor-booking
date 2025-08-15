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
    <div>
      <h3>Find a Doctor</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <input placeholder="Specialization" value={specialization} onChange={e => setSpecialization(e.target.value)} />
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option value="">Any mode</option>
          <option value="online">Online</option>
          <option value="in-person">In Person</option>
        </select>
        <button onClick={fetchDoctors}>Search</button>
      </div>
      {loading && <p>Loading doctors...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {doctors.map(doc => (
          <li key={doc.id}>
            <strong>{doc.doctor_name}</strong> — {doc.specialization} ({doc.mode}){" "}
            <button onClick={() => onSelectDoctor(doc.id)}>View Slots</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
