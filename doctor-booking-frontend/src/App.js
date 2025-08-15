import React, { useState } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DoctorDiscovery from "./pages/DoctorDiscovery";
import SlotPicker from "./pages/SlotPicker";
import AppointmentDashboard from "./pages/AppointmentDashboard";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [page, setPage] = useState(token ? "doctors" : "login");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  function getUserInfo() {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload; // { id, role, iat, exp }
    } catch {
      return null;
    }
  }
  const userInfo = getUserInfo();
  const patientId = userInfo?.id;
  const userRole = userInfo?.role;

  function handleLogin(tok) {
    localStorage.setItem("token", tok);
    setToken(tok);
    setPage("doctors");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setPage("login");
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Doctor Booking</h2>
        <nav style={{ display: "flex", gap: 10 }}>
          {token && <button onClick={() => setPage("doctors")}>Find Doctors</button>}
          {token && <button onClick={() => setPage("dashboard")}>My Appointments</button>}
          {token && userRole === "admin" && <button onClick={() => setPage("admin")}>Admin</button>}
          {!token && <button onClick={() => setPage("login")}>Login</button>}
          {!token && <button onClick={() => setPage("signup")}>Signup</button>}
          {token && <button onClick={handleLogout}>Logout</button>}
        </nav>
      </header>
      <hr/>

      {page === "login" && <Login onLogin={handleLogin} onGoSignup={() => setPage("signup")} />}
      {page === "signup" && <Signup onSignup={() => setPage("login")} />}

      {page === "doctors" && (
        <DoctorDiscovery
          onSelectDoctor={(id) => { setSelectedDoctorId(id); setPage("slots"); }}
        />
      )}
      {page === "slots" && (
        <SlotPicker
          doctorId={selectedDoctorId}
          patientId={patientId}
          onBack={() => setPage("doctors")}
        />
      )}
      {page === "dashboard" && (
        <AppointmentDashboard
          patientId={patientId}
          onBack={() => setPage("doctors")}
        />
      )}
      {page === "admin" && userRole === "admin" && (
        <AdminPanel />
      )}
    </div>
  );
}
