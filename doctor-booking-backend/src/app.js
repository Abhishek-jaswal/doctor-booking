// Main server file: Configures Express app and routes

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import doctorRoutes from './routes/doctor.js';
import appointmentRoutes from './routes/appointment.js';
import adminRoutes from './routes/admin.js';




import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

app.use(cors());                  // Enable Cross-Origin requests (allow frontend to connect)
app.use(express.json());          // Parse JSON request bodies

// Mount auth routes under /api/auth
app.use('/api/auth', authRoutes);

app.use('/api/doctors', doctorRoutes);

app.use('/api/appointments', appointmentRoutes);

app.use('/api/admin', adminRoutes);

// Simple root endpoint to check server running status
app.get('/', (req, res) => {
  res.send('Doctor Booking API is running');
});

// Start server on port specified in .env
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
