// routes/teacher.js — Teacher-only dashboard APIs
// Requires: auth middleware + teacherOnly middleware
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');
const Progress = require('../models/Progress');

// ── GET TEACHER'S STUDENTS (only students assigned to THIS teacher's class) ──
// GET /api/teacher/students
router.get('/students', async (req, res) => {
  try {
    const teacher = await User.findById(req.user.userId);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found.' });

    // Find students in this teacher's class
    const students = await User.find({
      role: 'student',
      class: teacher.assignedClass || 'Class 9'
    }).select('-password').lean();

    // Enrich with performance data
    const enriched = await Promise.all(students.map(async (s) => {
      const results = await QuizResult.find({ userId: s._id }).lean();
      const progress = await Progress.findOne({ userId: s._id }).lean();
      const avgScore = results.length
        ? Math.round(results.reduce((sum, r) => sum + r.pct, 0) / results.length)
        : 0;
      return {
        ...s,
        avgScore,
        quizzesTaken: results.length,
        labsCompleted: progress?.labsCompleted || 0,
        status: avgScore >= 70 ? 'on-track' : avgScore >= 50 ? 'needs-help' : 'gap',
      };
    }));

    res.json({ students: enriched, teacher: { name: teacher.name, class: teacher.assignedClass } });
  } catch (err) {
    console.error('Teacher students error:', err);
    res.status(500).json({ error: 'Failed to load student data.' });
  }
});

// ── GET CLASS ANALYTICS ──
// GET /api/teacher/analytics
router.get('/analytics', async (req, res) => {
  try {
    const teacher = await User.findById(req.user.userId);
    const students = await User.find({ role: 'student', class: teacher.assignedClass || 'Class 9' });
    const userIds = students.map(s => s._id);
    const results = await QuizResult.find({ userId: { $in: userIds } }).lean();

    const classAvg = results.length
      ? Math.round(results.reduce((sum, r) => sum + r.pct, 0) / results.length)
      : 0;

    const atRisk = students.filter(async (s) => {
      const r = await QuizResult.find({ userId: s._id });
      const avg = r.length ? r.reduce((sum, x) => sum + x.pct, 0) / r.length : 0;
      return avg < 50;
    });

    res.json({
      classAvg,
      totalStudents: students.length,
      atRiskCount: atRisk.length,
      totalQuizAttempts: results.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load analytics.' });
  }
});

// ── NOTIFY STUDENT ──
// POST /api/teacher/notify/:userId
router.post('/notify/:userId', async (req, res) => {
  try {
    const { message } = req.body;
    const student = await User.findById(req.params.userId);
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    // In production: send email/SMS/push notification
    console.log(`📧 Notification sent to ${student.name}: ${message || 'Please review your weak areas.'}`);
    res.json({ success: true, message: `Notification sent to ${student.name}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send notification.' });
  }
});

module.exports = router;
