// ═══════════════════════════════════════
// VidyaAI Backend — server.js
// ═══════════════════════════════════════
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ── Middleware ──
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many login attempts. Please wait 1 minute.' }
});

// ── Routes ──
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/users', require('./middleware/auth'), require('./routes/users'));
app.use('/api/quiz', require('./middleware/auth'), require('./routes/quiz'));
app.use('/api/teacher',
  require('./middleware/auth'),
  require('./middleware/teacherOnly'),
  require('./routes/teacher')
);

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ VidyaAI API running on http://localhost:${PORT}`);
});

module.exports = app;
