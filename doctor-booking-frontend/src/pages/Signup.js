import React, { useState } from "react";
import api from "../services/api";

function Signup({ onSignup }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    api
      .post("/auth/signup", form)
      .then(() => {
        setMessage("Signup successful! Please log in.");
        onSignup();
      })
      .catch((err) => {
        setMessage("Signup failed: " + (err.response?.data?.message || "Error"));
      });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>
      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
      </select>
      <button type="submit">Sign Up</button>
      {message && <div style={{ color: "red" }}>{message}</div>}
    </form>
  );
}

export default Signup;
