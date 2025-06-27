const mongoose = require('mongoose');

const UserCourseSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.ObjectId, required: true },
  course_id: { type: mongoose.Schema.ObjectId, required: true },
  order_id: { type: mongoose.Schema.ObjectId },
  status: { type: String, enum: ['active', 'expired'], default: 'active' },
  enrolledAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserCourse', UserCourseSchema);
