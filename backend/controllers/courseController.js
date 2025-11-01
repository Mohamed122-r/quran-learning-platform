const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
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

    res.status(200).json({
      success: true,
      count: courses.length,
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
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email phone specialization');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'المقرر غير موجود'
      });
    }

    res.status(200).json({
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
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
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
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
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

    res.status(200).json({
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
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'المقرر غير موجود'
      });
    }

    res.status(200).json({
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
};

// @desc    Get course details with enrollments and statistics
// @route   GET /api/courses/:id/details
// @access  Private
exports.getCourseDetails = async (req, res) => {
  try {
    const courseId = req.params.id;

    const [
      course,
      enrollments,
      attendance,
      grades
    ] = await Promise.all([
      Course.findById(courseId)
        .populate('teacher', 'name email phone specialization'),
      Enrollment.find({ course: courseId, status: 'مسجل' })
        .populate('student', 'name studentId class level'),
      Attendance.find({ course: courseId })
        .populate('student', 'name studentId')
        .sort({ date: -1 })
        .limit(20),
      Grade.find({ course: courseId })
        .populate('student', 'name studentId')
        .sort({ gradeDate: -1 })
        .limit(20)
    ]);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'المقرر غير موجود'
      });
    }

    // Calculate attendance statistics
    const attendanceStats = await Attendance.aggregate([
      { $match: { course: course._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate grade statistics
    const gradeStats = await Grade.aggregate([
      { $match: { course: course._id } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          lowestScore: { $min: '$score' },
          totalExams: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        course,
        enrollments,
        statistics: {
          totalStudents: enrollments.length,
          attendance: attendanceStats,
          grades: gradeStats.length > 0 ? gradeStats[0] : null
        },
        recentAttendance: attendance,
        recentGrades: grades
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تفاصيل المقرر',
      error: error.message
    });
  }
};

// @desc    Get available courses
// @route   GET /api/courses/available
// @access  Private
exports.getAvailableCourses = async (req, res) => {
  try {
    const availableCourses = await Course.find({ 
      status: 'نشط',
      currentStudents: { $lt: '$maxStudents' },
      startDate: { $gt: new Date() }
    }).populate('teacher', 'name specialization');

    res.status(200).json({
      success: true,
      count: availableCourses.length,
      data: availableCourses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المقررات المتاحة',
      error: error.message
    });
  }
};

// @desc    Get courses statistics
// @route   GET /api/courses/stats/overview
// @access  Private
exports.getCourseStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ status: 'نشط' });
    const coursesByCategory = await Course.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    const coursesByLevel = await Course.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        activeCourses,
        coursesByCategory,
        coursesByLevel
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات المقررات',
      error: error.message
    });
  }
};
