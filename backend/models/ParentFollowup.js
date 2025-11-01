
const mongoose = require('mongoose');

const parentFollowupSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'الطالب مطلوب']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ولي الأمر مطلوب']
  },
  type: {
    type: String,
    required: [true, 'نوع المتابعة مطلوب'],
    enum: ['اتصال هاتفي', 'رسالة نصية', 'اجتماع', 'تقرير أداء', 'تنبيه']
  },
  subject: {
    type: String,
    required: [true, 'موضوع المتابعة مطلوب'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'نص المتابعة مطلوب'],
    trim: true
  },
  priority: {
    type: String,
    enum: ['منخفض', 'متوسط', 'عالي', 'عاجل'],
    default: 'متوسط'
  },
  status: {
    type: String,
    enum: ['معلق', 'مكتمل', 'ملغي', 'مؤجل'],
    default: 'معلق'
  },
  scheduledDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  response: {
    type: String,
    trim: true
  },
  responseDate: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'المكلف بالمتابعة مطلوب']
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
parentFollowupSchema.index({ student: 1 });
parentFollowupSchema.index({ parent: 1 });
parentFollowupSchema.index({ assignedTo: 1 });
parentFollowupSchema.index({ status: 1 });
parentFollowupSchema.index({ priority: 1 });
parentFollowupSchema.index({ scheduledDate: 1 });
parentFollowupSchema.index({ createdAt: -1 });

// Virtual for followup age
parentFollowupSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Static method to get overdue followups
parentFollowupSchema.statics.getOverdue = function() {
  return this.find({
    status: 'معلق',
    scheduledDate: { $lt: new Date() }
  }).populate('student', 'name studentId class')
    .populate('assignedTo', 'name');
};

// Static method to get followups by student
parentFollowupSchema.statics.getByStudent = function(studentId) {
  return this.find({ student: studentId })
    .populate('assignedTo', 'name')
    .sort({ createdAt: -1 });
};

// Static method to get followup statistics
parentFollowupSchema.statics.getStatistics = function(teacherId = null) {
  const matchStage = {};
  if (teacherId) {
    matchStage.assignedTo = mongoose.Types.ObjectId(teacherId);
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        highPriority: {
          $sum: {
            $cond: [{ $eq: ['$priority', 'عالي'] }, 1, 0]
          }
        },
        urgent: {
          $sum: {
            $cond: [{ $eq: ['$priority', 'عاجل'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('ParentFollowup', parentFollowupSchema);
