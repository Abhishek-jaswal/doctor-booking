import pool from '../config/db.js';
import { lockSlot, confirmBooking, releaseExpiredLocks } from '../models/appointmentModel.js';

// Lock slot API
export async function lockSlotController(req, res) {
  const { slotId } = req.body;

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
  const { patientId, doctorId, slotId } = req.body;

  try {
    const appointment = await confirmBooking(patientId, doctorId, slotId);
    if (!appointment) {
      return res.status(400).json({ message: 'Slot already booked, please choose another slot' });
    }
    res.json({ message: 'Booking confirmed', appointment });
  } catch (err) {
    console.error('Error confirming booking:', err);
    res.status(500).json({ message: 'Failed to confirm booking' });
  }
}

// Reschedule appointment (>24h check)
export async function rescheduleAppointmentController(req, res) {
  const appointmentId = parseInt(req.params.id);
  const { newSlotId } = req.body;

  try {
    // Check appointment
    const apptRes = await pool.query('SELECT * FROM appointments WHERE id = $1', [appointmentId]);
    if (apptRes.rows.length === 0) return res.status(404).json({ message: 'Appointment not found' });

    const appointment = apptRes.rows[0];

    // Get slot start time of current appointment
    const currentSlotRes = await pool.query('SELECT start_time FROM slots WHERE id = $1', [appointment.slot_id]);
    const currentSlot = currentSlotRes.rows[0];

    // Check if >24h before start_time
    const now = new Date();
    if (new Date(currentSlot.start_time) - now < 24 * 3600 * 1000) {
      return res.status(400).json({ message: 'Cannot reschedule less than 24 hours before appointment' });
    }

    await pool.query('BEGIN');

    // Release old slot
    await pool.query('UPDATE slots SET is_booked = FALSE WHERE id = $1', [appointment.slot_id]);

    // Book new slot
    const newSlotRes = await pool.query('SELECT * FROM slots WHERE id = $1 AND is_booked = FALSE', [newSlotId]);
    if (newSlotRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'New slot is already booked' });
    }

    await pool.query('UPDATE slots SET is_booked = TRUE WHERE id = $1', [newSlotId]);

    // Update appointment
    const updateAppointment = await pool.query(
      'UPDATE appointments SET slot_id = $1 WHERE id = $2 RETURNING *',
      [newSlotId, appointmentId]
    );

    await pool.query('COMMIT');
    res.json({ message: 'Appointment rescheduled', appointment: updateAppointment.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Reschedule error:', error);
    res.status(500).json({ message: 'Failed to reschedule appointment' });
  }
}

// Cancel appointment (>24h check)
export async function cancelAppointmentController(req, res) {
  const appointmentId = parseInt(req.params.id);

  try {
    const apptRes = await pool.query('SELECT * FROM appointments WHERE id = $1', [appointmentId]);
    if (apptRes.rows.length === 0) return res.status(404).json({ message: 'Appointment not found' });

    const appointment = apptRes.rows[0];

    // Get start time of slot
    const slotRes = await pool.query('SELECT start_time FROM slots WHERE id = $1', [appointment.slot_id]);
    const slot = slotRes.rows[0];

    // Check >24h
    const now = new Date();
    if (new Date(slot.start_time) - now < 24 * 3600 * 1000) {
      return res.status(400).json({ message: 'Cannot cancel less than 24 hours before appointment' });
    }

    await pool.query('BEGIN');

    // Update appointment status to cancelled
    await pool.query('UPDATE appointments SET status = $1 WHERE id = $2', ['cancelled', appointmentId]);

    // Release slot
    await pool.query('UPDATE slots SET is_booked = FALSE WHERE id = $1', [appointment.slot_id]);

    await pool.query('COMMIT');

    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Failed to cancel appointment' });
  }
}
