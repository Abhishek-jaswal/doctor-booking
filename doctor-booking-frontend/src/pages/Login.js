import React, { useState } from "react";
import api from "../services/api";

export default function Login({ onLogin, onGoSignup }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      onLogin(res.data.token);
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Login</h3>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <br />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <br />
      <button type="submit">Login</button>
      <button type="button" onClick={onGoSignup} style={{ marginLeft: 8 }}>Create account</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
