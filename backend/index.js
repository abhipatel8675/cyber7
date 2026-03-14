// Load .env: project root first, then backend folder (backend/.env overrides)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const alertsRoutes = require('./routes/alerts');
const { fetchCompaniesFromConnectWise } = require('./lib/connectwise');

const PORT = process.env.BACKEND_PORT || process.env.PORT || 3001;
const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cyber7';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/alerts', alertsRoutes);

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Cyber7 API is running' });
});

app.get('/companies', async (req, res) => {
  try {
    const companies = await fetchCompaniesFromConnectWise();
    res.json(companies);
  } catch (err) {
    console.error('Companies fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to load companies' });
  }
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    console.log('  POST /auth/register  – register');
    console.log('  POST /auth/login    – login');
    console.log('  GET  /alerts        – alerts (Bearer token required)');
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
