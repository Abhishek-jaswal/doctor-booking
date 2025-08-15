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
    <form onSubmit={handleSubmit}>
      <h3>Signup</h3>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      <br />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <br />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <br />
      <label>
        Role:
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
      </label>
      <br />
      <button type="submit">Sign Up</button>
      {message && <p style={{ color: message.includes("successful") ? "green" : "red" }}>{message}</p>}
    </form>
  );
}
