import pool from '../config/db.js';

// Get doctors with optional filters: specialization, mode
// Sort by earliest available slot start time
export async function getDoctors(filters) {
  const { specialization, mode } = filters;

  let baseQuery = `
    SELECT d.id, d.user_id, d.specialization, d.mode, u.name as doctor_name
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    WHERE 1=1
  `;

  const params = [];
  let count = 1;

  if (specialization) {
    baseQuery += ` AND d.specialization ILIKE $${count++}`;
    params.push(`%${specialization}%`);
  }

  if (mode) {
    baseQuery += ` AND (d.mode = $${count} OR d.mode = 'both')`;
    params.push(mode);
    count++;
  }

  // Order by soonest slot start time (join slots and get min start_time)
  baseQuery = `
    SELECT sub.*, min(s.start_time) AS next_available
    FROM (
      ${baseQuery}
    ) sub
    LEFT JOIN slots s ON s.doctor_id = sub.id AND s.is_booked = FALSE AND (s.is_locked = FALSE OR (s.locked_until < NOW()))
    GROUP BY sub.id, sub.user_id, sub.specialization, sub.mode, sub.doctor_name
    ORDER BY next_available NULLS LAST
    LIMIT 50
  `;

  const { rows } = await pool.query(baseQuery, params);
  return rows;
}
