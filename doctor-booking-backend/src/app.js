// Main server file: Configures Express app and routes
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import doctorRoutes from './routes/doctor.js';
import appointmentRoutes from './routes/appointment.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import { releaseExpiredLocks } from './models/appointmentModel.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: ["https://doctor-booking-sigma.vercel.app"], // 👈 your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (_req, res) => {
  res.send('Doctor Booking API is running');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Background job: periodically release expired slot locks
setInterval(async () => {
  try {
    await releaseExpiredLocks();
  } catch (e) {
    console.error('Failed releasing expired locks:', e);
  }
}, 60 * 1000); // every 1 minute

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
