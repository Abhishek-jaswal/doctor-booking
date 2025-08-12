import express from 'express';
import { doctorDiscovery, listSlots } from '../controllers/doctorController.js';

const router = express.Router();

// GET /api/doctors?specialization=cardio&mode=online
router.get('/', doctorDiscovery);

// GET /api/doctors/:doctorId/slots
router.get('/:doctorId/slots', listSlots);

export default router;
