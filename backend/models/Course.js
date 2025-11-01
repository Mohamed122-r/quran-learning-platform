const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'اسم المقرر مطلوب'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'وصف المقرر مطلوب']
  },
  category: {
    type: String,
    required: [true, 'تصنيف المقرر مطلوب'],
    enum: ['القرآن الكريم', 'التجويد', 'الفقه', 'اللغة العربية', 'السيرة النبوية', 'العقيدة', 'الأخلاق']
  },
  level: {
    type: String,
    required: [true, 'مستوى المقرر مطلوب'],
    enum: ['مبتدئ', 'متوسط', 'متقدم']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'المعلم مطلوب']
  },
  duration: {
    type: Number,
    required: [true, 'مدة المقرر مطلوبة'],
    min: 1
  },
  price: {
    type: Number,
    required: [true, 'سعر المقرر مطلوب'],
    min: 0
  },
  schedule: {
    days: [{
      type: String,
      enum: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
    }],
    time: String
  },
  maxStudents: {
    type: Number,
    required: [true, 'الحد الأقصى للطلاب مطلوب'],
    min: 1
  },
  currentStudents: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['نشط', 'غير نشط', 'مكتمل'],
    default: 'نشط'
  },
  startDate: {
    type: Date,
    required: [true, 'تاريخ البدء مطلوب']
  },
  endDate: {
    type: Date,
    required: [true, 'تاريخ الانتهاء مطلوب']
  },
  requirements: [String],
  objectives: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for enrolled students
courseSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course'
});

// Virtual for course materials
courseSchema.virtual('materials', {
  ref: 'Material',
  localField: '_id',
  foreignField: 'course'
});

// Indexes
courseSchema.index({ courseCode: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ teacher: 1 });

// Middleware to update current students count
courseSchema.pre('save', function(next) {
  if (this.currentStudents > this.maxStudents) {
    next(new Error('عدد الطلاب المسجلين يتجاوز الحد الأقصى'));
  }
  next();
});

// Static method to get available courses
courseSchema.statics.getAvailable = function() {
  return this.find({ 
    status: 'نشط',
    currentStudents: { $lt: '$maxStudents' },
    startDate: { $gt: new Date() }
  });
};

module.exports = mongoose.model('Course', courseSchema);
