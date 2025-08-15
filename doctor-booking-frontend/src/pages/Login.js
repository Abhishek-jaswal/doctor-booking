import React, { useState } from "react";
import api from "../services/api";

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    api
      .post("/auth/login", form)
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        // Decode token to extract user info if needed
        onLogin(res.data.token);
      })
      .catch((err) => {
        setError("Login failed: " + (err.response?.data?.message || "Error"));
      });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
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
      <button type="submit">Login</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default Login;
