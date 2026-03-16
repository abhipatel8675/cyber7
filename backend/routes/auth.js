const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// GET /auth/me – return current user (validates token)
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user._id.toString(),
      email: req.user.email,
      role: req.user.role,
      companyId: req.user.companyId || null,
    },
  });
});

// POST /auth/register – only allows creating 'user' role (admins are created separately)
router.post('/register', async (req, res) => {
  try {
    const { email, password, companyId } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (!companyId) {
      return res.status(400).json({ error: 'Company is required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashed,
      role: 'user',
      companyId: companyId || null,
    });
    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        companyId: user.companyId || null,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        companyId: user.companyId || null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
