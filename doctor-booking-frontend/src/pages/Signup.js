import React, { useState } from "react";
import api from "../services/api";



export default function Signup({ onSignup }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "patient" });
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/auth/signup", form);
      setMessage("Signup successful. You can login now.");
      onSignup?.();
    } catch (err) {
      setMessage(err?.response?.data?.message || "Signup failed");
    }
  }

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h3 className="signup-title">Create an Account</h3>
        <input
          className="signup-input"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="signup-input"
          name="email"
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="signup-input"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <label className="signup-label">
          Role:
          <select className="signup-select" name="role" value={form.role} onChange={handleChange}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </label>
        <button type="submit" className="signup-btn">Sign Up</button>
        {message && (
          <p className={`signup-message ${message.includes("successful") ? "success" : "error"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
