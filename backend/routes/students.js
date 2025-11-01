
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      class: studentClass,
      status,
      level
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (studentClass && studentClass !== 'all') {
      query.class = studentClass;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (level && level !== 'all') {
      query.level = level;
    }

    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الطلاب',
      error: error.message
    });
  }
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'الطالب غير موجود'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الطالب',
      error: error.message
    });
  }
});

// @desc    Create new student
// @route   POST /api/students
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    // Generate student ID
    const lastStudent = await Student.findOne().sort({ studentId: -1 });
    let newStudentId = 'S001';
    
    if (lastStudent && lastStudent.studentId) {
      const lastNumber = parseInt(lastStudent.studentId.substring(1));
      newStudentId = 'S' + String(lastNumber + 1).padStart(3, '0');
    }

    const studentData = {
      ...req.body,
      studentId: newStudentId
    };

    const student = await Student.create(studentData);

    res.status(201).json({
      success: true,
      message: 'تم إضافة الطالب بنجاح',
      data: student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مسجل مسبقاً'
      });
    }

    res.status(400).json({
      success: false,
      message: 'خطأ في إضافة الطالب',
      error: error.message
    });
  }
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'الطالب غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث بيانات الطالب بنجاح',
      data: student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مسجل مسبقاً'
      });
    }

    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث بيانات الطالب',
      error: error.message
    });
  }
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'الطالب غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف الطالب بنجاح',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الطالب',
      error: error.message
    });
  }
});

// @desc    Get students statistics
// @route   GET /api/students/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'نشط' });
    const studentsByClass = await Student.aggregate([
      {
        $group: {
          _id: '$class',
          count: { $sum: 1 }
        }
      }
    ]);
    const studentsByLevel = await Student.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        studentsByClass,
        studentsByLevel
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات',
      error: error.message
    });
  }
});

module.exports = router;
