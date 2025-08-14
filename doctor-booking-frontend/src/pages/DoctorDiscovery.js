// src/pages/DoctorDiscovery.js
import React, { useEffect, useState } from "react";
import api from "../services/api";

function DoctorDiscovery({ onSelectDoctor }) {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState("");
  const [mode, setMode] = useState("");

  useEffect(() => {
    api
      .get("/doctors", {
        params: { specialization, mode },
      })
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error("Error fetching doctors", err));
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

export default DoctorDiscovery;
