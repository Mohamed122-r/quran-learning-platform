
const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const { protect, admin } = require('../middleware/auth');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      specialization,
      status
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { teacherId: { $regex: search, $options: 'i' } }
      ];
    }

    if (specialization && specialization !== 'all') {
      query.specialization = specialization;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const teachers = await Teacher.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Teacher.countDocuments(query);

    res.json({
      success: true,
      data: teachers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات المعلمين',
      error: error.message
    });
  }
});

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'المعلم غير موجود'
      });
    }

    res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات المعلم',
      error: error.message
    });
  }
});

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    // Generate teacher ID
    const lastTeacher = await Teacher.findOne().sort({ teacherId: -1 });
    let newTeacherId = 'T001';
    
    if (lastTeacher && lastTeacher.teacherId) {
      const lastNumber = parseInt(lastTeacher.teacherId.substring(1));
      newTeacherId = 'T' + String(lastNumber + 1).padStart(3, '0');
    }

    const teacherData = {
      ...req.body,
      teacherId: newTeacherId
    };

    const teacher = await Teacher.create(teacherData);

    res.status(201).json({
      success: true,
      message: 'تم إضافة المعلم بنجاح',
      data: teacher
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
      message: 'خطأ في إضافة المعلم',
      error: error.message
    });
  }
});

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'المعلم غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث بيانات المعلم بنجاح',
      data: teacher
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
      message: 'خطأ في تحديث بيانات المعلم',
      error: error.message
    });
  }
});

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'المعلم غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف المعلم بنجاح',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المعلم',
      error: error.message
    });
  }
});

// @desc    Get teachers statistics
// @route   GET /api/teachers/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const totalTeachers = await Teacher.countDocuments();
    const activeTeachers = await Teacher.countDocuments({ status: 'نشط' });
    const teachersBySpecialization = await Teacher.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalTeachers,
        activeTeachers,
        teachersBySpecialization
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات المعلمين',
      error: error.message
    });
  }
});

module.exports = router;
