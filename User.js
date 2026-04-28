// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:      { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3 },
  password:      { type: String, required: true, minlength: 6 },
  name:          { type: String, required: true, trim: true },
  role:          { type: String, enum: ['student', 'teacher'], default: 'student' },
  class:         { type: String, default: 'Class 9' },     // for students
  subject:       { type: String },                          // for teachers (e.g. 'Science')
  assignedClass: { type: String, default: 'Class 9' },     // for teachers: the class they teach
  createdAt:     { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
