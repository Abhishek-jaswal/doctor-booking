import pool from '../config/db.js';
import { lockSlot, confirmBooking } from '../models/appointmentModel.js';


// Lock slot API
export async function lockSlotController(req, res) {
  const { slotId } = req.body || {};
  if (!slotId) return res.status(400).json({ message: 'slotId is required' });
  try {
    const lockedSlot = await lockSlot(slotId);
    if (!lockedSlot) {
      return res.status(400).json({ message: 'Slot is already locked or booked' });
    }
    res.json({ message: 'Slot locked for 5 minutes', slot: lockedSlot });
  } catch (err) {
    console.error('Error locking slot:', err);
    res.status(500).json({ message: 'Failed to lock slot' });
  }
}

// Confirm booking API (mock OTP step)
export async function confirmBookingController(req, res) {
  const { patientId, doctorId, slotId } = req.body || {};
  if (!patientId || !doctorId || !slotId) {
    return res.status(400).json({ message: 'patientId, doctorId and slotId are required' });
  }
  try {
    const appt = await confirmBooking(patientId, doctorId, slotId);
    res.status(201).json({ message: 'Appointment confirmed', appointment: appt });
  } catch (err) {
    console.error('Error confirming booking:', err);
    res.status(400).json({ message: err.message || 'Failed to confirm booking' });
  }
}
// Reschedule appointment (>24h check)
export async function rescheduleAppointmentController(req, res) {
  const apptId = parseInt(req.params.id, 10);
  const { newSlotId } = req.body || {};
  if (Number.isNaN(apptId) || !newSlotId) {
    return res.status(400).json({ message: 'Invalid appointment id or newSlotId' });
  }
  try {
    await pool.query('BEGIN');
    // Free current slot
    const { rows } = await pool.query('SELECT slot_id, doctor_id FROM appointments WHERE id = $1', [apptId]);
    if (!rows.length) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const { slot_id: oldSlotId, doctor_id: doctorId } = rows[0];
    await pool.query('UPDATE slots SET is_booked = FALSE WHERE id = $1', [oldSlotId]);
    // Book new slot
    const booked = await pool.query(
      `UPDATE slots SET is_booked = TRUE, is_locked = FALSE, locked_until = NULL
         WHERE id = $1 AND doctor_id = $2 AND is_booked = FALSE RETURNING id`,
      [newSlotId, doctorId]
    );
    if (!booked.rowCount) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'New slot not available' });
    }
    await pool.query('UPDATE appointments SET slot_id = $1 WHERE id = $2', [newSlotId, apptId]);
    await pool.query('COMMIT');
    res.json({ message: 'Appointment rescheduled' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error rescheduling:', err);
    res.status(500).json({ message: 'Failed to reschedule appointment' });
  }
}

//cancle appoinment
export async function cancelAppointmentController(req, res) {
  const apptId = parseInt(req.params.id, 10);
  if (Number.isNaN(apptId)) return res.status(400).json({ message: 'Invalid appointment id' });
  try {
    await pool.query('BEGIN');
    const { rows } = await pool.query('SELECT slot_id FROM appointments WHERE id = $1', [apptId]);
    if (!rows.length) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const slotId = rows[0].slot_id;
    await pool.query('UPDATE appointments SET status = $1 WHERE id = $2', ['canceled', apptId]);
    await pool.query('UPDATE slots SET is_booked = FALSE, is_locked = FALSE, locked_until = NULL WHERE id = $1', [slotId]);
    await pool.query('COMMIT');
    res.json({ message: 'Appointment canceled' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error canceling:', err);
    res.status(500).json({ message: 'Failed to cancel appointment' });
  }
}


// Get appointments for a patient, optionally filter by status
export async function listAppointmentsController(req, res) {
  const { patientId, status } = req.query || {};
  if (!patientId) return res.status(400).json({ message: 'patientId is required' });
  try {
    let query = `
      SELECT a.id, a.status, s.start_time, s.end_time, d.id as doctor_id
        FROM appointments a
        JOIN slots s ON a.slot_id = s.id
        JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = $1
    `;
    const params = [patientId];
    if (status) {
      params.push(status);
      query += ` AND a.status = $2`;
    }
    query += ` ORDER BY s.start_time DESC`;
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
}
