import pool from '../config/db.js';

// Get available slots for a specific doctor
export async function getAvailableSlots(doctorId) {
  const query = `
    SELECT id, start_time, end_time
    FROM slots
    WHERE doctor_id = $1
      AND is_booked = FALSE
      AND (is_locked = FALSE OR locked_until < NOW())
    ORDER BY start_time ASC
    LIMIT 50
  `;
  const { rows } = await pool.query(query, [doctorId]);
  return rows;
}
