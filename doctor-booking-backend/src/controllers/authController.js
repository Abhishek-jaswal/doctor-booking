// Controllers to handle signup and login logic
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

// Register new user
export async function signup(req, res) {
  const { name, email, password, role = 'patient' } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const ins = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, role',
      [name, email, hashed, role]
    );
    const user = ins.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.status(201).json({ token });
  } catch (err) {
    console.error('Signup failed:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
}

// User login
export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  // Get user from DB by email
  try {
    const { rows } = await pool.query('SELECT id, password_hash, role FROM users WHERE email = $1', [email]);
    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = rows[0];
        // Compare password hashes
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
        // Create JWT token with user id and role info
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ message: 'Login failed due to server error' });
  }
}
