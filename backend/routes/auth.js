const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const { verifyCompanyByIdAndRecId, verifyEmailInCompany } = require('../lib/connectwise');

const router = express.Router();

// GET /auth/me – return current user (validates token)
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user._id.toString(),
      email: req.user.email,
      name: req.user.name || null,
      role: req.user.role,
      companyId: req.user.companyId || null,
    },
  });
});

// POST /auth/register – only allows creating 'user' role (admins are created separately)
router.post('/register', async (req, res) => {
  try {
    const { email, password, companyId, companyRecId, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (!companyId || !companyRecId) {
      return res.status(400).json({ error: 'Company ID and Company RecID are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Verify the Company ID + RecID pair matches a real ConnectWise company.
    // Admin distributes these values out-of-band — prevents enumeration of companies.
    let resolvedIdentifier = null;
    try {
      resolvedIdentifier = await verifyCompanyByIdAndRecId(companyId.trim(), companyRecId);
    } catch (cwErr) {
      console.error('CW company verification failed:', cwErr.message);
      return res.status(502).json({ error: 'Could not verify company. Try again.' });
    }
    if (!resolvedIdentifier) {
      return res.status(403).json({ error: 'Invalid Company ID or Company RecID.' });
    }

    // Verify the email belongs to a contact within that ConnectWise company.
    let belongsToCompany = false;
    try {
      belongsToCompany = await verifyEmailInCompany(email.toLowerCase(), resolvedIdentifier);
    } catch (cwErr) {
      console.error('CW email verification failed:', cwErr.message);
      return res.status(502).json({ error: 'Could not verify company membership. Try again.' });
    }
    if (!belongsToCompany) {
      return res.status(403).json({
        error: 'This email is not registered as a contact in the specified company.',
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashed,
      name: name ? name.trim() : null,
      role: 'user',
      companyId: resolvedIdentifier,
      companyRecId: Number(companyRecId),
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
        name: user.name || null,
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
        name: user.name || null,
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
