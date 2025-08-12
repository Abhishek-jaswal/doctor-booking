import { getDoctors } from '../models/doctorModel.js';
import { getAvailableSlots } from '../models/slotModel.js';

// Controller to handle doctor discovery with filters
export async function doctorDiscovery(req, res) {
  try {
    const filters = {
      specialization: req.query.specialization,
      mode: req.query.mode
    };
    const doctors = await getDoctors(filters);
    res.json(doctors);
  } catch (err) {
    console.error('Failed to get doctors:', err);
    res.status(500).json({ message: 'Server error fetching doctors' });
  }
}

// Controller to handle listing available slots for a doctor
export async function listSlots(req, res) {
  try {
    const doctorId = parseInt(req.params.doctorId);
    if (isNaN(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID' });
    }
    const slots = await getAvailableSlots(doctorId);
    res.json(slots);
  } catch (err) {
    console.error('Failed to get slots:', err);
    res.status(500).json({ message: 'Server error fetching slots' });
  }
}
