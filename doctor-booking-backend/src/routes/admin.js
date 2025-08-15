import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { addDoctor, addSlot } from '../controllers/adminController.js';

const router = express.Router();

router.post('/doctor', authenticateToken, requireAdmin, addDoctor);
router.post('/doctor/:doctorId/slot', authenticateToken, requireAdmin, addSlot);

export default router;
