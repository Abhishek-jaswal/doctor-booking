// Controllers to handle signup and login logic

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

// Register new user
export async function signup(req, res) {
  const { name, email, password, role } = req.body;

  try {
    // Hash the plain password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      [name, email, hashedPassword, role || 'patient']
    );

    res.status(201).json({ user: result.rows[0], message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // Unique violation (email)
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Signup failed due to server error' });
  }
}

// User login
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Get user from DB by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // Compare password hashes
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token with user id and role info
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed due to server error' });
  }
}
