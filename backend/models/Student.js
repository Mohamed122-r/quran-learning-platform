const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'اسم الطالب مطلوب'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'البريد الإلكتروني غير صحيح']
  },
  phone: {
    type: String,
    trim: true
  },
  class: {
    type: String,
    required: [true, 'الصف الدراسي مطلوب'],
    enum: ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع']
  },
  level: {
    type: String,
    enum: ['مبتدئ', 'متوسط', 'متقدم'],
    default: 'مبتدئ'
  },
  status: {
    type: String,
    enum: ['نشط', 'غير نشط', 'موقوف'],
    default: 'نشط'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  parentInfo: {
    fatherName: {
      type: String,
      trim: true
    },
    motherName: {
      type: String,
      trim: true
    },
    parentPhone: {
      type: String,
      trim: true
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for attendance records
studentSchema.virtual('attendance', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'student'
});

// Virtual for grades
studentSchema.virtual('grades', {
  ref: 'Grade',
  localField: '_id',
  foreignField: 'student'
});

// Index for better search performance
studentSchema.index({ name: 'text', email: 'text' });
studentSchema.index({ studentId: 1 });
studentSchema.index({ class: 1 });
studentSchema.index({ status: 1 });

// Static method to get students by class
studentSchema.statics.getByClass = function(class) {
  return this.find({ class, status: 'نشط' }).sort({ name: 1 });
};

// Instance method to get student summary
studentSchema.methods.getSummary = function() {
  return {
    id: this.studentId,
    name: this.name,
    class: this.class,
    level: this.level,
    status: this.status,
    joinDate: this.joinDate
  };
};

module.exports = mongoose.model('Student', studentSchema);
