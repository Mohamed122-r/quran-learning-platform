
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
exports.getTeachers = async (req, res) => {
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

    res.status(200).json({
      success: true,
      count: teachers.length,
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
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
exports.getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'المعلم غير موجود'
      });
    }

    res.status(200).json({
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
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private/Admin
exports.createTeacher = async (req, res) => {
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
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private/Admin
exports.updateTeacher = async (req, res) => {
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

    res.status(200).json({
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
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'المعلم غير موجود'
      });
    }

    res.status(200).json({
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
};

// @desc    Get teacher dashboard
// @route   GET /api/teachers/:id/dashboard
// @access  Private
exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.params.id;

    const [
      teacher,
      courses,
      recentAttendance,
      recentGrades
    ] = await Promise.all([
      Teacher.findById(teacherId),
      Course.find({ teacher: teacherId, status: 'نشط' })
        .populate('teacher', 'name')
        .sort({ startDate: 1 }),
      Attendance.find({ recordedBy: teacherId })
        .populate('student', 'name studentId')
        .populate('course', 'title')
        .sort({ date: -1 })
        .limit(10),
      Grade.find({ gradedBy: teacherId })
        .populate('student', 'name studentId')
        .populate('course', 'title')
        .sort({ gradeDate: -1 })
        .limit(10)
    ]);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'المعلم غير موجود'
      });
    }

    // Calculate statistics
    const totalStudents = await Course.aggregate([
      { $match: { teacher: teacher._id } },
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments'
        }
      },
      {
        $unwind: '$enrollments'
      },
      {
        $match: {
          'enrollments.status': 'مسجل'
        }
      },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 }
        }
      }
    ]);

    const totalCourses = await Course.countDocuments({ 
      teacher: teacherId, 
      status: 'نشط' 
    });

    res.status(200).json({
      success: true,
      data: {
        teacher: teacher.getSummary(),
        stats: {
          totalCourses,
          totalStudents: totalStudents.length > 0 ? totalStudents[0].totalStudents : 0,
          activeCourses: courses.length
        },
        courses,
        recentAttendance,
        recentGrades
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات لوحة المعلم',
      error: error.message
    });
  }
};

// @desc    Get teachers statistics
// @route   GET /api/teachers/stats/overview
// @access  Private
exports.getTeacherStats = async (req, res) => {
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

    res.status(200).json({
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
};
