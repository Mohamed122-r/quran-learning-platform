const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
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
  examType: {
    type: String,
    required: [true, 'نوع الامتحان مطلوب'],
    enum: ['اختبار تحريري', 'اختبار شفوي', 'مشروع', 'مشاركة', 'حفظ']
  },
  title: {
    type: String,
    required: [true, 'عنوان التقييم مطلوب'],
    trim: true
  },
  score: {
    type: Number,
    required: [true, 'الدرجة مطلوبة'],
    min: 0,
    max: 100
  },
  maxScore: {
    type: Number,
    required: [true, 'الدرجة الكاملة مطلوبة'],
    default: 100
  },
  gradeDate: {
    type: Date,
    required: [true, 'تاريخ التقييم مطلوب'],
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'المقيم مطلوب']
  }
}, {
  timestamps: true
});

// Indexes
gradeSchema.index({ student: 1, course: 1 });
gradeSchema.index({ examType: 1 });
gradeSchema.index({ gradeDate: 1 });

// Virtual for percentage
gradeSchema.virtual('percentage').get(function() {
  return (this.score / this.maxScore) * 100;
});

// Virtual for letter grade
gradeSchema.virtual('letterGrade').get(function() {
  const percentage = this.percentage;
  if (percentage >= 90) return 'ممتاز';
  if (percentage >= 80) return 'جيد جداً';
  if (percentage >= 70) return 'جيد';
  if (percentage >= 60) return 'مقبول';
  return 'راسب';
});

// Static method to get student grades summary
gradeSchema.statics.getStudentSummary = function(studentId, courseId = null) {
  const matchStage = { student: mongoose.Types.ObjectId(studentId) };
  
  if (courseId) {
    matchStage.course = mongoose.Types.ObjectId(courseId);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$course',
        averageScore: { $avg: '$score' },
        totalExams: { $sum: 1 },
        lastExam: { $max: '$gradeDate' }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' }
  ]);
};

// Middleware to validate score
gradeSchema.pre('save', function(next) {
  if (this.score > this.maxScore) {
    next(new Error('الدرجة لا يمكن أن تتجاوز الدرجة الكاملة'));
  }
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);
