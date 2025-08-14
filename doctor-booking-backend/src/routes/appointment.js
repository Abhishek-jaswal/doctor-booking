import express from 'express';
import {
  lockSlotController,
  confirmBookingController,
  rescheduleAppointmentController,
  cancelAppointmentController
} from '../controllers/appointmentController.js';

const router = express.Router();

// POST /api/appointments/lock-slot
router.post('/lock-slot', lockSlotController);

// POST /api/appointments/confirm
router.post('/confirm', confirmBookingController);

// PATCH /api/appointments/:id/reschedule
router.patch('/:id/reschedule', rescheduleAppointmentController);

// PATCH /api/appointments/:id/cancel
router.patch('/:id/cancel', cancelAppointmentController);

export default router;
