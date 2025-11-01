const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'الطالب مطلوب']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'المقرر مطلوب']
  },
  date: {
    type: Date,
    required: [true, 'التاريخ مطلوب'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['حاضر', 'غائب', 'متأخر', 'إجازة'],
    default: 'حاضر'
  },
  notes: {
    type: String,
    trim: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'المسجل مطلوب']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

// Index for better query performance
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ course: 1 });

// Static method to get attendance by date range
attendanceSchema.statics.getByDateRange = function(startDate, endDate, courseId = null) {
  const query = {
    date: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (courseId) {
    query.course = courseId;
  }
  
  return this.find(query)
    .populate('student', 'name studentId class')
    .populate('course', 'title courseCode')
    .populate('recordedBy', 'name')
    .sort({ date: -1 });
};

// Static method to get student attendance summary
attendanceSchema.statics.getStudentSummary = function(studentId, courseId = null) {
  const matchStage = { student: mongoose.Types.ObjectId(studentId) };
  
  if (courseId) {
    matchStage.course = mongoose.Types.ObjectId(courseId);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Attendance', attendanceSchema);
