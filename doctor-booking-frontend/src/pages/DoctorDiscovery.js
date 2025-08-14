import React, { useEffect, useState } from 'react';
import api from '../services/api';

function DoctorDiscovery() {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState('');
  const [mode, setMode] = useState('');

  // Fetch doctors on mount or filter change
  useEffect(() => {
    api.get('/doctors', {
      params: { specialization, mode }
    }).then(res => setDoctors(res.data));
  }, [specialization, mode]);

  return (
    <div>
      <h2>Doctors</h2>
      <input placeholder="Specialization" value={specialization} onChange={e => setSpecialization(e.target.value)} />
      <select value={mode} onChange={e => setMode(e.target.value)}>
        <option value="">All Modes</option>
        <option value="online">Online</option>
        <option value="in-person">In-person</option>
      </select>
      <ul>
        {doctors.map(doc => (
          <li key={doc.id}>
            Dr. {doc.doctor_name} ({doc.specialization}, {doc.mode})
            {/* Link to slot picker page */}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default DoctorDiscovery;
