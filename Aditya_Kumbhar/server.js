// ============================================
// Salon Management API - Server
// Node.js + Express + JWT + Bcrypt + Supabase
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const requestLogger = require('./middleware/logger');
const authRoutes = require('./routes/authRoutes');
const salonRoutes = require('./routes/salonRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Global Middleware ----------
app.use(cors());
app.use(express.json());
app.use(requestLogger); // logs method, path, timestamp for every request

// ---------- Welcome Route ----------
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Salon APIs' });
});

// ---------- Routes ----------
app.use('/', authRoutes);           // /register, /login
app.use('/salons', salonRoutes);    // /salons, /salons/:id, /salons/:id/services, etc.
app.use('/services', serviceRoutes); // /services/available, /services/:id

// ---------- 404 Handler ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ---------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Salon Management API running on http://localhost:${PORT}`);
});
