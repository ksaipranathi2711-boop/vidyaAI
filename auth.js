// routes/auth.js — Login & Register (username + password, no OTP)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── REGISTER (Student) ──
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, className } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password and name are required.' });
    }
    if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    if (!/^[a-z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores.' });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Username already taken. Please choose another.' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      username: username.toLowerCase(),
      password: hashed,
      name,
      class: className || 'Class 9',
      role: 'student',
    });

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, name: user.name, class: user.class, role: 'student' }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── LOGIN (Student or Teacher — username + password) ──
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Incorrect username or password.' });

    // Role check: if logging in as teacher, verify role
    if (role === 'teacher' && user.role !== 'teacher') {
      return res.status(403).json({ error: 'This account is not registered as a teacher.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Incorrect username or password.' });

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        class: user.class,
        role: user.role,
        subject: user.subject || null,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── GET CURRENT USER ──
// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

module.exports = router;
