import pool from '../config/db.js';

export async function lockSlot(slotId) {
  const query = `
    UPDATE slots
       SET is_locked = TRUE,
           locked_until = NOW() + INTERVAL '5 minutes'
     WHERE id = $1
       AND (is_locked = FALSE OR locked_until < NOW())
       AND is_booked = FALSE
  RETURNING *;
  `;
  const { rows } = await pool.query(query, [slotId]);
  return rows[0];
}

export async function confirmBooking(patientId, doctorId, slotId) {
  try {
    await pool.query('BEGIN');
    // Mark slot as booked
    const slotRes = await pool.query(
      `UPDATE slots
          SET is_booked = TRUE,
              is_locked = FALSE,
              locked_until = NULL
        WHERE id = $1
          AND doctor_id = $2
          AND is_booked = FALSE
      RETURNING id`,
      [slotId, doctorId]
    );
    if (!slotRes.rowCount) {
      throw new Error('Slot not available');
    }
    // Create appointment
    const apptRes = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, slot_id, status)
       VALUES ($1,$2,$3,'confirmed') RETURNING *`,
      [patientId, doctorId, slotId]
    );
    await pool.query('COMMIT');
    return apptRes.rows[0];
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

export async function releaseExpiredLocks() {
  const query = `
    UPDATE slots
       SET is_locked = FALSE, locked_until = NULL
     WHERE is_locked = TRUE AND locked_until < NOW();
  `;
  await pool.query(query);
}
