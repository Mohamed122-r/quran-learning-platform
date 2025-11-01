const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
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
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['مسجل', 'منتهي', 'ملغي', 'موقوف'],
    default: 'مسجل'
  },
  completionDate: {
    type: Date
  },
  finalGrade: {
    type: Number,
    min: 0,
    max: 100
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Indexes
enrollmentSchema.index({ enrollmentDate: 1 });
enrollmentSchema.index({ status: 1 });

// Static method to get active enrollments
enrollmentSchema.statics.getActiveEnrollments = function(studentId = null) {
  const query = { status: 'مسجل' };
  
  if (studentId) {
    query.student = studentId;
  }
  
  return this.find(query)
    .populate('student', 'name studentId class')
    .populate('course', 'title courseCode teacher schedule')
    .populate({
      path: 'course',
      populate: {
        path: 'teacher',
        select: 'name'
      }
    });
};

// Middleware to update course currentStudents count
enrollmentSchema.post('save', async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  
  if (course) {
    const enrollmentCount = await this.constructor.countDocuments({ 
      course: this.course, 
      status: 'مسجل' 
    });
    
    course.currentStudents = enrollmentCount;
    await course.save();
  }
});

// Middleware to update course currentStudents count on deletion
enrollmentSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Course = mongoose.model('Course');
    const course = await Course.findById(doc.course);
    
    if (course) {
      const enrollmentCount = await this.model.countDocuments({ 
        course: doc.course, 
        status: 'مسجل' 
      });
      
      course.currentStudents = enrollmentCount;
      await course.save();
    }
  }
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
