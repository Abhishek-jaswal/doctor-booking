import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function DoctorDiscovery({ onSelectDoctor }) {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDoctors() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/doctors", {
          params: specialization || mode ? { specialization, mode } : {},
        });
        setDoctors(res.data);
      } catch {
        setError("Failed to load doctors.");
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, [specialization, mode]);

  return (
    <div>
      <h2>Doctor Discovery</h2>
      <input
        placeholder="Specialization"
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
      />
      <select value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="">All Modes</option>
        <option value="online">Online</option>
        <option value="in-person">In-person</option>
      </select>

      {loading && <p>Loading doctors...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {doctors.map((doc) => (
          <li key={doc.id}>
            <strong>{doc.doctor_name}</strong> - {doc.specialization} ({doc.mode}){" "}
            <button onClick={() => onSelectDoctor(doc.id)}>View Slots</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
