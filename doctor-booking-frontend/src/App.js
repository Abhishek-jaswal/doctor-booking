import React, { useState } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DoctorDiscovery from "./pages/DoctorDiscovery";
import SlotPicker from "./pages/SlotPicker";
import AppointmentDashboard from "./pages/AppointmentDashboard";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [page, setPage] = useState(token ? "doctors" : "login");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // Simple JWT decode helper to extract user ID
  function getUserId() {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  }
  const patientId = getUserId();

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setPage("login");
  }

  if (!token) {
    return (
      <>
        {page === "login" ? (
          <>
            <Login onLogin={(tok) => { setToken(tok); setPage("doctors"); }} />
            <p>
              Don't have an account?{" "}
              <button onClick={() => setPage("signup")}>Signup</button>
            </p>
          </>
        ) : (
          <>
            <Signup onSignup={() => setPage("login")} />
            <p>
              Have an account?{" "}
              <button onClick={() => setPage("login")}>Login</button>
            </p>
          </>
        )}
      </>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Doctor Booking Platform</h1>
        <button onClick={logout}>Logout</button>
      </div>

      {page === "doctors" && (
        <>
          <DoctorDiscovery
            onSelectDoctor={(id) => {
              setSelectedDoctorId(id);
              setPage("slots");
            }}
          />
          <button onClick={() => setPage("dashboard")} style={{ marginTop: 20 }}>
            View My Appointments
          </button>
        </>
      )}

      {page === "slots" && (
        <SlotPicker doctorId={selectedDoctorId} patientId={patientId} onBack={() => setPage("doctors")} />
      )}

      {page === "dashboard" && (
        <AppointmentDashboard patientId={patientId} onBack={() => setPage("doctors")} />
      )}
    </div>
  );
}
