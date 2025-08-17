import React, { useState } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DoctorDiscovery from "./pages/DoctorDiscovery";
import SlotPicker from "./pages/SlotPicker";
import AppointmentDashboard from "./pages/AppointmentDashboard";
import AdminPanel from "./pages/AdminPanel";
import "./App.css"; 

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [page, setPage] = useState(token ? "doctors" : "login");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  function getUserInfo() {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
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
    <div className="app-container">
      {/* ---------- HEADER ---------- */}
      <header className="app-header">
        <h2 className="app-title">Doctor Booking</h2>

        {/* Navigation Menu */}
        <nav className="navbar">
          {token && (
            <>
              <button
                onClick={() => setPage("doctors")}
                className={`nav-button ${page === "doctors" ? "active" : ""}`}
              >
                Find Doctors
              </button>

              <button
                onClick={() => setPage("dashboard")}
                className={`nav-button ${page === "dashboard" ? "active" : ""}`}
              >
                My Appointments
              </button>

              {userRole === "admin" && (
                <button
                  onClick={() => setPage("admin")}
                  className={`nav-button ${page === "admin" ? "active" : ""}`}
                >
                  Admin
                </button>
              )}

              <button onClick={handleLogout} className="nav-button logout">
                Logout
              </button>
            </>
          )}

          {!token && (
            <>
              <button
                onClick={() => setPage("login")}
                className={`nav-button ${page === "login" ? "active" : ""}`}
              >
                Login
              </button>

              <button
                onClick={() => setPage("signup")}
                className={`nav-button ${page === "signup" ? "active" : ""}`}
              >
                Signup
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Divider */}
      <hr className="divider" />

      {/* ---------- PAGE CONTENT ---------- */}
      <div className="page-container">
        {page === "login" && (
          <Login onLogin={handleLogin} onGoSignup={() => setPage("signup")} />
        )}

        {page === "signup" && <Signup onSignup={() => setPage("login")} />}

        {page === "doctors" && (
          <DoctorDiscovery
            onSelectDoctor={(id) => {
              setSelectedDoctorId(id);
              setPage("slots");
            }}
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

        {page === "admin" && userRole === "admin" && <AdminPanel />}
      </div>
    </div>
  );
}
