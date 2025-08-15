import React, { useState } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DoctorDiscovery from "./pages/DoctorDiscovery";
import SlotPicker from "./pages/SlotPicker";
import AppointmentDashboard from "./pages/AppointmentDashboard";
import "./App.css";

function App() {
  // Read token from localStorage to persist login across reloads
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [page, setPage] = useState("login");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // Decode JWT (very basic, production apps use a library)
  function getUserIdFromToken() {
    if (!token) return null;
    try {
      const base = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base)).id;
    } catch (_) {
      return null;
    }
  }
  const patientId = getUserIdFromToken();

  // Log out user
  function logout() {
    setToken("");
    localStorage.removeItem("token");
    setPage("login");
  }

  if (!token) {
    return page === "login" ? (
      <div>
        <Login
          onLogin={(jwt) => { setToken(jwt); setPage("doctors"); }}
        />
        <button onClick={() => setPage("signup")}>Go to Signup</button>
      </div>
    ) : (
      <div>
        <Signup
          onSignup={() => setPage("login")}
        />
        <button onClick={() => setPage("login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Doctor Booking Platform</h1>
      <button style={{ float: "right" }} onClick={logout}>Logout</button>

      {page === "doctors" && (
        <>
          <DoctorDiscovery
            onSelectDoctor={(id) => {
              setSelectedDoctorId(id);
              setPage("slots");
            }}
          />
          <button style={{ marginTop: "20px" }} onClick={() => setPage("dashboard")}>
            View My Appointments
          </button>
        </>
      )}
      {page === "slots" && (
        <SlotPicker
          doctorId={selectedDoctorId}
          onBack={() => setPage("doctors")}
        />
      )}
      {page === "dashboard" && (
        <AppointmentDashboard
          patientId={patientId}
          onBack={() => setPage("doctors")}
        />
      )}
    </div>
  );
}

export default App;
