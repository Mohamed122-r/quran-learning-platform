
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, admin, teacher } = require('../middleware/auth');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      level,
      status
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (level && level !== 'all') {
      query.level = level;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const courses = await Course.find(query)
      .populate('teacher', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: courses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات المقررات',
      error: error.message
    });
  }
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email phone specialization');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'المقرر غير موجود'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات المقرر',
      error: error.message
    });
  }
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    // Generate course code
    const lastCourse = await Course.findOne().sort({ courseCode: -1 });
    let newCourseCode = 'CRS001';
    
    if (lastCourse && lastCourse.courseCode) {
      const lastNumber = parseInt(lastCourse.courseCode.substring(3));
      newCourseCode = 'CRS' + String(lastNumber + 1).padStart(3, '0');
    }

    const courseData = {
      ...req.body,
      courseCode: newCourseCode
    };

    const course = await Course.create(courseData);
    await course.populate('teacher', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'تم إضافة المقرر بنجاح',
      data: course
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'كود المقرر مسجل مسبقاً'
      });
    }

    res.status(400).json({
      success: false,
      message: 'خطأ في إضافة المقرر',
      error: error.message
    });
  }
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('teacher', 'name email phone');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'المقرر غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث بيانات المقرر بنجاح',
      data: course
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'كود المقرر مسجل مسبقاً'
      });
    }

    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث بيانات المقرر',
      error: error.message
    });
  }
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'المقرر غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف المقرر بنجاح',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المقرر',
      error: error.message
    });
  }
});

// @desc    Get available courses
// @route   GET /api/courses/available
// @access  Private
router.get('/available', protect, async (req, res) => {
  try {
    const availableCourses = await Course.find({ 
      status: 'نشط',
      currentStudents: { $lt: '$maxStudents' },
      startDate: { $gt: new Date() }
    }).populate('teacher', 'name specialization');

    res.json({
      success: true,
      data: availableCourses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المقررات المتاحة',
      error: error.message
    });
  }
});

module.exports = router;
