import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// Add a new doctor
export async function addDoctor(req, res) {
  const { name, email, password, specialization, mode } = req.body || {};
  if (!name || !email || !password || !specialization || !mode) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const userRes = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id',
      [name, email, hashed, 'doctor']
    );
    const userId = userRes.rows[0].id;
    const doctorRes = await pool.query(
      'INSERT INTO doctors (user_id, specialization, mode) VALUES ($1,$2,$3) RETURNING *',
      [userId, specialization, mode]
    );
    res.status(201).json({ doctor: doctorRes.rows[0] });
  } catch (err) {
    console.error('Failed to add doctor:', err);
    res.status(500).json({ message: 'Failed to add doctor' });
  }
}

// Add a new slot for a doctor
export async function addSlot(req, res) {
  const doctorId = parseInt(req.params.doctorId, 10);
  const { start_time, end_time } = req.body || {};
  if (!doctorId || !start_time || !end_time) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    const slotRes = await pool.query(
      'INSERT INTO slots (doctor_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING *',
      [doctorId, start_time, end_time]
    );
    res.status(201).json({ slot: slotRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add slot' });
  }
}
