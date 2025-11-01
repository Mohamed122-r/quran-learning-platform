const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  class: {
    type: String,
    required: true
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
    fatherName: String,
    motherName: String,
    parentPhone: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
