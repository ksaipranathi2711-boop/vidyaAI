// middleware/teacherOnly.js — Restricts routes to teachers only
module.exports = function teacherOnly(req, res, next) {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({
      error: 'Access denied. This section is restricted to registered teachers only.',
      code: 'TEACHER_ONLY'
    });
  }
  next();
};
