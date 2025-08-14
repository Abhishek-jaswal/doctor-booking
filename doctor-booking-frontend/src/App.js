// src/App.js
import React, { useState } from "react";
import DoctorDiscovery from "./pages/DoctorDiscovery";
import SlotPicker from "./pages/SlotPicker";
import AppointmentDashboard from "./pages/AppointmentDashboard";
import "./App.css";

function App() {
  const [view, setView] = useState("doctors");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // Hardcoded patientId for testing — in real app, from login
  const patientId = 2;

  return (
    <div className="App">
      <h1>Doctor Booking Platform</h1>

      {view === "doctors" && (
        <>
          <DoctorDiscovery
            onSelectDoctor={(id) => {
              setSelectedDoctorId(id);
              setView("slots");
            }}
          />
          <button style={{ marginTop: "20px" }} onClick={() => setView("dashboard")}>
            View My Appointments
          </button>
        </>
      )}

      {view === "slots" && (
        <SlotPicker
          doctorId={selectedDoctorId}
          onBack={() => setView("doctors")}
        />
      )}

      {view === "dashboard" && (
        <AppointmentDashboard
          patientId={patientId}
          onBack={() => setView("doctors")}
        />
      )}
    </div>
  );
}

export default App;
